// Test script to create sample messages for mentor dashboard testing
// Run this in MongoDB or through a seeding endpoint

const sampleMessages = [
  {
    sender: "coordinator_profile_id", // Replace with actual coordinator profile ID
    recipient: "mentor_profile_id", // Replace with actual mentor profile ID
    team: "team_id_1", // Replace with actual team ID
    subject: "Team TechInnovators needs guidance",
    content: "Hi! Our team is struggling with the final integration of our AI-powered learning assistant. Could we schedule a session to discuss the best approach for connecting our frontend with the ML backend?",
    messageType: "question",
    priority: "high",
    isRead: false,
    metadata: {
      teamProgress: 75,
      milestone: "Final Integration",
      tags: ["technical", "ai-ml", "integration"]
    }
  },
  {
    sender: "student_profile_id", // Replace with actual student profile ID
    recipient: "mentor_profile_id", // Replace with actual mentor profile ID
    team: "team_id_2", // Replace with actual team ID
    subject: "Demo preparation update",
    content: "Our demo slides are ready for review! We've incorporated all the feedback from our last meeting and would love to get your input before the final presentation.",
    messageType: "team_update",
    priority: "normal",
    isRead: false,
    metadata: {
      teamProgress: 90,
      milestone: "Demo Preparation",
      tags: ["demo", "presentation", "feedback"]
    }
  },
  {
    sender: "student_profile_id_2", // Replace with actual student profile ID
    recipient: "mentor_profile_id", // Replace with actual mentor profile ID
    subject: "Quick question about API implementation",
    content: "Hi mentor! We've completed the API implementation for our carbon footprint tracker. Everything is working well in testing. Ready for the next phase!",
    messageType: "direct",
    priority: "low",
    isRead: true,
    readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    metadata: {
      teamProgress: 85,
      milestone: "API Development",
      tags: ["api", "backend", "completed"]
    }
  },
  {
    sender: "coordinator_profile_id", // Replace with actual coordinator profile ID
    recipient: "mentor_profile_id", // Replace with actual mentor profile ID
    subject: "Urgent: Team needs immediate support",
    content: "One of your teams is facing a critical blocker with their database connection. They've been stuck for 2 days and the deadline is approaching. Please prioritize this.",
    messageType: "urgent",
    priority: "urgent",
    isRead: false,
    metadata: {
      teamProgress: 45,
      milestone: "Database Integration",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      tags: ["urgent", "database", "blocker"]
    }
  },
  {
    sender: "student_profile_id_3", // Replace with actual student profile ID
    recipient: "mentor_profile_id", // Replace with actual mentor profile ID
    team: "team_id_3", // Replace with actual team ID
    subject: "Feedback request for project architecture",
    content: "We've designed our project architecture and would appreciate your feedback before we start development. We want to make sure we're on the right track.",
    messageType: "feedback_request",
    priority: "normal",
    isRead: false,
    metadata: {
      teamProgress: 20,
      milestone: "Architecture Design",
      tags: ["architecture", "feedback", "design"]
    }
  }
]

// To use this data:
// 1. Replace the placeholder IDs with actual profile and team IDs from your database
// 2. Insert these documents into your messages collection
// 3. The dynamic messaging system will pick them up automatically

console.log("Sample messages for testing:")
console.log(JSON.stringify(sampleMessages, null, 2))

export default sampleMessages