-- ============================================
-- HOME INVITATIONS
-- ============================================

create table public.home_invitations (
  id uuid not null default gen_random_uuid(),
  home_id uuid not null,
  code text not null,
  created_by uuid not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone null,
  used_by uuid null,
  created_at timestamp with time zone not null default now(),

  constraint home_invitations_pkey
    primary key (id),

  constraint home_invitations_code_key
    unique (code),

  constraint home_invitations_home_id_fkey
    foreign key (home_id)
    references public.homes (id)
    on delete cascade,

  constraint home_invitations_created_by_fkey
    foreign key (created_by)
    references public.profiles (id)
    on delete cascade,

  constraint home_invitations_used_by_fkey
    foreign key (used_by)
    references public.profiles (id)
    on delete set null
);


-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_home_invitations_home_id
  on public.home_invitations (home_id);

create index if not exists idx_home_invitations_code
  on public.home_invitations (code);

create index if not exists idx_home_invitations_expires_at
  on public.home_invitations (expires_at);


-- ============================================
-- RLS
-- ============================================

alter table public.home_invitations enable row level security;


-- ============================================
-- RPC: CREATE HOME INVITATION
-- ============================================

create or replace function public.create_home_invitation(
  p_home_id uuid
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_member_count integer;
  v_code text;
  v_expires_at timestamptz;
begin

  -- ============================================
  -- AUTHENTICATION
  -- ============================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to create an invitation';
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
  -- LOCK HOME
  -- Prevent concurrent invitation creation
  -- from bypassing the member-count check.
  -- ============================================

  perform pg_advisory_xact_lock(
    hashtextextended(p_home_id::text, 0)
  );


  -- ============================================
  -- VERIFY HOME HAS SPACE
  -- ============================================

  select count(*)
  into v_member_count
  from public.home_members
  where home_id = p_home_id;

  if v_member_count >= 2 then
    raise exception 'This home already has two members';
  end if;


  -- ============================================
  -- GENERATE INVITATION CODE
  -- ============================================

  v_code :=
    upper(
      substr(
        replace(gen_random_uuid()::text, '-', ''),
        1,
        8
      )
    );

  v_expires_at := now() + interval '24 hours';


  -- ============================================
  -- CREATE INVITATION
  -- ============================================

  insert into public.home_invitations (
    home_id,
    code,
    created_by,
    expires_at
  )
  values (
    p_home_id,
    v_code,
    v_user_id,
    v_expires_at
  );

  return v_code;

end;
$$;


-- ============================================
-- RPC: ACCEPT HOME INVITATION
-- ============================================

create or replace function public.accept_home_invitation(
  p_code text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_invitation public.home_invitations%rowtype;
  v_member_count integer;
  v_home_id uuid;
begin

  -- ============================================
  -- AUTHENTICATION
  -- ============================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to accept an invitation';
  end if;


  -- ============================================
  -- NORMALIZE CODE
  -- ============================================

  p_code := upper(btrim(p_code));

  if p_code = '' then
    raise exception 'Invitation code cannot be empty';
  end if;


  -- ============================================
  -- LOAD INVITATION
  -- ============================================

  select *
  into v_invitation
  from public.home_invitations
  where code = p_code
  for update;

  if not found then
    raise exception 'Invitation code is invalid';
  end if;


  -- ============================================
  -- VERIFY INVITATION STATUS
  -- ============================================

  if v_invitation.used_at is not null then
    raise exception 'Invitation has already been used';
  end if;

  if v_invitation.expires_at <= now() then
    raise exception 'Invitation has expired';
  end if;


  -- ============================================
  -- VERIFY USER DOES NOT ALREADY HAVE A HOME
  -- ============================================

  if exists (
    select 1
    from public.home_members
    where profile_id = v_user_id
  ) then
    raise exception 'User already belongs to a home';
  end if;


  -- ============================================
  -- LOCK HOME
  -- Prevent concurrent acceptance from
  -- bypassing the member-count check.
  -- ============================================

  perform pg_advisory_xact_lock(
    hashtextextended(v_invitation.home_id::text, 0)
  );


  -- ============================================
  -- VERIFY HOME STILL HAS SPACE
  -- ============================================

  select count(*)
  into v_member_count
  from public.home_members
  where home_id = v_invitation.home_id;

  if v_member_count >= 2 then
    raise exception 'This home already has two members';
  end if;


  -- ============================================
  -- ADD USER TO HOME
  -- ============================================

  insert into public.home_members (
    home_id,
    profile_id,
    role
  )
  values (
    v_invitation.home_id,
    v_user_id,
    'member'
  );


  -- ============================================
  -- MARK INVITATION AS USED
  -- ============================================

  update public.home_invitations
  set
    used_at = now(),
    used_by = v_user_id
  where id = v_invitation.id;

  v_home_id := v_invitation.home_id;

  return v_home_id;

end;
$$;


-- ============================================
-- FUNCTION PERMISSIONS
-- ============================================

revoke execute
on function public.create_home_invitation(uuid)
from public;

revoke execute
on function public.accept_home_invitation(text)
from public;

grant execute
on function public.create_home_invitation(uuid)
to authenticated;

grant execute
on function public.accept_home_invitation(text)
to authenticated;