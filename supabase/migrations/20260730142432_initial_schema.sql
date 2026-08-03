-- ============================================
-- BALANCE APP
-- INITIAL DATABASE SCHEMA v1.0
-- ============================================

-- UUID generation
create extension if not exists "pgcrypto";


-- ============================================
-- PROFILES
-- Public user information
-- ============================================

create table public.profiles (

    id uuid primary key
        references auth.users(id)
        on delete cascade,

    full_name text,

    avatar_url text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);


-- Automatically create profile after signup

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$

begin

    insert into public.profiles (
        id,
        full_name
    )
    values (
        new.id,
        new.raw_user_meta_data ->> 'full_name'
    );

    return new;

end;

$$;


create trigger on_auth_user_created

after insert on auth.users

for each row

execute procedure public.handle_new_user();



-- ============================================
-- HOMES
-- Shared financial spaces
-- ============================================

create table public.homes (

    id uuid primary key default gen_random_uuid(),

    name text not null default 'Mi hogar',

    created_by uuid not null
        references public.profiles(id)
        on delete cascade,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);



-- ============================================
-- HOME MEMBERS
-- Users inside homes
-- ============================================

create table public.home_members (

    id uuid primary key default gen_random_uuid(),

    home_id uuid not null
        references public.homes(id)
        on delete cascade,


    profile_id uuid not null
        references public.profiles(id)
        on delete cascade,


    role text not null default 'member'

        check (
            role in (
                'owner',
                'member'
            )
        ),


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    unique(home_id, profile_id)

);

-- ============================================
-- CATEGORIES
-- Expense classification
-- ============================================

create table public.categories (

    id uuid primary key default gen_random_uuid(),

    home_id uuid not null
        references public.homes(id)
        on delete cascade,


    name text not null,


    icon text,


    color text,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    unique(home_id, name)

);



-- ============================================
-- SERVICES
-- Recurring household services
-- ============================================

create table public.services (

    id uuid primary key default gen_random_uuid(),


    home_id uuid not null
        references public.homes(id)
        on delete cascade,


    name text not null,


    amount numeric(12,2)
        check (amount >= 0),


    due_day integer
        check (
            due_day between 1 and 31
        ),


    assigned_to uuid
        references public.profiles(id)
        on delete set null,


    active boolean not null default true,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);



-- ============================================
-- EXPENSES
-- Main expense records
-- ============================================

create table public.expenses (

    id uuid primary key default gen_random_uuid(),


    home_id uuid not null
        references public.homes(id)
        on delete cascade,


    category_id uuid
        references public.categories(id)
        on delete set null,


    service_id uuid
        references public.services(id)
        on delete set null,


    description text not null,


    amount numeric(12,2) not null

        check (
            amount >= 0
        ),


    expense_date date not null default current_date,


    paid_by uuid not null
        references public.profiles(id)
        on delete cascade,


    payment_method text not null default 'other'

        check (
            payment_method in (
                'cash',
                'debit',
                'credit',
                'transfer',
                'mercadopago',
                'other'
            )
        ),


    status text not null default 'pending'

        check (
            status in (
                'pending',
                'approved',
                'rejected'
            )
        ),


    notes text,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);



-- ============================================
-- EXPENSE SHARES
-- Distribution of expense responsibility
-- ============================================

create table public.expense_shares (

    id uuid primary key default gen_random_uuid(),


    expense_id uuid not null
        references public.expenses(id)
        on delete cascade,


    profile_id uuid not null
        references public.profiles(id)
        on delete cascade,


    expected_amount numeric(12,2) not null default 0

        check (
            expected_amount >= 0
        ),


    actual_amount numeric(12,2) not null default 0

        check (
            actual_amount >= 0
        ),


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    unique(expense_id, profile_id)

);

-- ============================================
-- TRANSFERS
-- Money movements between members
-- ============================================

create table public.transfers (

    id uuid primary key default gen_random_uuid(),


    home_id uuid not null
        references public.homes(id)
        on delete cascade,


    from_profile_id uuid not null
        references public.profiles(id)
        on delete cascade,


    to_profile_id uuid not null
        references public.profiles(id)
        on delete cascade,


    amount numeric(12,2) not null

        check (
            amount > 0
        ),


    transfer_date date not null default current_date,


    description text,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);



-- ============================================
-- APPROVALS
-- Expense confirmation workflow
-- ============================================

create table public.approvals (

    id uuid primary key default gen_random_uuid(),


    expense_id uuid not null
        references public.expenses(id)
        on delete cascade,


    profile_id uuid not null
        references public.profiles(id)
        on delete cascade,


    status text not null default 'pending'

        check (
            status in (
                'pending',
                'approved',
                'rejected'
            )
        ),


    comment text,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    unique(expense_id, profile_id)

);



-- ============================================
-- ATTACHMENTS
-- Receipts and expense images
-- ============================================

create table public.attachments (

    id uuid primary key default gen_random_uuid(),


    expense_id uuid not null
        references public.expenses(id)
        on delete cascade,


    file_url text not null,


    file_type text,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);



-- ============================================
-- ACTIVITY LOGS
-- History of important actions
-- ============================================

create table public.activity_logs (

    id uuid primary key default gen_random_uuid(),


    home_id uuid not null
        references public.homes(id)
        on delete cascade,


    profile_id uuid
        references public.profiles(id)
        on delete set null,


    action text not null,


    entity text not null,


    entity_id uuid,


    metadata jsonb,


    created_at timestamptz not null default now()

);

-- ============================================
-- INDEXES
-- Performance optimization
-- ============================================


-- HOME MEMBERS

create index idx_home_members_home_id
on public.home_members(home_id);


create index idx_home_members_profile_id
on public.home_members(profile_id);



-- CATEGORIES

create index idx_categories_home_id
on public.categories(home_id);



-- SERVICES

create index idx_services_home_id
on public.services(home_id);


create index idx_services_active
on public.services(active);



-- EXPENSES

create index idx_expenses_home_id
on public.expenses(home_id);


create index idx_expenses_date
on public.expenses(expense_date);


create index idx_expenses_home_date
on public.expenses(home_id, expense_date);


create index idx_expenses_paid_by
on public.expenses(paid_by);


create index idx_expenses_category
on public.expenses(category_id);



-- EXPENSE SHARES

create index idx_expense_shares_expense_id
on public.expense_shares(expense_id);


create index idx_expense_shares_profile_id
on public.expense_shares(profile_id);



-- TRANSFERS

create index idx_transfers_home_id
on public.transfers(home_id);


create index idx_transfers_date
on public.transfers(transfer_date);



-- APPROVALS

create index idx_approvals_expense_id
on public.approvals(expense_id);


create index idx_approvals_profile_id
on public.approvals(profile_id);


create index idx_approvals_status
on public.approvals(status);



-- ATTACHMENTS

create index idx_attachments_expense_id
on public.attachments(expense_id);



-- ACTIVITY LOGS

create index idx_activity_logs_home_id
on public.activity_logs(home_id);


create index idx_activity_logs_created_at
on public.activity_logs(created_at);




-- ============================================
-- UPDATED_AT FUNCTION
-- Automatically updates timestamps
-- ============================================


create or replace function public.update_updated_at_column()

returns trigger

language plpgsql

as $$

begin

    new.updated_at = now();

    return new;

end;

$$;




-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================


create trigger update_profiles_updated_at

before update on public.profiles

for each row

execute procedure public.update_updated_at_column();



create trigger update_homes_updated_at

before update on public.homes

for each row

execute procedure public.update_updated_at_column();



create trigger update_home_members_updated_at

before update on public.home_members

for each row

execute procedure public.update_updated_at_column();



create trigger update_categories_updated_at

before update on public.categories

for each row

execute procedure public.update_updated_at_column();



create trigger update_services_updated_at

before update on public.services

for each row

execute procedure public.update_updated_at_column();



create trigger update_expenses_updated_at

before update on public.expenses

for each row

execute procedure public.update_updated_at_column();



create trigger update_expense_shares_updated_at

before update on public.expense_shares

for each row

execute procedure public.update_updated_at_column();



create trigger update_transfers_updated_at

before update on public.transfers

for each row

execute procedure public.update_updated_at_column();



create trigger update_approvals_updated_at

before update on public.approvals

for each row

execute procedure public.update_updated_at_column();



create trigger update_attachments_updated_at

before update on public.attachments

for each row

execute procedure public.update_updated_at_column();



-- ============================================
-- END OF INITIAL SCHEMA v1.0
-- ============================================