-- ============================================
-- EXPENSE APPROVAL WORKFLOW
-- ============================================


-- ============================================
-- CREATE EXPENSE
-- Also creates the pending approval
-- for the other home member.
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

  -- ============================================
  -- AUTHENTICATION
  -- ============================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to create an expense';
  end if;


  -- ============================================
  -- VALIDATION
  -- ============================================

  if p_description is null or btrim(p_description) = '' then
    raise exception 'Expense description cannot be empty';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Expense amount must be greater than zero';
  end if;

  if p_paid_by is null then
    raise exception 'Expense payer is required';
  end if;


  -- ============================================
  -- VERIFY USER BELONGS TO HOME
  -- ============================================

  if not exists (
    select 1
    from public.home_members
    where home_id = p_home_id
      and profile_id = v_user_id
  ) then
    raise exception 'User does not belong to this home';
  end if;


  -- ============================================
  -- VERIFY PAYER BELONGS TO HOME
  -- ============================================

  if not exists (
    select 1
    from public.home_members
    where home_id = p_home_id
      and profile_id = p_paid_by
  ) then
    raise exception 'Payer does not belong to this home';
  end if;


  -- ============================================
  -- VERIFY EXACTLY TWO MEMBERS
  -- ============================================

  select count(*)
  into v_member_count
  from public.home_members
  where home_id = p_home_id;

  if v_member_count <> 2 then
    raise exception 'This MVP requires exactly two home members';
  end if;


  -- ============================================
  -- FIND OTHER MEMBER
  -- ============================================

  select profile_id
  into v_approver_id
  from public.home_members
  where home_id = p_home_id
    and profile_id <> p_paid_by
  limit 1;

  if v_approver_id is null then
    raise exception 'Could not determine the other home member';
  end if;


  -- ============================================
  -- CALCULATE 50/50 SHARE
  -- ============================================

  v_share_amount := round(p_amount / 2, 2);


  -- ============================================
  -- CREATE EXPENSE
  -- ============================================

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


  -- ============================================
  -- CREATE 50/50 SHARES
  -- ============================================

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


  -- ============================================
  -- CREATE APPROVAL FOR OTHER MEMBER
  -- ============================================

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
-- APPROVE EXPENSE
-- ============================================

create or replace function public.approve_expense(
  p_expense_id uuid,
  p_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_expense public.expenses%rowtype;
  v_approval public.approvals%rowtype;
begin

  -- ============================================
  -- AUTHENTICATION
  -- ============================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to approve an expense';
  end if;


  -- ============================================
  -- LOAD EXPENSE
  -- ============================================

  select *
  into v_expense
  from public.expenses
  where id = p_expense_id
  for update;

  if not found then
    raise exception 'Expense not found';
  end if;


  -- ============================================
  -- VERIFY USER BELONGS TO HOME
  -- ============================================

  if not exists (
    select 1
    from public.home_members
    where home_id = v_expense.home_id
      and profile_id = v_user_id
  ) then
    raise exception 'User does not belong to this home';
  end if;


  -- ============================================
  -- PAYER CANNOT APPROVE THEIR OWN EXPENSE
  -- ============================================

  if v_expense.paid_by = v_user_id then
    raise exception 'The expense payer cannot approve their own expense';
  end if;


  -- ============================================
  -- EXPENSE MUST BE PENDING
  -- ============================================

  if v_expense.status <> 'pending' then
    raise exception 'Expense is no longer pending';
  end if;


  -- ============================================
  -- LOAD APPROVAL
  -- ============================================

  select *
  into v_approval
  from public.approvals
  where expense_id = p_expense_id
    and profile_id = v_user_id
  for update;

  if not found then
    raise exception 'Approval record not found';
  end if;


  if v_approval.status <> 'pending' then
    raise exception 'Approval is no longer pending';
  end if;


  -- ============================================
  -- APPROVE
  -- ============================================

  update public.approvals
  set
    status = 'approved',
    comment = p_comment,
    updated_at = now()
  where id = v_approval.id;


  update public.expenses
  set
    status = 'approved',
    updated_at = now()
  where id = p_expense_id;

end;
$$;


-- ============================================
-- REJECT EXPENSE
-- ============================================

create or replace function public.reject_expense(
  p_expense_id uuid,
  p_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_expense public.expenses%rowtype;
  v_approval public.approvals%rowtype;
begin

  -- ============================================
  -- AUTHENTICATION
  -- ============================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to reject an expense';
  end if;


  -- ============================================
  -- LOAD EXPENSE
  -- ============================================

  select *
  into v_expense
  from public.expenses
  where id = p_expense_id
  for update;

  if not found then
    raise exception 'Expense not found';
  end if;


  -- ============================================
  -- VERIFY USER BELONGS TO HOME
  -- ============================================

  if not exists (
    select 1
    from public.home_members
    where home_id = v_expense.home_id
      and profile_id = v_user_id
  ) then
    raise exception 'User does not belong to this home';
  end if;


  -- ============================================
  -- PAYER CANNOT REJECT THEIR OWN EXPENSE
  -- ============================================

  if v_expense.paid_by = v_user_id then
    raise exception 'The expense payer cannot reject their own expense';
  end if;


  -- ============================================
  -- EXPENSE MUST BE PENDING
  -- ============================================

  if v_expense.status <> 'pending' then
    raise exception 'Expense is no longer pending';
  end if;


  -- ============================================
  -- LOAD APPROVAL
  -- ============================================

  select *
  into v_approval
  from public.approvals
  where expense_id = p_expense_id
    and profile_id = v_user_id
  for update;

  if not found then
    raise exception 'Approval record not found';
  end if;


  if v_approval.status <> 'pending' then
    raise exception 'Approval is no longer pending';
  end if;


  -- ============================================
  -- REJECT
  -- ============================================

  update public.approvals
  set
    status = 'rejected',
    comment = p_comment,
    updated_at = now()
  where id = v_approval.id;


  update public.expenses
  set
    status = 'rejected',
    updated_at = now()
  where id = p_expense_id;

end;
$$;


-- ============================================
-- GRANTS
-- ============================================

grant execute
on function public.approve_expense(uuid, text)
to authenticated;

grant execute
on function public.reject_expense(uuid, text)
to authenticated;
