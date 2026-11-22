---
name: balance-qa
description: Revisar cambios de Balance, detectar regresiones y registrar con evidencia qué pruebas se ejecutaron, cuáles fallaron y cuáles quedan pendientes.
---

# QA de Balance

Las rutas de código que siguen son relativas a la raíz del repositorio. Registrar significa entregar evidencia en la respuesta; no crear ni actualizar un archivo de reporte salvo autorización explícita.

## Revisión

1. Leé `AGENTS.md` de la raíz y los criterios de aceptación acordados. Identificá alcance, base de comparación y cambios ajenos a preservar.
2. Si tenés permiso de terminal, revisá `git status --short --branch`, `git diff`, `git diff --cached` y el inventario de archivos nuevos (`git ls-files --others --exclude-standard`). Si no, pedí esos resultados. Inspeccioná también componentes y assets nuevos: el diff normal no los incluye.
3. Priorizá autorización e integridad financiera, luego auth/navegación, datos/carga/error/vacío, responsive/temas/accesibilidad y PWA. Citá `archivo:línea` y diferenciá regresión comprobada, problema preexistente y riesgo no confirmado.
4. Revisá `package.json` antes de ejecutar verificaciones. Los scripts actuales son `npm run typecheck`, `npm run lint` y `npm run build`; no hay test/E2E. No ejecutes servidores, comandos que generen archivos ni acceso remoto si el alcance es solo lectura o lo prohíben los permisos. No instales herramientas ni repares código automáticamente durante QA.
5. Para UI: mobile ~390 px y desktop >=1024 px; claro/oscuro/sistema; teclado/foco, contraste, overflow, imágenes, zoom y `prefers-reduced-motion`. Para landing, probá anclas y CTA con y sin sesión; para PWA, instalación nueva/existente y arranque en `/dashboard`.
6. Si cambia finanzas/auth, verificá con dos usuarios y datos ficticios: hogar/invitación, gasto 50/50, aprobación/rechazo, balance solo aprobado, préstamo y pago. Confirmá aislamiento de hogares cuando corresponda. No pruebes escrituras o bypasses contra producción sin autorización.
7. No equipares compilación con prueba funcional ni lectura de migraciones con seguridad remota. No presentes QA histórico como ejecutado sobre el cambio actual.

## Registro obligatorio de resultados

Entregá una tabla: comprobación/comando | contexto (rama, commit o diff, entorno/viewport/tema) | estado | evidencia/resultado.

Estados permitidos:
- **Ejecutada OK:** comando/escenario realizado y resultado observado.
- **Ejecutada con fallo:** error concreto y su impacto; no ocultarlo cambiando reglas.
- **Bloqueada:** intento o requisito que impidió verificar; explicar causa y responsable/próximo paso.
- **Pendiente:** no ejecutada; indicar motivo y cómo comprobarla.

Identificá si el resultado fue ejecutado por vos o informado por otra persona/agente. No marques como OK una prueba inferida del código.

Cerrá con hallazgos por severidad (`archivo:línea`, impacto y reproducción), criterios cubiertos/no cubiertos, riesgos residuales y recomendación de cierre condicionada a la evidencia. No hagas commit, staging ni push por invocar esta skill.
