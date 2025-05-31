-- Create the candidate_profiles table
CREATE TABLE IF NOT EXISTS "candidate_profiles" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT,
  "bio" TEXT,
  "location" TEXT,
  "skills" JSONB,
  "education" JSONB,
  "photoUrl" TEXT,
  "resumeUrl" TEXT,
  "resumeFileName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "candidate_profiles_userId_key" UNIQUE ("userId"),
  CONSTRAINT "candidate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
