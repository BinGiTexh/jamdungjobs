-- Drop and recreate message_threads with correct type
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_thread_participants CASCADE;
DROP TABLE IF EXISTS message_threads CASCADE;

CREATE TABLE message_threads (
    id text PRIMARY KEY,
    title text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_thread_participants (
    thread_id text REFERENCES message_threads(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE messages (
    id text PRIMARY KEY,
    thread_id text NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id text NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Create trigger for updating thread's updated_at
CREATE OR REPLACE FUNCTION update_thread_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_threads
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_thread_timestamp ON messages;
CREATE TRIGGER update_thread_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_updated_at();
