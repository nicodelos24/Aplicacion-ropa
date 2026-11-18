# Revisión visual F0+F1 — Ropa v2 (Blas + Olga)

Fecha: 2026-11-18 · Alcance: shell + design system + 7 secciones + editor/detalle/hojas, navegando con datos demo (`index.html?demo=1`, worktree `.worktrees/f0-f1-visual`, rama `feat/f0-f1-visual`).

## Metodología

- Verificación en vivo con Chrome real (MCP `kaia_chrome_ropaapp` del proyecto), viewport 390×844: clicks reales, edición de formularios, tema claro/oscuro, emulación `prefers-reduced-motion`.
- Revisión de código de los puntos accesibles solo por CSS/markup (aria, media queries).
- Olga (revisora de diseño) recorrió flujos en vivo en tres sesiones (cortadas por reinicios de infraestructura, no por fallos de la app); sus hallazgos se corrigieron y se re-verificaron.
- Capturas: 20 de la primera ronda QA + 11 de Olga (`rev-*`) + 8 de esta ronda final (`rev3-*`) en `capturas/2026-11-18/` (39 en total).

## Hallazgos y correcciones aplicadas

| # | Hallazgo | Origen | Corrección | Verificado |
|---|----------|--------|------------|------------|
| 1 | `fmt()` mostraba `$1,250.5` (un decimal) en vez de `$1,250.50` | Olga | `src/nucleo/moneda.js`: 2 decimales solo si el monto los tiene (`$1,250.50`, `$0.50`, `$1,200` entero limpio) | Sí (tests 6/6 + vivo) |
| 2 | Títulos de inventario truncados; botones editar/borrar superpuestos sobre el placeholder | Olga | `componentes.css`: títulos con wrap, acciones en columna (34px, blur), padding del placeholder | Sí (captura rev3-04) |
| 3 | `.cli-wa.none` invisible en tema claro | Olga | variante tema claro | Sí (rev3-05) |
| 4 | `.cdot` sin contraste en claro | Olga | outline en tema claro | Sí (código + vivo) |
| 5 | **Tema no persistía al recargar** (botón del header) | Blas | `main.js`: header ahora guarda en `localStorage("ropa_v2_tema")` + store, mismo camino que el botón de Ajustes | Sí (click→reload→persiste, ambas direcciones) |
| 6 | 404 en consola: `estado/estado.js`, `datos/datos.js` en precache del SW | Blas | `sw.js`: precache actualizado a los archivos reales + bump de cache | Sí (0 errores consola) |
| 7 | Fechas de agenda "19 11" sin separador | Blas | `pantalla-inicio.js`: usa `fdateShort` → "19 nov" | Sí (vivo) |
| 8 | Aria duplicado "Estado Estado del pedido" en editor | Blas | `aria-label="Elegir estado"` | Sí (snapshot) |

## Verificaciones positivas (sin cambios)

- Las 7 secciones navegan con datos demo, sin errores de consola ni de página.
- Editor de pedido: cliente conocido detectado, producto "a mano" entra solo al inventario, cuotas, validación de precio con error inline.
- Detalle con +/− cuota que completa → estado `paid`, confirmación de cambio de estado.
- Tema claro legible en todas las secciones (rev3-01…08).
- `prefers-reduced-motion: reduce` → todas las animaciones a 0.01ms (emulado y confirmado en vivo).
- Búsqueda filtra en pedidos/inventario/contactos; filtros por chip (Nuevo, Pagado, Mensaje enviado, En cuotas).
- Historial con filtro por autor (Todos/Dueña/Socia).

## Pendientes (P3, para próximos hitos)

- Estado vacío de búsqueda/lista filtrada sin copy ("no encontré nada" cuando filtra a 0 con búsqueda o chip activo).
- Ajustes: duplicación de texto "Cambiar a modo oscuro 🌙" y la tarjeta "Datos de demo" sin título.
- Persistencia del tema entre sesiones: unificada la clave, pero el tema demo guarda `light/dark` en `ropa_v2_data` (vía store) y además en `ropa_v2_tema`; en F2 conviene dejar una sola fuente.
- En Inventario el "+" abre hoja de producto, no de pedido (diseño correcto según PLAN-V2, anotado para revisar con Nico si prefiere lo contrario).

## Veredicto

**Listo para revisión de Nico.** La app se ve y se siente completa en demo: navegación fluida, animaciones y transiciones con stagger/crossfade, hojas con gesto, tema claro/oscuro consistente, estados vacíos y accesibilidad razonable (aria, contraste, reduced-motion). Lo pendiente son cositas de copy y pulido, nada bloqueante. Readiness: **4/5** (el 5 depende de la mirada de Nico y de datos reales en F2).
