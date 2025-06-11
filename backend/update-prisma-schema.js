// update-prisma-schema.js
// Script to update the Prisma schema for the notification system

/**
 * This script shows how to update the Prisma schema to match the SQL migration.
 * You should run 'npx prisma db push' after making these changes to update the Prisma client.
 * 
 * Instructions:
 * 1. Make a backup of your current schema.prisma file
 * 2. Update your schema.prisma file with the changes below
 * 3. Run 'npx prisma db push' to update the Prisma client
 * 4. Run 'npx prisma generate' to regenerate the Prisma client
 */

/*
Expand the NotificationType enum in schema.prisma:

enum NotificationType {
  APPLICATION_UPDATE
  MESSAGE
  JOB_RECOMMENDATION
  SAVED_JOB_UPDATE
  PROFILE_VIEW
  REMINDER
  SYSTEM
}

Update the Notification model:

model Notification {
  id                String            @id @default(uuid())
  type              NotificationType
  status            NotificationStatus @default(UNREAD)
  title             String
  message           String
  relatedEntityIds  Json?
  metadata          Json?
  dismissed         Boolean           @default(false)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  recipient         User              @relation("UserNotifications", fields: [recipientId], references: [id])
  recipientId       String
  jobApplication    JobApplication?   @relation(fields: [jobApplicationId], references: [id])
  jobApplicationId  String?
  
  @@map("notifications")
}

Add new models for messages:

model MessageThread {
  id            String                     @id @default(uuid())
  title         String?
  createdAt     DateTime                   @default(now())
  updatedAt     DateTime                   @updatedAt
  
  // Relations
  participants  MessageThreadParticipant[]
  messages      Message[]
  
  @@map("message_threads")
}

model MessageThreadParticipant {
  threadId      String
  userId        String
  
  // Relations
  thread        MessageThread  @relation(fields: [threadId], references: [id], onDelete: Cascade)
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@id([threadId, userId])
  @@map("message_thread_participants")
}

model Message {
  id            String         @id @default(uuid())
  threadId      String
  senderId      String
  content       String
  createdAt     DateTime       @default(now())
  readAt        DateTime?
  
  // Relations
  thread        MessageThread  @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sender        User           @relation(fields: [senderId], references: [id])
  
  @@map("messages")
}

Add profile views model:

model ProfileView {
  id            String      @id @default(uuid())
  viewerId      String
  viewedUserId  String
  viewedAt      DateTime    @default(now())
  
  // Relations
  viewer        User        @relation("ViewerRelation", fields: [viewerId], references: [id])
  viewedUser    User        @relation("ViewedUserRelation", fields: [viewedUserId], references: [id])
  
  @@map("profile_views")
}

Add job recommendations model:

model JobRecommendation {
  id            String      @id @default(uuid())
  userId        String
  jobId         String
  score         Float
  reason        String?
  viewed        Boolean     @default(false)
  createdAt     DateTime    @default(now())
  
  // Relations
  user          User        @relation(fields: [userId], references: [id])
  job           Job         @relation(fields: [jobId], references: [id])
  
  @@map("job_recommendations")
}

Add scheduled reminders model:

model ScheduledReminder {
  id            String      @id @default(uuid())
  userId        String
  type          String
  scheduledFor  DateTime
  content       Json
  processed     Boolean     @default(false)
  createdAt     DateTime    @default(now())
  
  // Relations
  user          User        @relation(fields: [userId], references: [id])
  
  @@map("scheduled_reminders")
}

Also, update the User model to add relations:

model User {
  // ... existing fields
  
  // Add new relations
  sentMessages                Message[]
  threadParticipations        MessageThreadParticipant[]
  profileViewsInitiated       ProfileView[]          @relation("ViewerRelation")
  profileViewsReceived        ProfileView[]          @relation("ViewedUserRelation")
  jobRecommendations          JobRecommendation[]
  scheduledReminders          ScheduledReminder[]
  
  // ... existing relations
}

And update the Job model to add relations:

model Job {
  // ... existing fields
  
  // Add new relations
  recommendations             JobRecommendation[]
  
  // ... existing relations
}
*/

console.log('This script shows instructions for updating your Prisma schema.');
console.log('Please update your schema.prisma file manually with the changes shown in the comments above.');
console.log('After updating, run "npx prisma db push" and "npx prisma generate" to update the Prisma client.');

