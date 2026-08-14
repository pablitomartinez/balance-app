-- ============================================================
-- FIX READ RLS FOR SHARED HOME MEMBERS / PROFILES
-- ============================================================

-- ------------------------------------------------------------
-- Helper: check whether the current user belongs to a home.
-- SECURITY DEFINER avoids recursive RLS evaluation when this
-- helper is used inside policies.
-- ------------------------------------------------------------

create or replace function public.is_home_member(
  target_home_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.home_members hm
    where hm.home_id = target_home_id
      and hm.profile_id = auth.uid()
  );
$$;

revoke all on function public.is_home_member(uuid)
from public;

grant execute on function public.is_home_member(uuid)
to authenticated;


-- ------------------------------------------------------------
-- HOME MEMBERS
-- Users can read all members of homes they belong to.
-- ------------------------------------------------------------

drop policy if exists "Users can read own memberships"
on public.home_members;

create policy "Members can read household memberships"
on public.home_members
for select
to authenticated
using (
  public.is_home_member(home_id)
);


-- ------------------------------------------------------------
-- PROFILES
-- Users can read profiles of people who share a home with them.
-- ------------------------------------------------------------

create policy "Members can read household profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.home_members hm
    where hm.profile_id = profiles.id
      and public.is_home_member(hm.home_id)
  )
);