-- ============================================
-- HARDEN BUSINESS RLS
-- Keep household, expense and approval mutations
-- behind their SECURITY DEFINER RPCs.
-- ============================================

-- ============================================
-- TABLE PRIVILEGES
-- Authenticated users only need direct read access.
-- SECURITY DEFINER RPCs retain the privileges of their owner.
-- ============================================

revoke all privileges
on table public.home_members, public.expenses, public.expense_shares, public.approvals
from authenticated;

grant select
on table public.home_members, public.expenses, public.expense_shares, public.approvals
to authenticated;


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.home_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_shares enable row level security;
alter table public.approvals enable row level security;


-- ============================================
-- REMOVE WRITE POLICIES THAT BYPASS THE RPCs
-- ============================================

drop policy if exists "Users can create own membership"
on public.home_members;

drop policy if exists "Members can create home expenses"
on public.expenses;

drop policy if exists "Members can update home expenses"
on public.expenses;

drop policy if exists "Members can delete home expenses"
on public.expenses;

drop policy if exists "Members can create home expense shares"
on public.expense_shares;

drop policy if exists "Members can update home expense shares"
on public.expense_shares;

drop policy if exists "Members can delete home expense shares"
on public.expense_shares;

drop policy if exists "Members can create home approvals"
on public.approvals;

drop policy if exists "Members can delete home approvals"
on public.approvals;

drop policy if exists "Members can update home approvals"
on public.approvals;

drop policy if exists "Members can read home approvals"
on public.approvals;


-- ============================================
-- READ-ONLY POLICIES
-- ============================================

drop policy if exists "Users can read own memberships"
on public.home_members;

create policy "Users can read own memberships"
on public.home_members
for select
using (
  profile_id = auth.uid()
);

drop policy if exists "Members can read home expenses"
on public.expenses;

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

drop policy if exists "Members can read home expense shares"
on public.expense_shares;

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

create policy "Members can read home approvals"
on public.approvals
for select
using (
  exists (
    select 1
    from public.expenses e
    join public.home_members hm
      on hm.home_id = e.home_id
    where e.id = approvals.expense_id
      and hm.profile_id = auth.uid()
  )
);


-- ============================================
-- RPC: CREATE EXPENSE
-- Enforce that the authenticated member is the payer
-- and that optional category/service belong to the home.
-- ============================================

create or replace function public.create_expense(
  p_home_id uuid,
  p_description text,
  p_amount numeric,
  p_expense_date date,
  p_paid_by uuid,
  p_payment_method text,
  p_category_id uuid default null,
  p_service_id uuid default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_expense_id uuid;
  v_member_count integer;
  v_share_amount numeric(12, 2);
  v_approver_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to create an expense';
  end if;

  if p_description is null or btrim(p_description) = '' then
    raise exception 'Expense description cannot be empty';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Expense amount must be greater than zero';
  end if;

  if p_paid_by is null then
    raise exception 'Expense payer is required';
  end if;

  if p_paid_by <> v_user_id then
    raise exception 'Expense payer must be the authenticated user';
  end if;

  if not exists (
    select 1
    from public.home_members
    where home_id = p_home_id
      and profile_id = v_user_id
  ) then
    raise exception 'User does not belong to this home';
  end if;

  if not exists (
    select 1
    from public.home_members
    where home_id = p_home_id
      and profile_id = p_paid_by
  ) then
    raise exception 'Payer does not belong to this home';
  end if;

  if p_category_id is not null and not exists (
    select 1
    from public.categories
    where id = p_category_id
      and home_id = p_home_id
  ) then
    raise exception 'Category does not belong to this home';
  end if;

  if p_service_id is not null and not exists (
    select 1
    from public.services
    where id = p_service_id
      and home_id = p_home_id
  ) then
    raise exception 'Service does not belong to this home';
  end if;

  select count(*)
  into v_member_count
  from public.home_members
  where home_id = p_home_id;

  if v_member_count <> 2 then
    raise exception 'This MVP requires exactly two home members';
  end if;

  select profile_id
  into v_approver_id
  from public.home_members
  where home_id = p_home_id
    and profile_id <> p_paid_by
  limit 1;

  if v_approver_id is null then
    raise exception 'Could not determine the other home member';
  end if;

  v_share_amount := round(p_amount / 2, 2);

  insert into public.expenses (
    home_id,
    category_id,
    service_id,
    description,
    amount,
    expense_date,
    paid_by,
    payment_method,
    status,
    notes
  )
  values (
    p_home_id,
    p_category_id,
    p_service_id,
    btrim(p_description),
    p_amount,
    coalesce(p_expense_date, current_date),
    p_paid_by,
    p_payment_method,
    'pending',
    p_notes
  )
  returning id into v_expense_id;

  insert into public.expense_shares (
    expense_id,
    profile_id,
    expected_amount,
    actual_amount
  )
  select
    v_expense_id,
    hm.profile_id,
    v_share_amount,
    case
      when hm.profile_id = p_paid_by then p_amount
      else 0
    end
  from public.home_members hm
  where hm.home_id = p_home_id;

  insert into public.approvals (
    expense_id,
    profile_id,
    status
  )
  values (
    v_expense_id,
    v_approver_id,
    'pending'
  );

  return v_expense_id;
end;
$$;


-- ============================================
-- FUNCTION PERMISSIONS
-- ============================================

revoke execute
on function public.create_expense(uuid, text, numeric, date, uuid, text, uuid, uuid, text)
from public;

revoke execute
on function public.approve_expense(uuid, text)
from public;

revoke execute
on function public.reject_expense(uuid, text)
from public;

grant execute
on function public.create_expense(uuid, text, numeric, date, uuid, text, uuid, uuid, text)
to authenticated;

grant execute
on function public.approve_expense(uuid, text)
to authenticated;

grant execute
on function public.reject_expense(uuid, text)
to authenticated;
