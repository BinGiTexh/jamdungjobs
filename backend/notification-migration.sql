-- notification-migration.sql
-- Migration script for implementing comprehensive notification system

-- Step 1: Drop existing notification type enum and recreate with expanded types
DROP TYPE IF EXISTS "NotificationType" CASCADE;
CREATE TYPE "NotificationType" AS ENUM (
  'APPLICATION_UPDATE',    -- For application status changes
  'MESSAGE',               -- For messages from employers/recruiters
  'JOB_RECOMMENDATION',    -- For job recommendations
  'SAVED_JOB_UPDATE',      -- For saved job updates (expiration/removal)
  'PROFILE_VIEW',          -- For when employers view profiles
  'REMINDER',              -- For reminders (interviews, profile completion)
  'SYSTEM'                 -- For system notifications
);

-- Step 2: Update notifications table with expanded fields
ALTER TABLE notifications 
  DROP COLUMN IF EXISTS content,
  ADD COLUMN title TEXT NOT NULL DEFAULT 'Notification',
  ADD COLUMN message TEXT NOT NULL,
  ADD COLUMN related_entity_ids JSONB,
  ADD COLUMN metadata JSONB,
  ADD COLUMN dismissed BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 3: Create message threads and messages tables
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_thread_participants (
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Step 4: Create table for profile views
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewer_id UUID NOT NULL REFERENCES users(id),
  viewed_user_id UUID NOT NULL REFERENCES users(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create table for job recommendations
CREATE TABLE job_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  score FLOAT NOT NULL,
  reason TEXT,
  viewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create table for scheduled reminders
CREATE TABLE scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  content JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Add triggers for notification generation

-- Function to create notifications for application status changes
CREATE OR REPLACE FUNCTION create_application_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS NULL OR NEW.status != OLD.status THEN
    INSERT INTO notifications (
      type, 
      status, 
      title, 
      message, 
      recipient_id, 
      job_application_id,
      related_entity_ids
    ) VALUES (
      'APPLICATION_UPDATE',
      'UNREAD',
      CASE 
        WHEN NEW.status = 'PENDING' THEN 'Application Submitted'
        WHEN NEW.status = 'REVIEWED' THEN 'Application Reviewed'
        WHEN NEW.status = 'SHORTLISTED' THEN 'Application Shortlisted'
        WHEN NEW.status = 'REJECTED' THEN 'Application Not Selected'
        WHEN NEW.status = 'ACCEPTED' THEN 'Application Accepted'
        ELSE 'Application Status Updated'
      END,
      CASE 
        WHEN NEW.status = 'PENDING' THEN 'Your application has been submitted successfully.'
        WHEN NEW.status = 'REVIEWED' THEN 'Your application has been reviewed.'
        WHEN NEW.status = 'SHORTLISTED' THEN 'Congratulations! Your application has been shortlisted.'
        WHEN NEW.status = 'REJECTED' THEN 'We regret to inform you that your application was not selected.'
        WHEN NEW.status = 'ACCEPTED' THEN 'Congratulations! Your application has been accepted.'
        ELSE 'Your application status has been updated.'
      END,
      NEW.user_id,
      NEW.id,
      jsonb_build_object('job_id', NEW.job_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for application status notifications
DROP TRIGGER IF EXISTS application_status_notification_trigger ON job_applications;
CREATE TRIGGER application_status_notification_trigger
AFTER INSERT OR UPDATE OF status ON job_applications
FOR EACH ROW
EXECUTE FUNCTION create_application_status_notification();

-- Function to create notifications for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  participant_id UUID;
  sender_name TEXT;
BEGIN
  -- Get sender's name
  SELECT CONCAT(first_name, ' ', last_name) INTO sender_name
  FROM users
  WHERE id = NEW.sender_id;

  -- Create notification for each thread participant except sender
  FOR participant_id IN 
    SELECT user_id FROM message_thread_participants 
    WHERE thread_id = NEW.thread_id AND user_id != NEW.sender_id
  LOOP
    INSERT INTO notifications (
      type,
      status,
      title,
      message,
      recipient_id,
      related_entity_ids
    ) VALUES (
      'MESSAGE',
      'UNREAD',
      'New Message',
      CONCAT('You have a new message from ', sender_name),
      participant_id,
      jsonb_build_object('message_id', NEW.id, 'thread_id', NEW.thread_id, 'sender_id', NEW.sender_id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message notifications
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;
CREATE TRIGGER message_notification_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION create_message_notification();

-- Function to create notifications for profile views
CREATE OR REPLACE FUNCTION create_profile_view_notification()
RETURNS TRIGGER AS $$
DECLARE
  viewer_name TEXT;
  company_name TEXT;
BEGIN
  -- Only create notifications for employer views of job seeker profiles
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.viewer_id AND role = 'EMPLOYER'
  ) AND EXISTS (
    SELECT 1 FROM users
    WHERE id = NEW.viewed_user_id AND role = 'JOBSEEKER'
  ) THEN
    -- Get viewer's name and company
    SELECT u.first_name || ' ' || u.last_name, c.name 
    INTO viewer_name, company_name
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.id = NEW.viewer_id;

    -- Create notification
    INSERT INTO notifications (
      type,
      status,
      title,
      message,
      recipient_id,
      related_entity_ids
    ) VALUES (
      'PROFILE_VIEW',
      'UNREAD',
      'Profile Viewed',
      CASE 
        WHEN company_name IS NOT NULL THEN 
          CONCAT('Your profile was viewed by ', viewer_name, ' from ', company_name)
        ELSE
          CONCAT('Your profile was viewed by ', viewer_name)
      END,
      NEW.viewed_user_id,
      jsonb_build_object('viewer_id', NEW.viewer_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profile view notifications
DROP TRIGGER IF EXISTS profile_view_notification_trigger ON profile_views;
CREATE TRIGGER profile_view_notification_trigger
AFTER INSERT ON profile_views
FOR EACH ROW
EXECUTE FUNCTION create_profile_view_notification();

-- Function to create notifications for saved job updates
CREATE OR REPLACE FUNCTION create_saved_job_update_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- When a job status changes to CLOSED or EXPIRED
  IF NEW.status IN ('CLOSED', 'EXPIRED') AND OLD.status = 'ACTIVE' THEN
    -- Notify all users who saved this job
    INSERT INTO notifications (
      type,
      status,
      title,
      message,
      recipient_id,
      related_entity_ids
    )
    SELECT 
      'SAVED_JOB_UPDATE',
      'UNREAD',
      CASE 
        WHEN NEW.status = 'CLOSED' THEN 'Saved Job Closed'
        ELSE 'Saved Job Expired'
      END,
      CONCAT('A job you saved (', NEW.title, ') is no longer accepting applications.'),
      sj.user_id,
      jsonb_build_object('job_id', NEW.id)
    FROM saved_jobs sj
    WHERE sj.job_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for saved job update notifications
DROP TRIGGER IF EXISTS saved_job_update_notification_trigger ON jobs;
CREATE TRIGGER saved_job_update_notification_trigger
AFTER UPDATE OF status ON jobs
FOR EACH ROW
EXECUTE FUNCTION create_saved_job_update_notification();

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_updated_at ON message_threads(updated_at);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_user_id ON profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_scheduled_for ON scheduled_reminders(scheduled_for);

-- Step 9: Add updated_at triggers for new tables
CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON message_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add a function to update the message thread's updated_at when messages are added
CREATE OR REPLACE FUNCTION update_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_updated_at();

