-- ============================================
-- ENABLE RLS
-- ============================================

alter table public.profiles enable row level security;
alter table public.homes enable row level security;
alter table public.home_members enable row level security;


-- ============================================
-- PROFILES
-- Users can read their own profile
-- ============================================

create policy "Users can read own profile"
on public.profiles
for select
using (
    auth.uid() = id
);


-- ============================================
-- HOME MEMBERS
-- Users can see their own memberships
-- ============================================

create policy "Users can read own memberships"
on public.home_members
for select
using (
    auth.uid() = profile_id
);


-- ============================================
-- HOMES
-- Users can see homes where they belong
-- ============================================

create policy "Users can read their homes"
on public.homes
for select
using (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = homes.id
          and hm.profile_id = auth.uid()
    )
);