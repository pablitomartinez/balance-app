-- Crea la RPC para crear un hogar y asignar al usuario autenticado como propietario.
create or replace function public.create_home(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_home_id uuid;
  v_name text;
begin
  -- Obtiene el usuario autenticado desde el contexto de Supabase.
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required to create a home';
  end if;

  -- Normaliza y valida el nombre recibido.
  v_name := btrim(p_name);

  if v_name is null or v_name = '' then
    raise exception 'Home name cannot be empty';
  end if;

  -- Serializa las solicitudes concurrentes del mismo usuario para impedir
  -- que pueda crear más de un hogar simultáneamente.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  -- Verifica que el usuario no sea miembro de otro hogar.
  if exists (
    select 1
    from public.home_members
    where profile_id = v_user_id
  ) then
    raise exception 'User already belongs to a home';
  end if;

  -- Crea el hogar y conserva su UUID.
insert into public.homes (
    name,
    created_by
)
values (
    v_name,
    v_user_id
)
returning id into v_home_id;

  -- Crea la membresía del usuario autenticado como propietario.
  insert into public.home_members (home_id, profile_id, role)
  values (v_home_id, v_user_id, 'owner');

  -- La función se ejecuta dentro de una transacción: ante cualquier error,
  -- ambas inserciones se revierten automáticamente.
  return v_home_id;
end;
$$;

-- ============================================
-- RPC: create_home
-- Crea un hogar y agrega al usuario autenticado
-- como owner dentro de una única transacción.
-- ============================================