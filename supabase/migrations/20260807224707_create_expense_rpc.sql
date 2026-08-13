-- ============================================
-- RPC: create_expense
-- Creates an expense and its 50/50 shares
-- atomically in a single transaction.
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
  -- RETURN CREATED EXPENSE
  -- ============================================

  return v_expense_id;

end;
$$;