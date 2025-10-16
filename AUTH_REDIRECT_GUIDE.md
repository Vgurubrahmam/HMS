# Authentication Redirect Implementation

This implementation ensures that pages automatically redirect to the home page when there's no authentication token in localStorage.

## 🛡️ How It Works

### 1. Custom Hook: `useRequireAuth`

```tsx
import { useRequireAuth } from '@/hooks/use-auth-redirect'

export default function ProtectedPage() {
  // This will automatically redirect to home if no token is found
  useRequireAuth(['coordinator']) // Optional: specify allowed roles
  
  // Rest of your component
}
```

### 2. Token Validation

The hook checks for tokens in multiple localStorage keys:
- `token`
- `authToken` 
- `accessToken`

If no token is found → Redirects to home page (`/`)

### 3. Additional Security Features

- **Token Expiration Check**: If token exists but is expired, clears storage and redirects
- **Role Authorization**: Optionally checks if user has required role
- **Periodic Validation**: Automatically checks token validity every minute
- **Clean Storage**: Removes expired/invalid tokens from localStorage

## 📝 Implementation Examples

### Basic Protection (Any Authenticated User)
```tsx
export default function Dashboard() {
  useRequireAuth() // Redirect to home if no token
  return <div>Protected content</div>
}
```

### Role-Based Protection
```tsx
export default function AdminPanel() {
  useRequireAuth(['admin', 'coordinator']) // Only admin/coordinator access
  return <div>Admin content</div>
}
```

### Custom Redirect Location
```tsx
export default function SpecialPage() {
  useAuthRedirect({ 
    redirectTo: '/custom-login',
    allowedRoles: ['student'],
    checkInterval: 30000 // Check every 30 seconds
  })
  return <div>Special content</div>
}
```

## 🔧 Available Hooks

### `useRequireAuth(allowedRoles?)`
- Redirects to home page (`/`) if no token
- Optionally checks user roles
- Default choice for dashboard pages

### `useRequireLogin(allowedRoles?)`
- Redirects to login page (`/auth/login`) if no token
- Optionally checks user roles
- Good for pages that should prompt login

### `useAuthRedirect(options)`
- Full customization of redirect behavior
- Specify custom redirect location
- Configure check intervals
- Most flexible option

## 🎯 Pages Currently Protected

- `/dashboard/coordinator` - Main coordinator dashboard
- `/dashboard/coordinator/payments` - Payment management
- (Add other protected pages here as you implement them)

## 🚨 Security Features

1. **Multiple Token Sources**: Checks various localStorage keys
2. **Expiration Handling**: Validates token expiration dates
3. **Storage Cleanup**: Removes invalid tokens automatically
4. **Periodic Checks**: Validates tokens every minute by default
5. **Role Validation**: Ensures users have proper permissions
6. **Immediate Redirect**: No flash of protected content

## 📋 Testing the Implementation

To test the redirect functionality:

1. **No Token Test**:
   ```javascript
   // In browser console
   localStorage.clear()
   // Navigate to /dashboard/coordinator - should redirect to home
   ```

2. **Expired Token Test**:
   ```javascript
   // In browser console
   localStorage.setItem('token', 'expired-jwt-token')
   // Navigate to protected page - should clear storage and redirect
   ```

3. **Wrong Role Test**:
   ```javascript
   // Login as student, then try to access coordinator pages
   // Should redirect to general dashboard
   ```

## 🔄 Migration Guide

To add protection to existing pages:

1. **Import the hook**:
   ```tsx
   import { useRequireAuth } from '@/hooks/use-auth-redirect'
   ```

2. **Add to component**:
   ```tsx
   export default function YourPage() {
     useRequireAuth(['your-required-role']) // Add this line
     // Rest of component unchanged
   }
   ```

3. **No other changes needed** - the hook handles everything automatically!

## 🏃‍♂️ Quick Start

For any new protected page, just add this one line:

```tsx
useRequireAuth() // Basic protection - redirect to home if no token
```

Or with role checking:

```tsx
useRequireAuth(['coordinator', 'faculty']) // Only these roles allowed
```

That's it! The page is now automatically protected.