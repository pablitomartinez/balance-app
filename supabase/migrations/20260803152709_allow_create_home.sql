-- ============================================
-- ALLOW CREATE HOME
-- ============================================

create policy "Users can create homes"
on public.homes
for insert
with check (
    auth.uid() = created_by
);


create policy "Users can create own membership"
on public.home_members
for insert
with check (
    auth.uid() = profile_id
);