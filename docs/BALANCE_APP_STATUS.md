# Balance App — Estado del Proyecto

**Auditoría de código y migraciones:** 2026-08-11  
**Branch auditado:** `feature/shared-home`  
**Alcance:** repositorio local, migraciones versionadas y cambios sin commit. No se modificó código, schema, RLS ni RPCs durante esta auditoría.

## 1. Objetivo del MVP

Una PWA de finanzas compartidas para un hogar de **exactamente dos personas**:

`Auth → Home → Invite / Join → Expense → 50/50 shares → Approval → Approved / Rejected → Dashboard / Balance`

No se debe generalizar aún para N miembros, servicios recurrentes, transferencias ni funcionalidades empresariales.

## 2. Stack

- Next.js 14, App Router, React y TypeScript.
- Tailwind CSS y componentes propios de UI (el repositorio no evidencia paquetes shadcn instalados).
- Supabase JS, Supabase Auth, PostgreSQL, RLS y RPCs SQL.
- Git; trabajo activo en `feature/shared-home`.

## 3. Arquitectura actual

- Cliente Supabase tipado en `lib/supabaseClient.ts`.
- Hooks de lectura/mutación en `hooks/`; librerías RPC en `lib/`.
- Las pantallas privadas están bajo `app/(app)` y usan `AuthGuard` de cliente.
- `create_home`, invitaciones y approvals se apoyan en RPCs `SECURITY DEFINER`.
- La creación de gastos se apoya en una RPC transaccional que crea gasto, shares y approval.
- El dashboard todavía es un cascarón: obtiene el hogar, pero no consulta gastos, shares ni approvals.

## 4. Modelo de datos relevante

- `profiles`: perfil 1:1 con `auth.users`, creado por trigger.
- `homes` y `home_members`: hogar y membresía (`owner` / `member`).
- `home_invitations`: código único, expiración y consumo único.
- `categories`: categorías por hogar.
- `expenses`: gasto con `pending | approved | rejected` y pagador.
- `expense_shares`: una fila por miembro y gasto; `expected_amount` / `actual_amount`.
- `approvals`: una aprobación por gasto y revisor.

Hay FKs y `unique(home_id, profile_id)`, `unique(expense_id, profile_id)`, `unique(expense_id, profile_id)` para approvals y código de invitación único. No hay constraint de base que fuerce el máximo de dos miembros ni que fuerce que las dos shares sumen el monto: hoy esas reglas dependen de las RPCs y de RLS.

## 5. Reglas de negocio vigentes

- Un usuario no debe pertenecer a más de un hogar.
- El MVP requiere exactamente dos miembros para crear gastos.
- `create_expense()` crea el gasto `pending`, dos shares con `round(amount / 2, 2)` y una aprobación `pending` para el otro miembro.
- Share esperada: `amount / 2` para ambos; share real: `amount` para quien pagó y `0` para el otro.
- Solo el otro miembro debe aprobar o rechazar; al hacerlo, approval y expense deben cambiar juntos.

**Precisión pendiente:** para montos impares a dos decimales, dos veces `round(amount / 2, 2)` puede diferir del total en $0,01. No apareció en el flujo probado, pero es una regla de redondeo que debe decidirse antes de presentar balances finales.

## 6. Seguridad / RLS

### Estado reconstruible desde migraciones versionadas

| Tabla | RLS / grants reconstruibles | Policies / resultado |
|---|---|---|
| `profiles` | RLS sí; `authenticated` tiene CRUD | Solo SELECT propio. INSERT/UPDATE/DELETE quedan denegados por falta de policy. |
| `homes` | RLS sí; `authenticated` tiene CRUD | SELECT si es miembro e INSERT si `created_by = auth.uid()`. Sin UPDATE/DELETE. |
| `home_members` | RLS sí; `authenticated` tiene CRUD | SELECT propio e INSERT de cualquier fila cuyo `profile_id = auth.uid()`. Esto permite unirse directamente a un `home_id` conocido y evita la RPC. |
| `categories` | RLS sí; CRUD para miembro del hogar | Correcto para categorías, pero permite mutación directa por cualquier miembro. |
| `expenses` | RLS sí; CRUD para miembro del hogar | La mutación directa permite crear, editar, aprobar/rechazar o borrar gastos sin las validaciones de RPC. |
| `expense_shares` | RLS sí; CRUD para miembro del hogar | La mutación directa permite alterar/borrar shares y romper la regla 50/50. |
| `home_invitations` | RLS sí; no hay grants ni policies versionados | Acceso directo queda bloqueado por RLS; las RPCs `SECURITY DEFINER` funcionan con grants explícitos. |
| `approvals` | **No existe migración versionada que habilite RLS, otorgue grants o cree policies** | El estado real de policies mencionado durante la auditoría no es reproducible desde Git. Si las cuatro policies de CRUD existen en remoto, habilitan bypass directo de approve/reject. |

### Riesgos críticos de autorización

1. Las policies directas de `expenses` y `expense_shares` contradicen el modelo «solo RPC para operaciones de negocio»: cualquier miembro puede cambiar `expenses.status`, `paid_by`, amount, shares o borrar filas. Esto permite aprobar/rechazar o alterar un gasto sin `approve_expense()` / `reject_expense()`.
2. La policy INSERT de `home_members` permite que un autenticado se agregue a cualquier hogar cuyo UUID conozca. También permite exceder dos miembros y saltar `accept_home_invitation()`.
3. Si el remoto tiene las cuatro policies de approvals descritas (create/delete/read/update para miembros), un miembro puede editar directamente `approvals.status`, `profile_id`, comentario o borrar/crear approvals, saltando las validaciones de las RPCs. Debe comprobarse y versionarse su estado antes de mergear.

Todas las RPCs `SECURITY DEFINER` nuevas (`create_home`, invitaciones, `create_expense`, approve/reject) fijan `search_path = public, pg_temp`, que es correcto. `handle_new_user()` también es `SECURITY DEFINER`, pero usa solo `search_path = public`; al ser un trigger de Auth no hay evidencia de explotación actual, aunque se debe homogeneizar al endurecer seguridad.

## 7. Shared Home

### Completado

- `create_home(p_name)` valida sesión y nombre, bloquea concurrencia por usuario, impide un segundo hogar, crea `homes` y owner de forma atómica.
- `create_home` y `useHome(userId)` están conectados al frontend.
- La lectura de la membresía y hogar maneja carga, ausencia de hogar y error.

### Parcial / riesgo

- La garantía de máximo dos miembros solo es sólida al usar las RPCs; el INSERT directo de `home_members` la evita.
- La UI no expone una transición clara desde un usuario sin hogar hacia «unirme» versus «crear»: login redirige siempre a `/create-home`. La ruta `/join-home` existe, pero no está enlazada desde ese flujo.

## 8. Invitations

### Completado

- `home_invitations` tiene FK, código único, índices y expiración de 24 horas.
- `create_home_invitation()` valida autenticación y membresía, toma lock por hogar y no crea invitaciones si ya hay dos miembros.
- `accept_home_invitation()` normaliza código, bloquea invitacion y hogar, controla uso, expiración, hogar previo y cupo; agrega miembro y consume invitación en una misma transacción.
- Las rutas `/invite` y `/join-home` llaman las RPCs adecuadas y manejan estados de carga/error.

### Parcial

- Cualquier miembro puede crear una invitación; el MVP no define si debe ser exclusivo de owner.
- Puede haber varias invitaciones válidas simultáneas; no rompe el máximo de dos porque la aceptación está serializada, pero no hay revocación ni reutilización de una invitación pendiente.
- Existe duplicación de `lib/homeInvitations.ts` y `lib/invitations.ts`; la UI usa el segundo. `InvitationTest` sigue montado en dashboard pese a existir `/invite`.

## 9. Expenses y Expense Shares

### Completado

- `create_expense()` es atómica: inserta expense pendiente, dos `expense_shares` y el approval del otro miembro, o revierte todo ante error.
- Valida autenticación, membresía, pagador miembro, importe positivo, descripción y exactamente dos miembros.
- El formulario usa la RPC, pasa el usuario actual como pagador, refresca la lista propia tras crear y muestra errores.
- `useExpenses` consulta y normaliza gastos del hogar; la lista muestra pending/approved/rejected (para aprobado/rechazado no hay badge explícito).

### Hallazgos

- La RPC no exige `p_paid_by = auth.uid()`. Un miembro puede invocarla directamente con el otro como pagador, recibir él mismo el approval y aprobar una creación propia. Es un bypass crítico del workflow.
- La RPC no verifica que `p_category_id` / `p_service_id`, cuando se envían, pertenezcan al mismo hogar. Las FKs confirman existencia pero no coherencia entre hogares.
- La regla 50/50 no está protegida de mutaciones directas de `expense_shares` y falta la decisión sobre el centavo residual.

## 10. Approval Workflow

### Completado y probado

- `approve_expense()` y `reject_expense()` bloquean la fila del expense, validan autenticación, membresía, que el pagador no actúe sobre su gasto, estado pending, approval propia existente y approval pending.
- Cada RPC actualiza approval y expense dentro de la misma transacción; no hay estado intermedio si la transacción falla.
- La pantalla `/approvals`, `useApprovals` y `lib/approvals.ts` están conectados; después de la acción recargan pendientes.
- Prueba manual registrada: al aprobar, `approval.status → approved`, `expense.status → approved` y el gasto desaparece de la pantalla de pendientes.

### Condición para considerar seguro el flujo

El flujo anterior es correcto **solo si se elimina/impide el acceso directo de escritura a expenses, shares y approvals**, salvo operaciones explícitamente permitidas. Con las policies descritas para approvals o las policies actuales de expenses/shares, las validaciones de RPC pueden saltarse.

## 11. Dashboard

### Causa exacta del problema conocido

No es un problema de cache, relación Supabase ni filtro `status`. En `hooks/useHome.ts`:

- `balance` se calcula con `calculateNetBalance([], "current-user", "other-user")`;
- `recentExpenses` se declara como `[]`;
- `pendingApprovals` se declara como `[]`.

El dashboard no hace ninguna query de expenses, shares o approvals y los componentes solo renderizan esos valores vacíos. Por eso, aunque la DB y `/approvals` reflejen correctamente un gasto aprobado, dashboard muestra `$0` y «Todavía no hay gastos». Es funcionalidad aún no implementada.

## 12. Types y calidad

### Probado

- `tsc --noEmit` finaliza correctamente el 2026-08-11.

### Parcial / pendiente

- `types/database.ts` incluye RPCs nuevas, pero no contiene la tabla `home_invitations`; no representa por completo el schema de migraciones.
- Estados y métodos de pago se modelan como `string` en tipos generados y se estrechan manualmente en hooks; no hay enums/tipos DB específicos.
- No se encontraron `any` explícitos. Hay casts de estrechamiento en UI/hooks; no bloquean el MVP.
- Quedan restos de desarrollo: `InvitationTest` montado en dashboard, dos librerías de invitaciones, `auth.getUser()` / `getSession()` sin uso en `useCreateHome`, `auth.getUser()` sin uso en `useApprovals`, y `console.error` de flujos ya manejados por UI.
- Lint no puede verificarse: no hay configuración ESLint y `next lint` abre el asistente interactivo. No se modificó configuración por ser una auditoría.

## 13. Estado actual

### Completado

- Auth por OTP y guard de rutas privadas de cliente.
- Creación atómica de hogar y owner.
- Invitación y aceptación mediante RPCs atómicas con locks.
- Creación de gasto con shares y approval atómicos.
- Aprobación/rechazo mediante RPCs con locks y validaciones.
- Listado de gastos y approvals pendiente en sus pantallas dedicadas.

### Probado

- TypeScript sin errores.
- Flujo manual de approval exitoso: approval y expense pasan a approved y desaparece el pendiente.

### Parcial

- Dashboard visual, no conectado a datos reales.
- RLS de homes/expenses implementado pero inseguro para las invariantes del MVP.
- Invitaciones con UI funcional, pero onboarding no enlaza claramente a Join y queda UI de prueba activa.
- Tipos generados parcialmente actualizados.

### Pendiente

- Endurecer y versionar el perímetro RLS/grants de las tablas de negocio.
- Conectar dashboard/balance solo a gastos aprobados y sus shares.
- Definir y probar redondeo de montos impares.
- Regenerar tipos desde schema remoto una vez que la seguridad quede versionada.
- Configurar lint y ejecutar una prueba de integración de los dos usuarios.

### Problemas conocidos

- Dashboard siempre recibe colecciones vacías por diseño actual.
- `docs/database-v1-notes.md` contiene credenciales en texto plano y documentación de schema divergente del schema versionado. No se reproducen aquí; deben rotarse y quitarse del historial/repositorio mediante un procedimiento específico.
- El estado RLS/grants de `approvals` remoto no puede reconstruirse desde migraciones y, por lo tanto, no es auditable/reproducible desde Git.

## 14. Roadmap restante del MVP (priorizado)

1. **Seguridad e integridad:** auditar y corregir en una migración incremental única el bypass directo de `home_members`, `expenses`, `expense_shares` y `approvals`; dejar grants/RLS versionados y permitir las RPCs necesarias.
2. **Asegurar `create_expense`:** exigir quién puede declarar el pagador, validar categoría/servicio del hogar y decidir el redondeo del 50/50.
3. **Dashboard / balance:** implementar queries y cálculo desde expenses aprobados + shares; no mezclar transferencias ni features futuras.
4. **Onboarding y limpieza mínima:** conectar Join al recorrido sin hogar, retirar `InvitationTest`, consolidar librería de invitaciones y restos de debug.
5. **Verificación de cierre:** regenerar tipos, configurar lint y ejecutar matriz manual/automatizada de dos usuarios para create/invite/join/create expense/approve/reject/dashboard.

## 15. Próximo paso inmediato

**Definir y aplicar la migración incremental de endurecimiento de RLS/grants para proteger las invariantes del MVP y obligar las transiciones de negocio a pasar por las RPCs.**

No avanzar con dashboard/balance antes de cerrar este perímetro: mostrar datos correctos sobre registros que pueden ser manipulados directamente consolidaría una base insegura.

## 16. Decisiones importantes

- El hogar objetivo tiene exactamente dos miembros; no generalizar el split.
- Expense empieza pending; solo impacta balance cuando esté approved.
- Shares se crean junto al expense; no crear expense sin shares ni approval en el flujo normal.
- Approval corresponde al otro miembro, no al pagador.
- Las RPCs son el límite de negocio para create expense, approve/reject e invitaciones; RLS/grants deben reforzar ese límite, no duplicarlo con accesos directos contradictorios.
- No hacer refactor general, nuevas entidades ni migraciones no relacionadas hasta cerrar el MVP actual.

## 17. Migraciones y propósito

| Migración | Propósito / estado |
|---|---|
| `20260730142432_initial_schema.sql` | Schema base, FKs, checks, índices, trigger de perfiles y timestamps. Crea approvals pero no su RLS. |
| `20260803123720_create_home_rpc.sql` | RPC atómica `create_home`; usa `CREATE OR REPLACE` y search path seguro. |
| `20260803150201_enable_home_rls.sql` | Habilita RLS de profiles/homes/home_members y policies de lectura. |
| `20260803152709_allow_create_home.sql` | Policies INSERT de homes y membresías; la de membresías es demasiado amplia. |
| `20260804154330_grant_authenticated_permissions.sql` | Grants CRUD de las tres tablas de home. |
| `20260805025727_fix_home_read_policies.sql` | Reemplaza policies de lectura sin cambio material visible respecto de la versión previa. |
| `20260807144219_enable_expense_rls.sql` | Grants, RLS y CRUD por membresía de categories/expenses/shares; permite bypass de RPC. |
| `20260807224707_create_expense_rpc.sql` | Primera versión de `create_expense`, atómica para expense + shares. |
| `20260808081045_create_home_invitations.sql` | Tabla, índices, RLS y RPCs de invitación; grants/revokes explícitos de funciones. |
| `20260810142318_create_expense_approval_workflow.sql` | Reemplaza `create_expense` para agregar approval y crea approve/reject; no versiona RLS/grants de approvals ni revoca/grant explícitamente `create_expense`. |

`CREATE OR REPLACE FUNCTION` se usa de forma coherente para evolucionar `create_expense` y demás funciones. La última definición de `create_expense` es la que aplica si todas las migraciones se ejecutaron en orden.

## 18. Riesgos técnicos

- Seguridad e integridad por políticas directas demasiado permisivas.
- Divergencia entre base remota, migraciones y tipos (especialmente approvals e invitaciones).
- Dashboard puede llevar a decisiones financieras erróneas porque hoy no tiene fuente de datos.
- Credenciales expuestas en documentación local/historial potencial.
- Falta de pruebas de integración y lint reproducible.

## 19. Qué NO tocar todavía

- No migrar a split para N miembros.
- No introducir transferencias, servicios, adjuntos, activity logs, analytics, realtime o balance mensual como parte de este arreglo.
- No reestructurar App Router, componentes o stack.
- No cambiar UI por razones estéticas antes de cerrar RLS/RPC y dashboard.
- No editar migraciones históricas ya aplicadas; las correcciones deben ser incrementales en migraciones nuevas una vez aprobadas.

## 20. Checkpoint 2026-08-12

Se aplicó la migración:
20260811120000_harden_business_rls.sql

Resultado verificado en Supabase:
- RLS habilitado en home_members, expenses, expense_shares y approvals.
- Las policies de escritura directas fueron eliminadas.
- authenticated conserva únicamente SELECT directo sobre estas tablas.
- Las mutaciones de negocio quedan detrás de las RPC SECURITY DEFINER.

Este checkpoint cierra la capa de seguridad del MVP.

No se realizaron pruebas exhaustivas de bypass desde el cliente en este checkpoint.
La validación funcional de las RPC existentes continúa siendo parte del cierre del MVP.

Próximo objetivo:
conectar y validar el dashboard/balance con gastos aprobados.

------------------------------------------------------------
## 21. Checkpoint 2026-08-17

### Estado de Git / rama

El trabajo activo continúa en:

`develop`

Los cambios anteriores del Dashboard y del formatter ARS fueron committeados y pusheados a `origin/develop`.

Últimos cambios relevantes:
- `0d87014` — `feat: prepare dashboard presentation data`
- `dde815c` — `fix: standardize ARS currency formatting`
- `482a4fa` — `feat: improve dashboard presentation`

### Dashboard

El Dashboard dejó de ser un cascarón y actualmente consume datos reales preparados desde `useHome`.

Muestra:
- saludo del usuario;
- nombre del hogar;
- balance entre los dos miembros;
- gastos recientes;
- aprobaciones pendientes;
- nombres reales de los miembros cuando existen en `profiles`.

Se verificó manualmente con dos usuarios.

Ejemplo actual:
- Pablo ve: `Le debés a Agostina`
- Agostina ve el balance correspondiente desde su perspectiva.
- Los gastos recientes muestran quién pagó.
- Las aprobaciones pendientes muestran quién creó el gasto.

### Profiles / nombres

Se detectó que `profiles.full_name` estaba en `NULL` para los usuarios de prueba.

Se cargaron nombres de prueba directamente en Supabase:

- `91f7665e-ff81-499a-ae62-6be93e1f33d0` → Pablo
- `d1cd4c5d-51bc-4eb8-8dfc-f1745f6c24c6` → Agostina

La aplicación ahora puede obtener esos nombres.

La edición de nombre desde `/settings` queda fuera del alcance inmediato del MVP y se resolverá posteriormente.

### RLS de profiles / home_members

Se agregó la migración:

`20260814_fix_profile_and_home_member_read_rls.sql`

Objetivo:
- permitir que un miembro lea los demás miembros de su hogar;
- permitir leer los `profiles` correspondientes a miembros del mismo hogar;
- mantener el acceso protegido por RLS;
- utilizar `is_home_member(uuid)` como función `SECURITY DEFINER` para evitar problemas de evaluación recursiva.

La migración fue aplicada correctamente al proyecto remoto mediante:

`supabase.cmd db push`

`supabase.cmd migration list` confirmó que la migración `20260814` está presente tanto localmente como remotamente.

### Currency formatting

Se centralizó el formato ARS en:

`lib/utils.ts`

`formatCurrency()` actualmente muestra:
- enteros sin decimales;
- importes con centavos con dos decimales;
- formato `es-AR`.

Ejemplos:
- `5` → `$ 5`
- `5000` → `$ 5.000`
- `9999.97` → `$ 9.999,97`
- `1000000.5` → `$ 1.000.000,50`

`ExpenseList` utiliza el formatter común.

### Estado actual del MVP

El núcleo funcional ya permite:

`Auth → Home → Invite / Join → Expense → 50/50 shares → Approval → Approved / Rejected → Dashboard`

La seguridad base de las mutaciones de negocio fue endurecida mediante:

`20260811120000_harden_business_rls.sql`

y la lectura de miembros/perfiles fue corregida mediante:

`20260814_fix_profile_and_home_member_read_rls.sql`

### Próximo objetivo

El siguiente foco es completar el flujo de creación de gastos y, especialmente, **categorías**.

Las categorías son necesarias para que Balance no sea solamente un registro de movimientos, sino una herramienta útil para entender en qué se está gastando.

Prioridad inmediata:

1. Auditar `categories` y sus datos actuales.
2. Verificar el modelo de categorías por hogar.
3. Corregir/integrar el selector de categoría en la creación de gastos.
4. Validar que `create_expense()` reciba y valide correctamente la categoría.
5. Mostrar la categoría en los gastos.
6. Probar el flujo completo con los dos usuarios.
7. Continuar con las funcionalidades estrictamente necesarias para poder empezar a utilizar Balance en la vida real.

### Fuera del foco inmediato

No priorizar todavía:
- edición de nombre desde Ajustes;
- mejoras estéticas adicionales del Dashboard;
- responsive adicional si la interfaz actual funciona correctamente;
- generalización a más de dos miembros;
- servicios recurrentes;
- transferencias avanzadas;
- analytics;
- realtime;
- funcionalidades empresariales.

### Criterio de cierre del MVP

Balance se considerará listo para uso real cuando Pablo y Agostina puedan:

1. crear/unirse a un hogar;
2. invitar al segundo usuario;
3. crear un gasto categorizado;
4. indicar correctamente quién pagó;
5. generar automáticamente el split 50/50;
6. aprobar o rechazar el gasto desde el otro usuario;
7. ver únicamente gastos aprobados reflejados en el balance;
8. consultar gastos recientes y sus categorías;
9. registrar los pagos necesarios para saldar el balance;
10. repetir el flujo de forma confiable sin intervención manual desde Supabase.