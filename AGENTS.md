# Balance: guía para agentes

## Alcance y seguridad del trabajo

- Empezar por `git status --short --branch` y revisar el índice antes de preparar cambios. No asumir que la rama o el estado descritos en documentación histórica siguen vigentes.
- Respetar cambios preexistentes y limitarse al pedido. No descartar trabajo, cambiar de rama, hacer commit ni push sin autorización explícita. Preparar archivos por ruta, no con `git add .`.
- No leer ni publicar secretos de `.env.local`, credenciales ni datos personales. Usar datos ficticios para ejemplos y capturas.
- En auditorías de solo lectura no editar ni ejecutar comandos que generen archivos; pedir a quien coordina los diffs o resultados inaccesibles.

## Estructura y convenciones reales

- Next.js 14 App Router, React 18, TypeScript estricto y Tailwind CSS 3. Alias `@/*` desde la raíz; seguir nombres, imports y estilo del archivo vecino.
- `app/page.tsx` es la landing pública. Sus secciones están en `components/marketing/` y sus imágenes en `public/marketing/`. El showcase tiene capturas pendientes: no presentar placeholders como pantallas reales.
- `app/(auth)/` contiene el login; el flujo actual usa email y contraseña (`hooks/useAuth.ts`). `app/(app)/layout.tsx` protege las pantallas privadas con `components/shared/AuthGuard.tsx` y monta `AppShell`.
- Conservar Server Components cuando no se necesiten hooks o APIs del navegador; usar `"use client"` solo donde corresponda.
- UI reutilizable en `components/ui/`; hooks de datos en `hooks/`; operaciones de Supabase/RPC en `lib/`; cliente compartido en `lib/supabaseClient.ts`; tipos de base en `types/database.ts`.
- Consumir colores semánticos de `app/globals.css` y `tailwind.config.ts`. El tema se resuelve con `next-themes` en el layout raíz y tokens bajo `.dark`; no crear persistencia paralela ni hardcodear colores de UI salvo ilustraciones justificadas.
- Un solo contenido responsive: `components/layout/AppShell.tsx` cambia a sidebar desde `lg` (1024 px). No duplicar lógica mobile/desktop. Navegación compartida en `components/shared/navigationItems.ts`.
- Reutilizar `formatCurrency` de `lib/utils.ts` para ARS (`es-AR`) y `cn` para componer clases.
- Mantener texto de interfaz en español con voseo, estados de carga/error/vacío y accesibilidad de enlaces, botones y formularios. Usar `next/link` y `next/image` según patrones existentes.

## Invariantes de negocio

- El hogar objetivo tiene dos personas; gastos compartidos 50/50 y préstamos personales son dominios separados.
- El gasto nace pendiente con shares y aprobación; solo los aprobados impactan el balance. No dar por resuelta la política del centavo residual sin evidencia.
- Mutaciones críticas mediante RPCs, con RLS restrictiva. No reemplazarlas por DML directo desde la UI. Revisar autorización y atomicidad al tocar operaciones financieras.
- Migraciones en `supabase/migrations/`: no reescribir las históricas aplicadas; proponer migraciones incrementales y no aplicarlas al remoto sin autorización.
- No inferir funcionalidad completa por la existencia de una tabla o ruta. Por ejemplo, `lib/expenses.ts` envía `p_service_id: null`; verificar la UI antes de prometer asociación de servicios.

## Comandos existentes (desde la raíz)

Usar los scripts de `package.json`; el repositorio tiene `package-lock.json`.

| Comando | Propósito |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit`: comprobación TypeScript; puede actualizar el cache incremental. |
| `npm run lint` | `next lint`: revisión ESLint. |
| `npm run build` | `next build`: compilación de producción; genera `.next/`. |
| `npm run dev` | `next dev`: servidor para QA manual. |
| `npm run start` | `next start`: ejecutar un build de producción ya generado. |

No existe script `test` ni `e2e`. No inventar resultados ni considerar typecheck/lint/build sustitutos de pruebas funcionales. Para una auditoría estrictamente de lectura, informar estos comandos como pendientes en lugar de ejecutarlos.

## Verificación y entrega

- Para cambios de app autorizados, ejecutar typecheck, lint y build según alcance; registrar comando, resultado y bloqueos. No modificar configuración para ocultar fallos.
- Según lo afectado, revisar mobile (~390 px), desktop (1024 px y más), claro/oscuro/sistema, teclado, contraste, overflow y reducción de movimiento.
- Para auth y finanzas, verificar con dos usuarios: acceso, hogar/invitación, gasto, aprobación/rechazo, balance, préstamo/pago. No afirmar seguridad remota solo por leer migraciones.
- Para landing/PWA, comprobar anclas, CTA, sesión iniciada/cerrada, imágenes y arranque instalado en `/dashboard` (`app/manifest.ts`); distinguir instalación nueva de existente.
- Informar hallazgos por severidad con `archivo:línea`, impacto, evidencia y prueba verificable. Distinguir implementado, ejecutado, pendiente y supuesto.
- Usar `balance-plan` para planes chicos y `balance-qa` para revisar/evidenciar QA cuando corresponda. `balance-review` es un revisor de solo lectura: no puede editar ni usar terminal; pasarle diffs/resultados si los necesita. No delegar automáticamente sin autorización.
