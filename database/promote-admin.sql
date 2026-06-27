-- Replace the email below with the account you want to promote.
-- Run this in the Supabase SQL editor after that user has signed up.

update public.profiles
set role = 'admin',
    updated_at = now()
where email = 'admin@example.com';
