BALANCE APP

supabase-cuenta: lumiqjujuy@gmail.com
supabse-password: amoralrojo7.

PROFILES
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    avatar_url text,
    created_at timestamptz not null default now()
);

CREAR USUER AUTOMATICAMENTE CUANDO SE LOGUEE

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
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuario'),
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

--------------------
tabla 2 - base del sistema

create table public.homes (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now()
);

quien vive en esta casa?

create table public.home_members (
    id uuid primary key default gen_random_uuid(),
    home_id uuid not null references public.homes(id) on delete cascade,
    profile_id uuid not null references public.profiles(id) on delete cascade,
    role text not null default 'member',
    created_at timestamptz not null default now(),
    unique(home_id, profile_id)
);

-----------------
CATEGORIAS

create table public.categories (
    id uuid primary key default gen_random_uuid(),
    home_id uuid references public.homes(id) on delete cascade,
    name text not null,
    icon text,
    color text,
    created_at timestamptz not null default now()
);

---------------
services


create table public.services (
    id uuid primary key default gen_random_uuid(),
    home_id uuid not null references public.homes(id) on delete cascade,
    category_id uuid references public.categories(id),
    name text not null,
    provider text,
    billing_day int,
    split_type text not null default 'equal',
    payer_policy text not null default 'any',
    active boolean not null default true,
    created_at timestamptz not null default now()
);


---------------------

expenses

Esta es la tabla central del sistema. Todo lo que impacta el saldo vive acá.

Ejecutá esto:

create table public.expenses (
    id uuid primary key default gen_random_uuid(),
    home_id uuid not null references public.homes(id) on delete cascade,
    created_by uuid not null references public.profiles(id),
    service_id uuid references public.services(id),
    category_id uuid references public.categories(id),

    description text not null,
    amount numeric not null,

    payment_method text not null,

    status text not null default 'pending',

    purchase_date date not null default current_date,
    created_at timestamptz not null default now()
);





-----------------------

expenses shares

expense_shares

Esta tabla define quién aporta cuánto en cada gasto.

Sin esto, la app no sirve.

Ejecutá esto:

create table public.expense_shares (
    id uuid primary key default gen_random_uuid(),
    expense_id uuid not null references public.expenses(id) on delete cascade,
    profile_id uuid not null references public.profiles(id) on delete cascade,

    expected_amount numeric not null default 0,
    actual_amount numeric not null default 0,

    created_at timestamptz not null default now(),

    unique(expense_id, profile_id)
);
Qué representa

Para cada gasto:

persona	debía pagar	realmente pagó
Pablo	25.000	0
Agostina	25.000	50.000



------------------------------

transfers

Esto representa plata que uno le transfiere al otro para ajustar el saldo.

Ejecutá esto:

create table public.transfers (
    id uuid primary key default gen_random_uuid(),
    home_id uuid not null references public.homes(id) on delete cascade,

    from_profile_id uuid not null references public.profiles(id),
    to_profile_id uuid not null references public.profiles(id),

    amount numeric not null,

    description text,

    transfer_date date not null default current_date,
    created_at timestamptz not null default now()
);
Qué representa esto

Ejemplo real:

Pablo le debe a Agostina $100.000
Pablo transfiere $20.000

Resultado:

saldo baja automáticamente


-------------------------



approvals

Esta tabla define si un gasto fue aceptado o rechazado por la otra persona.

Sin esto, cualquiera podría cargar cualquier cosa y romper el sistema.

Ejecutá esto:

create table public.approvals (
    id uuid primary key default gen_random_uuid(),
    expense_id uuid not null references public.expenses(id) on delete cascade,
    profile_id uuid not null references public.profiles(id) on delete cascade,

    status text not null default 'pending',

    comment text,

    approved_at timestamptz,

    created_at timestamptz not null default now(),

    unique(expense_id, profile_id)
);
Qué representa

Para cada gasto:

Pablo lo crea
Agostina lo revisa
Lo aprueba o rechaza
Estados posibles
pending → aún no vio
approved → válido
rejected → no corresponde
Ejemplo real

Supermercado $50.000

usuario	estado
Pablo	approved
Agostina	pending

Cuando Agostina aprueba:

el gasto pasa a approved
recién ahí impacta en el sistema (si lo querés condicionar después)



-------------------


attachments

attachments

Acá guardamos comprobantes (fotos, PDFs, etc.).

Ejecutá esto:

create table public.attachments (
    id uuid primary key default gen_random_uuid(),
    expense_id uuid not null references public.expenses(id) on delete cascade,

    file_url text not null,
    file_type text,

    created_at timestamptz not null default now()
);
Qué hace esto

Permite adjuntar:

foto del ticket del súper
factura de luz
captura del pago
comprobante de transferencia
Importante

Esto NO afecta el saldo.

Solo sirve para validar y dar confianza.



------------------------

activity_logs

Esto es el “registro de todo lo que pasó” en la app.

No afecta el saldo. Solo sirve para auditoría y trazabilidad.

Ejecutá esto:

create table public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    home_id uuid not null references public.homes(id) on delete cascade,
    profile_id uuid references public.profiles(id),

    action text not null,
    entity text not null,
    entity_id uuid,

    metadata jsonb,

    created_at timestamptz not null default now()
);
Qué representa

Ejemplos:

“Pablo creó un gasto”
“Agostina aprobó un gasto”
“Se registró una transferencia”
“Se agregó un comprobante”
Por qué existe esto

Porque en una app así:

la confianza es más importante que el cálculo

Si algo no cuadra, ustedes pueden ver exactamente qué pasó.

metadata (clave)

Ahí podés guardar info flexible:

{
  "amount": 50000,
  "description": "Supermercado",
  "old_status": "pending",
  "new_status": "approved"










