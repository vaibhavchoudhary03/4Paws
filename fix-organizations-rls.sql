-- Fix: Allow anonymous users to read organizations for signup
-- This policy allows anyone (including non-authenticated users) to read organizations
-- so they can see the list during the signup process

CREATE POLICY "Anyone can view organizations for signup" ON organizations
  FOR SELECT USING (true);

-- This policy allows anyone to read the organizations table
-- which is needed for the signup page to display the organization dropdown
