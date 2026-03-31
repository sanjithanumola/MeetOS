# Meeting Intelligence OS - Setup Guide

## 1. Supabase Setup
Create a new project in Supabase and run the following SQL in the SQL Editor:

```sql
-- Create meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  transcript TEXT,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own meetings
CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create tasks table (optional, currently derived from analysis JSONB)
-- You can also create a separate table for more granular task management
```

## 2. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## 3. Installation
```bash
npm install
```

## 4. Development
```bash
npm run dev
```

## 5. Build
```bash
npm run build
```
