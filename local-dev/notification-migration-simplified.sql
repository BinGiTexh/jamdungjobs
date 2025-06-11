-- Create enum types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notificationtype') THEN
        CREATE TYPE "NotificationType" AS ENUM (
            'APPLICATION_STATUS',
            'MESSAGE',
            'JOB_RECOMMENDATION',
            'SAVED_JOB_UPDATE',
            'PROFILE_VIEW',
            'REMINDER'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notificationstatus') THEN
        CREATE TYPE "NotificationStatus" AS ENUM (
            'READ',
            'UNREAD'
        );
    END IF;
END
$$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL DEFAULT 'Notification',
    "message" TEXT NOT NULL,
    "related_entity_ids" JSONB DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "recipient_id" UUID NOT NULL,
    "job_application_id" UUID,
    CONSTRAINT "fk_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_job_application" FOREIGN KEY ("job_application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "notifications_recipient_id_idx" ON "notifications"("recipient_id");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");
CREATE INDEX IF NOT EXISTS "notifications_status_idx" ON "notifications"("status");
CREATE INDEX IF NOT EXISTS "notifications_job_application_id_idx" ON "notifications"("job_application_id");

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON "notifications";
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON "notifications"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create additional notification-related tables if needed

-- Create message_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS "message_threads" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS "messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "thread_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_thread" FOREIGN KEY ("thread_id") REFERENCES "message_threads"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create thread_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS "thread_participants" (
    "thread_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("thread_id", "user_id"),
    CONSTRAINT "fk_thread" FOREIGN KEY ("thread_id") REFERENCES "message_threads"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create profile_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS "profile_views" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "viewer_id" UUID,
    "viewed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_profile" FOREIGN KEY ("profile_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_viewer" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Create job_recommendations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "job_recommendations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create scheduled_reminders table if it doesn't exist
CREATE TABLE IF NOT EXISTS "scheduled_reminders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduled_for" TIMESTAMPTZ NOT NULL,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Add update triggers for other tables
DROP TRIGGER IF EXISTS set_message_threads_updated_at ON "message_threads";
CREATE TRIGGER set_message_threads_updated_at
BEFORE UPDATE ON "message_threads"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_messages_updated_at ON "messages";
CREATE TRIGGER set_messages_updated_at
BEFORE UPDATE ON "messages"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_scheduled_reminders_updated_at ON "scheduled_reminders";
CREATE TRIGGER set_scheduled_reminders_updated_at
BEFORE UPDATE ON "scheduled_reminders"
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- notification-migration-simplified.sql
-- Simplified migration script for implementing core notification functionality

-- Step 1: Ensure NotificationType enum exists with all required notification types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
    CREATE TYPE "NotificationType" AS ENUM (
      'APPLICATION_UPDATE',    -- For application status changes
      'MESSAGE',               -- For messages from employers/recruiters
      'JOB_RECOMMENDATION',    -- For job recommendations
      'SAVED_JOB_UPDATE',      -- For saved job updates (expiration/removal)
      'PROFILE_VIEW',          -- For when employers view profiles
      'REMINDER',              -- For reminders (interviews, profile completion)
      'SYSTEM'                 -- For system notifications
    );
  ELSE
    -- If enum exists, add any missing values
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'APPLICATION_UPDATE';
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOB_RECOMMENDATION';
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SAVED_JOB_UPDATE';
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROFILE_VIEW';
    ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'REMINDER';
  END IF;
END
$$;

-- Step 2: Ensure NotificationStatus enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationStatus') THEN
    CREATE TYPE "NotificationStatus" AS ENUM ('READ', 'UNREAD');
  END IF;
END
$$;

-- Step 3: Create notifications table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    CREATE TABLE notifications (
      id text PRIMARY KEY,
      type "NotificationType" NOT NULL,
      status "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
      title TEXT NOT NULL DEFAULT 'Notification',
      message TEXT NOT NULL,
      recipient_id text NOT NULL REFERENCES users(id),
      job_application_id text REFERENCES job_applications(id),
      related_entity_ids JSONB,
      metadata JSONB,
      dismissed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create indexes for notifications table
    CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
    CREATE INDEX idx_notifications_type ON notifications(type);
    CREATE INDEX idx_notifications_status ON notifications(status);
    CREATE INDEX idx_notifications_created_at ON notifications(created_at);
  END IF;
END
$$;

-- Step 4: Create profile_views table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_views') THEN
    CREATE TABLE profile_views (
      id text PRIMARY KEY,
      viewer_id text NOT NULL REFERENCES users(id),
      viewed_user_id text NOT NULL REFERENCES users(id),
      viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create index for profile_views table
    CREATE INDEX idx_profile_views_viewed_user_id ON profile_views(viewed_user_id);
  END IF;
END
$$;

-- Step 5: Create job_recommendations table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_recommendations') THEN
    CREATE TABLE job_recommendations (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id),
      job_id text NOT NULL REFERENCES jobs(id),
      score FLOAT NOT NULL,
      reason TEXT,
      viewed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create index for job_recommendations table
    CREATE INDEX idx_job_recommendations_user_id ON job_recommendations(user_id);
  END IF;
END
$$;

-- Step 6: Create scheduled_reminders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scheduled_reminders') THEN
    CREATE TABLE scheduled_reminders (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
      content JSONB NOT NULL,
      processed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create index for scheduled_reminders table
    CREATE INDEX idx_scheduled_reminders_scheduled_for ON scheduled_reminders(scheduled_for);
  END IF;
END
$$;

-- Step 7: Create message_thread_participants table if it doesn't exist
-- Note: This table links users with message_threads, which uses UUID for IDs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_thread_participants') THEN
    CREATE TABLE message_thread_participants (
      thread_id uuid REFERENCES message_threads(id) ON DELETE CASCADE,
      user_id text REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (thread_id, user_id)
    );
  END IF;
END
$$;

-- Step 8: Create messages table if it doesn't exist
-- Note: This table references message_threads, which uses UUID for IDs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    CREATE TABLE messages (
      id text PRIMARY KEY,
      thread_id uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
      sender_id text NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      read_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Create indexes for messages table
    CREATE INDEX idx_messages_thread_id ON messages(thread_id);
    CREATE INDEX idx_messages_sender_id ON messages(sender_id);
  END IF;
END
$$;

-- Step 9: Create or replace function to generate IDs
CREATE OR REPLACE FUNCTION generate_id()
RETURNS text AS $$
BEGIN
  RETURN replace(gen_random_uuid()::text, '-', '');
END;
$$ LANGUAGE plpgsql;

-- Step 10: Add trigger to automatically generate IDs for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_notifications_id' 
    AND tgrelid = 'notifications'::regclass
  ) THEN
    CREATE TRIGGER set_notifications_id
      BEFORE INSERT ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION set_id_before_insert();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, so we can't create the trigger
    NULL;
END
$$;

-- Step 11: Create or replace function to set ID before insert
CREATE OR REPLACE FUNCTION set_id_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL THEN
    NEW.id := generate_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Add triggers for each table to automatically generate IDs
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename IN ('notifications', 'profile_views', 'job_recommendations', 'scheduled_reminders', 'messages')
    AND schemaname = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_%s_id ON %s;
      CREATE TRIGGER set_%s_id
        BEFORE INSERT ON %s
        FOR EACH ROW
        EXECUTE FUNCTION set_id_before_insert();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END
$$;

-- Step 13: Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Step 14: Add updated_at triggers for notifications table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
    CREATE TRIGGER update_notifications_updated_at
      BEFORE UPDATE ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Step 15: Create or replace function to update thread's updated_at when messages are added
CREATE OR REPLACE FUNCTION update_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 16: Add trigger to update message thread timestamp when messages are added
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DROP TRIGGER IF EXISTS update_thread_timestamp ON messages;
    CREATE TRIGGER update_thread_timestamp
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_thread_updated_at();
  END IF;
END
$$;

-- Step 17: Create or replace function for application status notifications
CREATE OR REPLACE FUNCTION create_application_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS NULL OR NEW.status != OLD.status THEN
    INSERT INTO notifications (
      id,
      type, 
      status, 
      title, 
      message, 
      recipient_id, 
      job_application_id,
      related_entity_ids
    ) VALUES (
      generate_id(),
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

-- Step 18: Add trigger for application status notifications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications') THEN
    DROP TRIGGER IF EXISTS application_status_notification_trigger ON job_applications;
    CREATE TRIGGER application_status_notification_trigger
      AFTER INSERT OR UPDATE OF status ON job_applications
      FOR EACH ROW
      EXECUTE FUNCTION create_application_status_notification();
  END IF;
END
$$;

-- Step 19: Create or replace function for message notifications
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  participant_id text;
  sender_name text;
BEGIN
  -- Only proceed if notifications table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
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
        id,
        type,
        status,
        title,
        message,
        recipient_id,
        related_entity_ids
      ) VALUES (
        generate_id(),
        'MESSAGE',
        'UNREAD',
        'New Message',
        CONCAT('You have a new message from ', sender_name),
        participant_id,
        jsonb_build_object('message_id', NEW.id, 'thread_id', NEW.thread_id, 'sender_id', NEW.sender_id)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 20: Add trigger for message notifications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DROP TRIGGER IF EXISTS message_notification_trigger ON messages;
    CREATE TRIGGER message_notification_trigger
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION create_message_notification();
  END IF;
END
$$;

-- Step 21: Create or replace function for profile view notifications
CREATE OR REPLACE FUNCTION create_profile_view_notification()
RETURNS TRIGGER AS $$
DECLARE
  viewer_name text;
  company_name text;
BEGIN
  -- Only proceed if notifications table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
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
        id,
        type,
        status,
        title,
        message,
        recipient_id,
        related_entity_ids
      ) VALUES (
        generate_id(),
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 22: Add trigger for profile view notifications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_views') THEN
    DROP TRIGGER IF EXISTS profile_view_notification_trigger ON profile_views;
    CREATE TRIGGER profile_view_notification_trigger
      AFTER INSERT ON profile_views
      FOR EACH ROW
      EXECUTE FUNCTION create_profile_view_notification();
  END IF;
END
$$;

-- Step 23: Create or replace function for saved job update notifications
CREATE OR REPLACE FUNCTION create_saved_job_update_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if notifications table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- When a job status changes to CLOSED or EXPIRED
    IF NEW.status IN ('CLOSED', 'EXPIRED') AND OLD.status = 'ACTIVE' THEN
      -- Notify all users who saved this job
      INSERT INTO notifications (
        id,
        type,
        status,
        title,
        message,
        recipient_id,
        related_entity_ids
      )
      SELECT 
        generate_id(),
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 24: Add trigger for saved job update notifications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
    DROP TRIGGER IF EXISTS saved_job_update_notification_trigger ON jobs;
    CREATE TRIGGER saved_job_update_notification_trigger
      AFTER UPDATE OF status ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION create_saved_job_update_notification();
  END IF;
END
$$;

-- Print success message
DO $$
BEGIN
  RAISE NOTICE 'Notification system migration completed successfully.';
END
$$;

