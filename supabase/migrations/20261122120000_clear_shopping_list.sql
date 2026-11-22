-- Only the authenticated user's shared home list can be cleared.
-- No client-supplied home ID and no direct DELETE grant are needed.
create function public.clear_shopping_list()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_home_ids uuid[];
  v_deleted_count integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to clear the shopping list';
  end if;

  select array_agg(home_id)
  into v_home_ids
  from public.home_members
  where profile_id = v_user_id;

  if coalesce(cardinality(v_home_ids), 0) <> 1 then
    raise exception 'User must belong to exactly one home';
  end if;

  delete from public.shopping_items
  where home_id = v_home_ids[1]
    and public.is_home_member(home_id);

  get diagnostics v_deleted_count = row_count;
  return v_deleted_count;
end;
$$;

revoke all privileges on function public.clear_shopping_list()
from public, anon, authenticated;

grant execute on function public.clear_shopping_list() to authenticated;
