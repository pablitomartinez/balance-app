-- One shared shopping list per home, independent of financial records.
-- A home with a single member can use the list immediately.
create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  checked boolean not null default false,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_shopping_items_home_created_at
  on public.shopping_items(home_id, created_at);

create trigger update_shopping_items_updated_at
before update on public.shopping_items
for each row
execute procedure public.update_updated_at_column();

alter table public.shopping_items enable row level security;

-- Explicitly remove default grants too: clients may only read directly.
revoke all privileges on table public.shopping_items
from public, anon, authenticated;

grant select on table public.shopping_items to authenticated;

create policy "Members can read home shopping items"
on public.shopping_items
for select
to authenticated
using (public.is_home_member(home_id));

create or replace function public.add_shopping_item(
  p_name text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_home_id uuid;
  v_user_home_count integer;
  v_item_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to add a shopping item';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Shopping item name cannot be empty';
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

  insert into public.shopping_items (home_id, name, created_by)
  values (v_home_id, btrim(p_name), v_user_id)
  returning id into v_item_id;

  return v_item_id;
end;
$$;

-- Set an explicit state rather than toggling: retries remain idempotent.
-- Filter by membership before updating, without exposing foreign item IDs.
create or replace function public.set_shopping_item_checked(
  p_item_id uuid,
  p_checked boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to update a shopping item';
  end if;

  if p_item_id is null then
    raise exception 'Shopping item is required';
  end if;

  if p_checked is null then
    raise exception 'Shopping item checked state is required';
  end if;

  update public.shopping_items
  set checked = p_checked
  where id = p_item_id
    and public.is_home_member(home_id);

  if not found then
    raise exception 'Shopping item not found or user does not belong to this home';
  end if;
end;
$$;

revoke all privileges on function public.add_shopping_item(text)
from public, anon, authenticated;

revoke all privileges on function public.set_shopping_item_checked(uuid, boolean)
from public, anon, authenticated;

grant execute on function public.add_shopping_item(text) to authenticated;

grant execute on function public.set_shopping_item_checked(uuid, boolean)
to authenticated;
