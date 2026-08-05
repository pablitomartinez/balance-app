drop policy if exists "Users can read own memberships"
on public.home_members;

create policy "Users can read own memberships"
on public.home_members
for select
using (
    auth.uid() = profile_id
);

drop policy if exists "Users can read their homes"
on public.homes;

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