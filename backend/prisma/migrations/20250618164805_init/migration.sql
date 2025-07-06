CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE TYPE public."ApplicationStatus" AS ENUM (
    'PENDING',
    'REVIEWED',
    'SHORTLISTED',
    'REJECTED',
    'ACCEPTED'
);
CREATE TYPE public."JobStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'CLOSED',
    'EXPIRED'
);
CREATE TYPE public."JobType" AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP',
    'TEMPORARY'
);
CREATE TYPE public."NotificationStatus" AS ENUM (
    'READ',
    'UNREAD'
);
CREATE TYPE public."NotificationType" AS ENUM (
    'APPLICATION_UPDATE',
    'MESSAGE',
    'JOB_RECOMMENDATION',
    'SAVED_JOB_UPDATE',
    'PROFILE_VIEW',
    'REMINDER',
    'SYSTEM'
);
CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'EMPLOYER',
    'JOBSEEKER'
);
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
CREATE TABLE public.candidate_profiles (
    id text NOT NULL,
    user_id text NOT NULL,
    title text,
    bio text,
    location text,
    skills jsonb,
    education jsonb,
    experience jsonb,
    photo_url text,
    resume_url text,
    resume_file_name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.companies (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    location text,
    website text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    industry text,
    "logoUrl" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.job_applications (
    id text NOT NULL,
    "additionalInfo" text,
    "appliedVia" text,
    availability text,
    "coverLetter" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "jobId" text NOT NULL,
    "phoneNumber" text,
    "resumeUrl" text,
    salary text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    status public."ApplicationStatus" DEFAULT 'PENDING'::public."ApplicationStatus" NOT NULL
);
CREATE TABLE public.job_recommendations (
    id text NOT NULL,
    user_id text NOT NULL,
    job_id text NOT NULL,
    score double precision NOT NULL,
    reason text,
    viewed boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE public.jobs (
    id text NOT NULL,
    company_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    location text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    education text,
    experience text,
    featured boolean DEFAULT false NOT NULL,
    salary jsonb,
    skills text[],
    type public."JobType" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."JobStatus" DEFAULT 'ACTIVE'::public."JobStatus" NOT NULL
);
CREATE TABLE public.message_thread_participants (
    "threadId" text NOT NULL,
    "userId" text NOT NULL
);
CREATE TABLE public.message_threads (
    id text NOT NULL,
    title text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE TABLE public.messages (
    id text NOT NULL,
    thread_id text NOT NULL,
    sender_id text NOT NULL,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp(3) without time zone
);
CREATE TABLE public.notifications (
    id text NOT NULL,
    type public."NotificationType" NOT NULL,
    status public."NotificationStatus" DEFAULT 'UNREAD'::public."NotificationStatus" NOT NULL,
    title text DEFAULT 'Notification'::text NOT NULL,
    message text NOT NULL,
    related_entity_ids jsonb,
    metadata jsonb,
    dismissed boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    recipient_id text NOT NULL,
    job_application_id text
);
CREATE TABLE public.profile_views (
    id text NOT NULL,
    viewer_id text NOT NULL,
    viewed_user_id text NOT NULL,
    viewed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE public.saved_jobs (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "jobId" text NOT NULL,
    "userId" text NOT NULL
);
CREATE TABLE public.scheduled_reminders (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    scheduled_for timestamp(3) without time zone NOT NULL,
    content jsonb NOT NULL,
    processed boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    bio text,
    company_id text,
    location text,
    phone_number text,
    title text,
    role public."Role" DEFAULT 'JOBSEEKER'::public."Role" NOT NULL
);
ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.job_recommendations
    ADD CONSTRAINT job_recommendations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.message_thread_participants
    ADD CONSTRAINT message_thread_participants_pkey PRIMARY KEY ("threadId", "userId");
ALTER TABLE ONLY public.message_threads
    ADD CONSTRAINT message_threads_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.scheduled_reminders
    ADD CONSTRAINT scheduled_reminders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX candidate_profiles_user_id_key ON public.candidate_profiles USING btree (user_id);
CREATE INDEX "saved_jobs_jobId_idx" ON public.saved_jobs USING btree ("jobId");
CREATE UNIQUE INDEX "saved_jobs_jobId_userId_key" ON public.saved_jobs USING btree ("jobId", "userId");
CREATE INDEX "saved_jobs_userId_idx" ON public.saved_jobs USING btree ("userId");
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.job_recommendations
    ADD CONSTRAINT job_recommendations_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.job_recommendations
    ADD CONSTRAINT job_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.message_thread_participants
    ADD CONSTRAINT "message_thread_participants_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES public.message_threads(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.message_thread_participants
    ADD CONSTRAINT "message_thread_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.message_threads(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_job_application_id_fkey FOREIGN KEY (job_application_id) REFERENCES public.job_applications(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewed_user_id_fkey FOREIGN KEY (viewed_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.profile_views
    ADD CONSTRAINT profile_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT "saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.scheduled_reminders
    ADD CONSTRAINT scheduled_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;
