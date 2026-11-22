---
name: balance-plan
description: Planificar cambios pequeños de Balance con alcance acotado, evidencia del repo y criterios de aceptación verificables antes de implementar.
---

# Plan de cambio pequeño para Balance

Las rutas de código que siguen son relativas a la raíz del repositorio, no a esta skill.

1. Leé `AGENTS.md` de la raíz y el pedido. Si se permite terminal, consultá `git status --short --branch` y `git diff --cached --name-status`; si no, solicitá esa evidencia a quien coordina. Identificá trabajo ajeno que deba quedar intacto.
2. Inspeccioná los archivos relevantes y `package.json`. No dependas de un checkpoint histórico para afirmar rama, autenticación, features o pruebas actuales.
3. Definí un único objetivo pequeño y observable por el usuario; anotá fuera de alcance. Si requiere nuevos dominios, migraciones remotas o decisiones financieras ambiguas, consultá antes de ampliar el trabajo.
4. Proponé la mínima lista de archivos a tocar y pasos concretos con sus dependencias. Respetá RPC/RLS, separación gasto/préstamo, contenido responsive único, tokens y tema existente.
5. Para cada criterio de aceptación indicá estado inicial, acción, resultado esperado y método de comprobación. Evitá criterios como “funciona bien”. Incluí errores y permisos si afecta datos; mobile/desktop y temas si afecta UI.
6. Elegí verificaciones reales: `npm run typecheck`, `npm run lint`, `npm run build` según alcance, y una matriz manual acotada. No existe script test/E2E en `package.json`; no lo inventes. Si es solo lectura, no ejecutes comandos que generen archivos.
7. Entregá el plan sin implementar ni hacer commit/push. La skill no amplía autorización. Separá preguntas bloqueantes de supuestos reversibles.

## Formato de salida

- Objetivo y fuera de alcance.
- Evidencia del estado actual (`archivo:línea`) y cambios preexistentes a proteger.
- Archivos previstos y pasos mínimos.
- Tabla: criterio de aceptación | acción/escenario | resultado esperado | verificación.
- Riesgos/regresiones y preguntas abiertas.
- Comandos y QA manual previstos, explícitamente aún no ejecutados.

Ejemplo de criterio para landing: con sesión cerrada, abrir `/`, activar “Empezar con Balance” y comprobar llegada a `/login` sin contenido privado; repetir con sesión activa y verificar el destino según membresía.
