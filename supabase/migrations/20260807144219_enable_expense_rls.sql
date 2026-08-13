-- ============================================
-- EXPENSES / CATEGORIES / EXPENSE SHARES RLS
-- MVP
-- ============================================


-- ============================================
-- GRANTS
-- ============================================

grant select, insert, update, delete
on table public.categories
to authenticated;

grant select, insert, update, delete
on table public.expenses
to authenticated;

grant select, insert, update, delete
on table public.expense_shares
to authenticated;


-- ============================================
-- ENABLE RLS
-- ============================================

alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_shares enable row level security;


-- ============================================
-- CATEGORIES
-- A user can access categories belonging
-- to a home where they are a member.
-- ============================================

create policy "Members can read home categories"
on public.categories
for select
using (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = categories.home_id
          and hm.profile_id = auth.uid()
    )
);


create policy "Members can create home categories"
on public.categories
for insert
with check (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = categories.home_id
          and hm.profile_id = auth.uid()
    )
);


create policy "Members can update home categories"
on public.categories
for update
using (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = categories.home_id
          and hm.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = categories.home_id
          and hm.profile_id = auth.uid()
    )
);


create policy "Members can delete home categories"
on public.categories
for delete
using (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = categories.home_id
          and hm.profile_id = auth.uid()
    )
);


-- ============================================
-- EXPENSES
-- A user can access expenses belonging
-- to a home where they are a member.
-- ============================================

create policy "Members can read home expenses"
on public.expenses
for select
using (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = expenses.home_id
          and hm.profile_id = auth.uid()
    )
);


create policy "Members can create home expenses"
on public.expenses
for insert
with check (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = expenses.home_id
          and hm.profile_id = auth.uid()
    )
    and
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = expenses.home_id
          and hm.profile_id = expenses.paid_by
    )
);


create policy "Members can update home expenses"
on public.expenses
for update
using (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = expenses.home_id
          and hm.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = expenses.home_id
          and hm.profile_id = auth.uid()
    )
    and
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = expenses.home_id
          and hm.profile_id = expenses.paid_by
    )
);


create policy "Members can delete home expenses"
on public.expenses
for delete
using (
    exists (
        select 1
        from public.home_members hm
        where hm.home_id = expenses.home_id
          and hm.profile_id = auth.uid()
    )
);


-- ============================================
-- EXPENSE SHARES
-- Shares inherit access from their expense.
-- ============================================

create policy "Members can read home expense shares"
on public.expense_shares
for select
using (
    exists (
        select 1
        from public.expenses e
        join public.home_members hm
          on hm.home_id = e.home_id
        where e.id = expense_shares.expense_id
          and hm.profile_id = auth.uid()
    )
);


create policy "Members can create home expense shares"
on public.expense_shares
for insert
with check (
    exists (
        select 1
        from public.expenses e
        join public.home_members hm
          on hm.home_id = e.home_id
        where e.id = expense_shares.expense_id
          and hm.profile_id = auth.uid()
    )
    and
    exists (
        select 1
        from public.expenses e
        join public.home_members hm
          on hm.home_id = e.home_id
        where e.id = expense_shares.expense_id
          and hm.profile_id = expense_shares.profile_id
    )
);


create policy "Members can update home expense shares"
on public.expense_shares
for update
using (
    exists (
        select 1
        from public.expenses e
        join public.home_members hm
          on hm.home_id = e.home_id
        where e.id = expense_shares.expense_id
          and hm.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.expenses e
        join public.home_members hm
          on hm.home_id = e.home_id
        where e.id = expense_shares.expense_id
          and hm.profile_id = auth.uid()
    )
    and
    exists (
        select 1
        from public.expenses e
        join public.home_members hm
          on hm.home_id = e.home_id
        where e.id = expense_shares.expense_id
          and hm.profile_id = expense_shares.profile_id
    )
);


create policy "Members can delete home expense shares"
on public.expense_shares
for delete
using (
    exists (
        select 1
        from public.expenses e
        join public.home_members hm
          on hm.home_id = e.home_id
        where e.id = expense_shares.expense_id
          and hm.profile_id = auth.uid()
    )
);