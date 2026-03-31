-- Create meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  transcript TEXT,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table (optional, if you want to persist them)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies for meetings
CREATE POLICY "Users can view their own meetings" 
ON meetings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meetings" 
ON meetings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY "Users can view comments for their meetings" 
ON comments FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM meetings 
  WHERE meetings.id = comments.meeting_id 
  AND meetings.user_id = auth.uid()
));

CREATE POLICY "Users can insert comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);
