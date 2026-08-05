-- ============================================
-- GRANT PERMISSIONS TO AUTHENTICATED
-- ============================================

grant select, insert, update, delete
on table public.home_members
to authenticated;

grant select, insert, update, delete
on table public.homes
to authenticated;

grant select, insert, update, delete
on table public.profiles
to authenticated;