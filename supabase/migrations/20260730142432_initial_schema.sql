-- ============================================
-- BALANCE APP - INITIAL DATABASE SCHEMA
-- ============================================

-- Necesario para generar UUIDs
create extension if not exists "pgcrypto";


-- ============================================
-- PROFILES
-- Información pública de los usuarios
-- ============================================

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    full_name text not null,

    avatar_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================
-- CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.profiles (
        id,
        full_name,
        avatar_url
    )

    values (
        new.id,

        coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            'Usuario'
        ),

        new.raw_user_meta_data->>'avatar_url'
    );


    return new;

end;
$$;


create trigger on_auth_user_created

after insert on auth.users

for each row

execute function public.handle_new_user();




-- ============================================
-- HOMES
-- Espacio compartido de gastos
-- ============================================

create table public.homes (

    id uuid primary key default gen_random_uuid(),

    name text not null,

    created_by uuid not null references public.profiles(id),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()

);

-- ============================================
-- HOME MEMBERS
-- Usuarios que pertenecen a una casa
-- ============================================

create table public.home_members (

    id uuid primary key default gen_random_uuid(),

    home_id uuid not null references public.homes(id) on delete cascade,

    profile_id uuid not null references public.profiles(id) on delete cascade,


    role text not null default 'member'
        check (role in ('owner', 'member')),


    created_at timestamptz not null default now(),


    unique(home_id, profile_id)

);  

-- ============================================
-- CATEGORIES
-- Categorías de gastos
-- ============================================

create table public.categories (

    id uuid primary key default gen_random_uuid(),

    home_id uuid not null references public.homes(id) on delete cascade,

    name text not null,

    icon text,

    color text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique(home_id, name)

);

-- ============================================
-- SERVICES
-- Servicios recurrentes del hogar
-- ============================================

create table public.services (

    id uuid primary key default gen_random_uuid(),

    home_id uuid not null references public.homes(id) on delete cascade,

    category_id uuid references public.categories(id) on delete set null,


    name text not null,

    provider text,


    billing_day int
        check (billing_day between 1 and 31),


    split_type text not null default 'equal'
        check (split_type in (
            'equal',
            'percentage',
            'custom'
        )),


    payer_policy text not null default 'any'
        check (payer_policy in (
            'any',
            'owner_only',
            'specific'
        )),


    active boolean not null default true,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);

-- ============================================
-- EXPENSES
-- Gastos reales registrados
-- ============================================

create table public.expenses (

    id uuid primary key default gen_random_uuid(),


    home_id uuid not null
        references public.homes(id)
        on delete cascade,


    created_by uuid not null
        references public.profiles(id),


    service_id uuid
        references public.services(id)
        on delete set null,


    category_id uuid
        references public.categories(id)
        on delete set null,


    description text not null,


    amount numeric(12,2) not null
        check (amount > 0),


    payment_method text not null
        check (payment_method in (
            'cash',
            'debit',
            'credit',
            'transfer',
            'mercadopago',
            'other'
        )),


    status text not null default 'pending'
        check (status in (
            'pending',
            'approved',
            'rejected'
        )),


    purchase_date date not null default current_date,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);

-- ============================================
-- TRANSFERS
-- Transferencias para ajustar saldos
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
        check (amount > 0),


    description text,


    transfer_date date not null default current_date,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()

);

-- ============================================
-- APPROVALS
-- Aprobación de gastos por miembros
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
        check (status in (
            'pending',
            'approved',
            'rejected'
        )),


    comment text,


    approved_at timestamptz,


    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),


    unique(expense_id, profile_id)

);

-- ============================================
-- ATTACHMENTS
-- Archivos asociados a gastos
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
-- Historial de acciones del sistema
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