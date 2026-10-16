-- Run ONLY in the Supabase SQL Editor, after creating your user in Auth > Users.
-- Replace the placeholder with your own Auth user UUID in Supabase SQL Editor.
-- This table has one row, so there can be only one owner.
insert into private.portfolio_owner (id, user_id)
values (true, 'REPLACE_WITH_YOUR_AUTH_USER_UUID'::uuid)
on conflict (id) do update set user_id = excluded.user_id;
