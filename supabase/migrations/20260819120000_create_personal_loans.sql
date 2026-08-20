-- ============================================================
-- PERSONAL LOANS v1
-- Kept deliberately separate from household expenses and transfers.
-- ============================================================

create table public.personal_loans (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  lender_profile_id uuid not null,
  borrower_profile_id uuid not null,
  principal_amount numeric(12, 2) not null check (principal_amount > 0),
  description text not null check (btrim(description) <> ''),
  loan_date date not null default current_date,
  status text not null default 'open'
    check (status in ('open', 'paid', 'cancelled')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personal_loans_lender_borrower_different
    check (lender_profile_id <> borrower_profile_id),
  constraint personal_loans_lender_home_member_fkey
    foreign key (home_id, lender_profile_id)
    references public.home_members (home_id, profile_id),
  constraint personal_loans_borrower_home_member_fkey
    foreign key (home_id, borrower_profile_id)
    references public.home_members (home_id, profile_id),
  constraint personal_loans_id_home_id_key unique (id, home_id)
);

create table public.personal_loan_payments (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null,
  loan_id uuid not null,
  payer_profile_id uuid not null,
  received_by_profile_id uuid not null,
  amount numeric(12, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  description text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personal_loan_payments_payer_receiver_different
    check (payer_profile_id <> received_by_profile_id),
  constraint personal_loan_payments_payer_home_member_fkey
    foreign key (home_id, payer_profile_id)
    references public.home_members (home_id, profile_id),
  constraint personal_loan_payments_receiver_home_member_fkey
    foreign key (home_id, received_by_profile_id)
    references public.home_members (home_id, profile_id),
  constraint personal_loan_payments_loan_home_fkey
    foreign key (loan_id, home_id)
    references public.personal_loans (id, home_id)
    on delete cascade
);

create index idx_personal_loans_home_id on public.personal_loans(home_id);
create index idx_personal_loans_borrower_profile_id on public.personal_loans(borrower_profile_id);
create index idx_personal_loans_lender_profile_id on public.personal_loans(lender_profile_id);
create index idx_personal_loans_status on public.personal_loans(status);
create index idx_personal_loans_loan_date on public.personal_loans(loan_date);
create index idx_personal_loan_payments_loan_date
  on public.personal_loan_payments(loan_id, payment_date desc);
create index idx_personal_loan_payments_home_date
  on public.personal_loan_payments(home_id, payment_date desc);

create trigger update_personal_loans_updated_at
before update on public.personal_loans
for each row
execute procedure public.update_updated_at_column();

create trigger update_personal_loan_payments_updated_at
before update on public.personal_loan_payments
for each row
execute procedure public.update_updated_at_column();

alter table public.personal_loans enable row level security;
alter table public.personal_loan_payments enable row level security;

revoke all privileges on table public.personal_loans, public.personal_loan_payments
from authenticated;

revoke all privileges on table public.personal_loans, public.personal_loan_payments
from public;

grant select on table public.personal_loans, public.personal_loan_payments
to authenticated;

create policy "Members can read home personal loans"
on public.personal_loans
for select
to authenticated
using (public.is_home_member(home_id));

create policy "Members can read home personal loan payments"
on public.personal_loan_payments
for select
to authenticated
using (public.is_home_member(home_id));

create or replace function public.create_personal_loan(
  p_description text,
  p_amount numeric,
  p_loan_date date default current_date
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_home_id uuid;
  v_borrower_id uuid;
  v_user_home_count integer;
  v_member_count integer;
  v_loan_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to create a personal loan';
  end if;

  if p_description is null or btrim(p_description) = '' then
    raise exception 'Loan description cannot be empty';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Loan amount must be greater than zero';
  end if;

  select count(*)
  into v_user_home_count
  from public.home_members
  where profile_id = v_user_id;

  if v_user_home_count <> 1 then
    raise exception 'User must belong to exactly one home';
  end if;

  select home_id
  into v_home_id
  from public.home_members
  where profile_id = v_user_id;

  select count(*)
  into v_member_count
  from public.home_members
  where home_id = v_home_id;

  if v_member_count <> 2 then
    raise exception 'Personal loans require exactly two home members';
  end if;

  select profile_id
  into v_borrower_id
  from public.home_members
  where home_id = v_home_id
    and profile_id <> v_user_id;

  if v_borrower_id is null then
    raise exception 'Could not determine the other home member';
  end if;

  insert into public.personal_loans (
    home_id,
    lender_profile_id,
    borrower_profile_id,
    principal_amount,
    description,
    loan_date,
    status,
    created_by
  )
  values (
    v_home_id,
    v_user_id,
    v_borrower_id,
    p_amount,
    btrim(p_description),
    coalesce(p_loan_date, current_date),
    'open',
    v_user_id
  )
  returning id into v_loan_id;

  return v_loan_id;
end;
$$;

create or replace function public.record_personal_loan_payment(
  p_loan_id uuid,
  p_amount numeric,
  p_payment_date date default current_date,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_loan public.personal_loans%rowtype;
  v_total_paid numeric(12, 2);
  v_remaining_amount numeric(12, 2);
  v_payment_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to record a personal loan payment';
  end if;

  if p_loan_id is null then
    raise exception 'Personal loan is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  select *
  into v_loan
  from public.personal_loans
  where id = p_loan_id
  for update;

  if not found then
    raise exception 'Personal loan not found';
  end if;

  if not public.is_home_member(v_loan.home_id) then
    raise exception 'User does not belong to this home';
  end if;

  if v_loan.borrower_profile_id <> v_user_id then
    raise exception 'Only the borrower can record a payment';
  end if;

  if v_loan.status <> 'open' then
    raise exception 'Personal loan is not open for payments';
  end if;

  select coalesce(sum(amount), 0)
  into v_total_paid
  from public.personal_loan_payments
  where loan_id = v_loan.id
    and home_id = v_loan.home_id;

  v_remaining_amount := v_loan.principal_amount - v_total_paid;

  if v_remaining_amount <= 0 then
    raise exception 'Personal loan has no remaining balance';
  end if;

  if p_amount > v_remaining_amount then
    raise exception 'Payment amount cannot exceed the remaining balance';
  end if;

  insert into public.personal_loan_payments (
    home_id,
    loan_id,
    payer_profile_id,
    received_by_profile_id,
    amount,
    payment_date,
    description,
    created_by
  )
  values (
    v_loan.home_id,
    v_loan.id,
    v_loan.borrower_profile_id,
    v_loan.lender_profile_id,
    p_amount,
    coalesce(p_payment_date, current_date),
    nullif(btrim(p_description), ''),
    v_user_id
  )
  returning id into v_payment_id;

  if p_amount = v_remaining_amount then
    update public.personal_loans
    set status = 'paid'
    where id = v_loan.id;
  end if;

  return v_payment_id;
end;
$$;

revoke execute on function public.create_personal_loan(text, numeric, date)
from public;

revoke execute on function public.record_personal_loan_payment(uuid, numeric, date, text)
from public;

grant execute on function public.create_personal_loan(text, numeric, date)
to authenticated;

grant execute on function public.record_personal_loan_payment(uuid, numeric, date, text)
to authenticated;
