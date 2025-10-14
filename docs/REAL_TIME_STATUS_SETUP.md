# HMS Real-Time Status Management System

This document explains how to set up and use the automated status management system for the Hackathon Management System (HMS).

## Overview

The HMS now includes a comprehensive real-time status management system that automatically updates hackathon and registration statuses based on dates and deadlines. This ensures that users always see accurate, up-to-date information about event phases, registration periods, and payment deadlines.

## Key Features

✅ **Automatic Status Updates**: Hackathons automatically transition between phases based on dates
✅ **Real-Time Registration Status**: User registrations show live status based on hackathon timeline  
✅ **Smart Deadline Detection**: Automatic alerts for upcoming deadlines
✅ **Background Processing**: Status updates happen automatically without user interaction
✅ **Manual Override**: Administrators can manually trigger updates when needed
✅ **Comprehensive Logging**: Full audit trail of status changes

## Status Types

### Hackathon Status Flow
```
Planning → Registration Open → Registration Closed → Active → Completed
                    ↓
                Cancelled (manual)
```

### Registration Status Flow  
```
Registered → Payment Pending → Confirmed → Expired
     ↓              ↓              ↓
Registration Closed (if deadline passed)
```

## Required Libraries & Dependencies

### Core Dependencies (Already Installed)
- **Next.js 14+**: Main framework
- **React 18+**: UI framework  
- **MongoDB/Mongoose**: Database and ODM
- **TypeScript**: Type safety

### Time Management Libraries
```bash
# For advanced date manipulation (optional but recommended)
npm install date-fns
# OR
npm install moment
# OR  
npm install dayjs

# For timezone handling (if needed)
npm install date-fns-tz
```

### Scheduling Libraries (Choose One)

#### Option 1: Vercel Cron Jobs (Recommended for Vercel deployment)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-statuses",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

#### Option 2: Node-Cron (For self-hosted deployments)
```bash
npm install node-cron
npm install @types/node-cron
```

#### Option 3: External Services
- **GitHub Actions**: Free scheduled workflows
- **AWS EventBridge**: Enterprise scheduling
- **Google Cloud Scheduler**: Google Cloud integration
- **Zapier/Make**: No-code automation

### Background Processing Libraries
```bash
# For advanced background tasks
npm install bull redis  # Queue-based processing
npm install node-schedule  # Local scheduling
```

### Monitoring & Logging Libraries
```bash
npm install winston  # Advanced logging
npm install @sentry/nextjs  # Error tracking
```

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local`:

```env
# Required for scheduling
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your app URL
CRON_SECRET=your_secret_key_here  # For webhook security

# Optional: Advanced features
ENABLE_AUTO_STATUS_UPDATES=true
STATUS_UPDATE_INTERVAL=300000  # 5 minutes in milliseconds
ENABLE_DEADLINE_NOTIFICATIONS=true
```

### 2. Database Indexes (Recommended)
Add these indexes for better performance:

```javascript
// In MongoDB
db.hackathons.createIndex({ "startDate": 1, "endDate": 1, "registrationDeadline": 1 })
db.registrations.createIndex({ "user": 1, "hackathon": 1, "registrationDate": 1 })
db.registrations.createIndex({ "paymentStatus": 1, "status": 1 })
```

### 3. Deployment Configuration

#### For Vercel:
1. Create `vercel.json` in your project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/update-statuses", 
      "schedule": "*/15 * * * *"
    }
  ]
}
```

2. Create the cron endpoint at `app/api/cron/update-statuses/route.ts`:
```typescript
import { NextRequest } from 'next/server'
import { handleScheduledWebhook } from '@/lib/scheduling-utils'

export async function POST(request: NextRequest) {
  const result = await handleScheduledWebhook(request, process.env.CRON_SECRET)
  return Response.json(result)
}
```

#### For Self-Hosted:
Add to your server startup script:
```javascript
// server.js or similar
const cron = require('node-cron')
const { runScheduledStatusUpdate } = require('./lib/scheduling-utils')

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('Running scheduled status update...')
  const result = await runScheduledStatusUpdate()
  console.log('Update result:', result)
})
```

### 4. Testing the System

#### Manual Testing:
1. Visit the student dashboard
2. Look for the "Live Updates" indicator
3. Check that statuses update based on hackathon dates
4. Test deadline alerts appear for upcoming events

#### API Testing:
```bash
# Test hackathon status updates
curl -X POST http://localhost:3000/api/hackathons/update-statuses

# Test registration status updates  
curl -X POST http://localhost:3000/api/registrations/update-statuses

# Preview what would be updated
curl -X GET http://localhost:3000/api/hackathons/update-statuses
curl -X GET http://localhost:3000/api/registrations/update-statuses
```

## Usage in Components

### Using Real-Time Status Hooks
```typescript
import { useHackathonStatus, useRegistrationStatus } from '@/hooks/use-live-status'

function HackathonCard({ hackathon }) {
  const status = useHackathonStatus(hackathon)
  
  return (
    <div>
      <Badge className={getStatusBadgeColor(status.status)}>
        {status.status}
      </Badge>
      {status.canRegister && <Button>Register Now</Button>}
      {status.timeRemaining && <span>Time left: {status.timeRemaining}</span>}
    </div>
  )
}
```

### Adding Background Updates
```typescript
import { BackgroundStatusUpdater } from '@/components/background-status-updater'

function Dashboard() {
  return (
    <div>
      <BackgroundStatusUpdater 
        updateInterval={5 * 60 * 1000}  // 5 minutes
        enabled={true}
      />
      {/* Your dashboard content */}
    </div>
  )
}
```

## Monitoring & Maintenance

### Health Checks
```typescript
import { getSchedulingHealthCheck } from '@/lib/scheduling-utils'

const health = getSchedulingHealthCheck()
console.log('System status:', health.status)
```

### Logs to Monitor
- Status update frequency and success rate
- Database query performance
- Failed update attempts
- Deadline notification delivery

### Performance Considerations
- Status updates run every 5-15 minutes by default
- Database queries are optimized with indexes
- Client-side updates happen every 1 minute
- Consider caching for high-traffic scenarios

## Troubleshooting

### Common Issues

1. **Statuses not updating**: 
   - Check if background updater is running
   - Verify API endpoints are accessible
   - Check database connection

2. **Incorrect status calculations**:
   - Verify hackathon dates are set correctly
   - Check timezone settings
   - Ensure date formats are consistent

3. **Performance issues**:
   - Add database indexes
   - Reduce update frequency
   - Enable query caching

### Debug Mode
Set `NODE_ENV=development` to see detailed logs:
```bash
🔄 Updated 3 hackathon statuses automatically
📊 Registration status update: 5 items processed
⏰ Next update scheduled in 15 minutes
```

## Customization

### Adjusting Update Frequency
```typescript
// More frequent for high-activity periods
<BackgroundStatusUpdater updateInterval={2 * 60 * 1000} />

// Less frequent for stable periods  
<BackgroundStatusUpdater updateInterval={30 * 60 * 1000} />
```

### Custom Status Logic
Modify `lib/status-utils.ts` to add custom status rules:
```typescript
// Add custom phase for "Early Bird" registration
if (daysUntilRegistrationDeadline > 30) {
  status = "Early Bird Registration"
  canRegister = true
}
```

### Integration with External Systems
The scheduling utilities can be extended to:
- Send email notifications
- Update external calendars  
- Sync with payment systems
- Generate automated reports

## Security Considerations

- Use `CRON_SECRET` for webhook authentication
- Validate all date inputs
- Rate limit status update APIs  
- Monitor for suspicious activity
- Use HTTPS in production

This system provides a robust foundation for real-time hackathon management that scales with your needs.