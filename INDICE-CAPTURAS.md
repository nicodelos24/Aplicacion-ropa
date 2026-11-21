# Índice compartido de capturas — Ropa

Este archivo es el índice único para capturas de Nico, Alba, Bianca y Orion/QA. Las capturas que deban compartirse de forma duradera se guardan en `capturas/AAAA-MM-DD/` con nombres breves y descriptivos; se enlazan aquí con fecha, autor, pantalla/versión, motivo, evidencia relacionada y estado. No se incorporan imágenes de clientas ni datos reales sin autorización explícita.

## Cómo registrar una captura nueva

1. Guardar el original en `capturas/AAAA-MM-DD/` sin sobrescribir otros archivos.
2. Nombrar descriptivamente: `autor-pantalla-hallazgo.ext` (por ejemplo, `nico-detalle-pedido-cuotas.jpg`).
3. Agregar una fila abajo: fecha, quién la tomó, versión/commit o URL/demo si se conoce, descripción, enlace a archivo y task/recibo relacionado.
4. Para evidencia generada durante revisión o QA, indicar viewport/tema y vincular el informe/tarea; no dar por aprobada una ronda por adjuntar capturas.
5. Mantener este archivo y los registros/tareas como referencias; no mover ni borrar capturas históricas sin verificar sus enlaces.

## 2026-11-14 · Bianca · UX36 sobre cd851c7 — NO OK todavía

Nueva auditoría local terminada; no publicada. **[Informe UX36](Revision-Bianca-UX36.md)** · **[QA independiente de Orion](QA-Orion-UX35-cd851c7.md)** · [tarea](apx:tasks/task_4ed4698f7ca54723). Datos demo y foto sintética, no datos de clientas reales.

- **[Lámina resumen UX36](capturas/2026-11-14/ux36-bianca/bianca-ux36-resumen.png)**: error decimal sin mensaje, detalle largo desbordado y mismo pedido antes/después de borrar producto con foto de catálogo.
- [Carpeta UX36](capturas/2026-11-14/ux36-bianca/): **27 matrices fuente =162 combinaciones** de escena/ancho/tema, **8 capturas individuales**; los162 recortes PNG y las6 láminas JPG son derivados, no pruebas adicionales. Viewports320×568/393×740/1280×800, claro/oscuro; interacción independiente393×740.
- Matrices `home/agenda/orders/inventory/clients/history/settings` (cada nombre seguido de `-matriz.png`); formularios `newproduct/newcontact/neworder/neworder-bottom/editorder/detail`; vacíos `empty-*`; adversos `longdetail/longproduct-detail/photo-row/sixdetail/stateconfirm/agenda-selected/search90/search-none`.
- Individuales: `keyboard-background.png`, `decimal-sin-mensaje.png`, `invalido-cero.png`, `foto-quitar-editor.png`, `foto-catalogo-antes.png`, `foto-catalogo-despues.png`, `cliente-hechos.png`, `lightbox.png`. Snapshot `keyboard-listas.yml`. Todas en la carpeta UX36.
- No usar imágenes UX35 de0bc1a40 como evidencia de cd851c7. La suite23/23 no cierra los casos negativos de dinero; informe/recibo de Alba explican qué pasa y qué sigue abierto.

## Capturas registradas

| Fecha | Autor | Versión / contexto | Descripción | Archivo / evidencia | Estado |
|---|---|---|---|---|---|
| 2026-11-13 | Nico | Ropa v29 publicada según aviso recibido; el commit/versión exacta de la captura no está identificado aquí | Detalle de pedido en móvil: imagen ampliada sin un cierre suficientemente visible; chips de estado casi ilegibles; controles −/+ de cuota con baja visibilidad; botones de editar/borrar quedan ocultos por las tarjetas superpuestas. | [Captura original](capturas/2026-11-13/nico-detalle-pedido-estado-cuotas-superposicion.jpg) · [Tarea de corrección visual](apx:tasks/task_081ef3e96ee94aec) | Corregida y verificada en local por Bianca; sin publicar. Ver evidencia v30 abajo. |
| 2026-11-13 | Bianca | v23 / BV-13, revisión visual | Lámina y matrices visuales de la revisión v23, con veredicto NO OK y hallazgos R23-01–06. Evidencia permanece adjunta a la tarea; no se duplicó localmente al crear el índice. | [Evidencia adjunta a tarea](apx:tasks/task_611c67d04f724048) | No aprobación; historial referenciado |
| 2026-11-13 | Bianca | Corrección puntual de v29 → v30 local | Cuatro puntos de Nico implementados y verificados en demo; originales y lámina indexados abajo. La revisión general v24–v28 (`task_e7f969b9ca404a41`) no se cierra por este trabajo. | [Tarea](apx:tasks/task_081ef3e96ee94aec) · [Informe](Revision-Bianca-UX35.md) | OK visual local para este alcance; sin publicar |

## Evidencia de Bianca · corrección v29 · 2026-11-13

Tarea común: [task_081ef3e96ee94aec](apx:tasks/task_081ef3e96ee94aec). Base `eaaaf40`/cache v29; corrección **local, sin publicar**, rama `fix/visual-v29`, commit `66541f5`, cache preparada v30. Datos demo y fotos SVG sintéticas, no clientas reales. Viewports de navegador, no teléfono físico. Matriz adicional 360×800 medida sin captura propia. Detalle de pruebas/contrastes en [Revision-Bianca-UX35](Revision-Bianca-UX35.md).

| Autor / fecha | Contexto y pantalla | Captura | Estado / motivo |
|---|---|---|---|
| Bianca · 13/11 | v29 publicada · claro · 393×800 | [Antes: estados y cuotas](capturas/2026-11-13/bianca-v29-antes-claro-393.png) | Reproducción de bajo contraste; referencia histórica, no corrección |
| Bianca · 13/11 | v30 local · lámina con tres capturas originales 393×800 | [Resumen visual](capturas/2026-11-13/bianca-v30-resumen-visual.png) | Claro, oscuro y cierre explícito de foto; montaje documental, no pantalla nueva |
| Bianca · 13/11 | v30 local · pedido · claro · 320×800 | [Pedido claro 320](capturas/2026-11-13/bianca-v30-light-320-pedido.png) | Estados/cuotas/acciones visibles y última tarjeta fija al frente |
| Bianca · 13/11 | v30 local · pedido · oscuro · 320×800 | [Pedido oscuro 320](capturas/2026-11-13/bianca-v30-dark-320-pedido.png) | Misma comprobación, oscuro |
| Bianca · 13/11 | v30 local · pedido · claro · 393×800 | [Pedido claro 393](capturas/2026-11-13/bianca-v30-light-393-pedido.png) | Legibilidad y selección sin desplazarse |
| Bianca · 13/11 | v30 local · pedido · oscuro · 393×800 | [Pedido oscuro 393](capturas/2026-11-13/bianca-v30-dark-393-pedido.png) | Legibilidad y selección sin desplazarse |
| Bianca · 13/11 | v30 local · pedido · claro · 1280×900 | [Pedido claro escritorio](capturas/2026-11-13/bianca-v30-light-1280-pedido.png) | Hoja limitada y acciones accesibles |
| Bianca · 13/11 | v30 local · pedido · oscuro · 1280×900 | [Pedido oscuro escritorio](capturas/2026-11-13/bianca-v30-dark-1280-pedido.png) | Hoja limitada y acciones accesibles |
| Bianca · 13/11 | v30 local · foto ampliada desde inventario · 393×800 | [Cierre de imagen en inventario](capturas/2026-11-13/bianca-v30-lightbox-inventario-393.png) | Botón × Cerrar, fuera de la foto y de 44px |
| Bianca · 13/11 | v30 local · segundo toque del producto del pedido · 393×800 | [Foto del pedido](capturas/2026-11-13/bianca-v30-lightbox-pedido-393.png) | Misma capa y cierre; no elimina otras tarjetas |
| Bianca · 13/11 | v30 local · editar desde barra superior · 393×800 | [Editar abre](capturas/2026-11-13/bianca-v30-editar-pedido-393.png) | Formulario real tras tocar Editar con tarjeta seleccionada |
| Bianca · 13/11 | v30 local · eliminar desde barra superior · 393×800 | [Confirmación de eliminar](capturas/2026-11-13/bianca-v30-eliminar-cancelar-393.png) | Eliminar abre su confirmación; Cancelar conservó el pedido de prueba |
| Bianca · 13/11 | v30 local · seis productos/nombres largos · 320×568 | [Acciones tras scroll](capturas/2026-11-13/bianca-v30-320-scroll-tarjetas.png) | Barra sticky por encima de tarjetas, sin overflow |
| Bianca · 13/11 | v30 local · pedido oscuro · 320×568 | [Hoja en viewport corto](capturas/2026-11-13/bianca-v30-dark-320-corto.png) | Verificación complementaria en alto reducido |

## QA independiente de Orion · corrección v29 · 2026-11-13

- [Informe completo y referencias a snapshots](capturas/2026-11-13/orion-v30-qa.md), tarea `task_081ef3e96ee94aec`, commit `66541f5`, demo local, sesión `review-visual-v29`.
- **APPROVED sólo en los flujos ejecutados:** cuotas, estados rápidos, editar y eliminar/cancelar/confirmar con última tarjeta seleccionada; claro/oscuro. Sin fallos encontrados. No aprobación integral: lightbox, móvil y mediciones no pudieron instrumentarse en su sesión read-only; las comprobaciones de Bianca están separadas arriba.
- El informe registra los snapshots APX `8580208363054229514.1.8–.1.30` y los jobs de comprobación. No se afirma que esos snapshots sean archivos PNG locales; no se recibió una captura de imagen nueva de Orion para copiar en esta ronda.

## Correcciones de auditoría v32 · Alba · 2026-11-14

- [Informe local v33 y referencias a snapshots APX](capturas/2026-11-14/alba-v33-verificacion.md), commit `26fcf3c`, rama `fix/visual-v32`, worktree `.worktrees/fix-visual-v32`.
- Demo real en iframe 320/393/1280 claro/oscuro: **145/145 comprobaciones OK**, 0 errores JS capturados; 12/12 pruebas Node. Imágenes de Ajustes, detalle, editor y foto vistas en la sesión; no se exportaron PNG nuevos. Sin integrar/publicar.

## Revisión UX/UI v33 para mejoras v34 · Bianca · 2026-11-14

- Base: `3e48d0d`, demo pública `?demo=1`, caché `ropa-v33`. **43 capturas**, con siete vistas principales en claro/oscuro a 320/393/1280 y pruebas focales de altas, detalles, total mixto, validación, búsqueda y vacíos.
- [Índice de los 43 archivos, cobertura y límites](capturas/2026-11-14/ux-v33-indice.md) · [Hallazgos y prioridades en Revision-Bianca-UX35](Revision-Bianca-UX35.md) · [Tarea](apx:tasks/task_13ee081695514dfb).
- **Hallazgos y propuestas, no aprobación de v34.** No se modificó ni publicó la app. Datos demo e imagen sintética. Detalle de cuatro productos repetido aquí solo oscuro 320; demás cruces y límites físicos/funcionales explícitos en el subíndice. La revisión incluye capturas adicionales conservadas tras un reinicio de APX; no se repitió una evaluación cuyo permiso no llegó a tiempo.

## Alcance del índice

Este índice centraliza el material desde su adopción y enlaza evidencia histórica que sigue en tareas APX/recibos. Es posible que capturas antiguas aún no estén copiadas a `capturas/`; sus ubicaciones se agregan a medida que cada agente las identifica, sin afirmar que el repositorio ya contiene todo el archivo histórico.

## Segunda revisión extensa UX35 · Bianca · 2026-11-14

- [Informe completo](Revision-Bianca-UX35.md) · [QA funcional independiente de Orion](QA-Orion-UX35.md).
- [Lámina de hallazgos](capturas/2026-11-14/extensa-bianca/bianca-ux35-resumen.png).
- Matrices visuales: [320](capturas/2026-11-14/extensa-bianca/coverage-320.jpg) · [393](capturas/2026-11-14/extensa-bianca/coverage-393.jpg) · [1280](capturas/2026-11-14/extensa-bianca/coverage-1280.jpg).
- [Carpeta con 153 PNG y mosaicos](capturas/2026-11-14/extensa-bianca/): `<vista>-<tema>-<ancho>` = base; `sheet-*` = hojas, top/bottom; `empty-*` = vacíos; `long-*` = estrés; cámaras y hallazgos con nombres descriptivos. Incluye un PNG de fixture sintético, no sólo screenshots.
- Base local `0bc1a40`, publicación aún v33. NO OK por 9 hallazgos recién detectados; 4 datos/fotos confirmados por Orion y heredados. Cámara corregida OK. No teléfono/nube/lector completo. Sin código ni publicación.

## Ropa v2 · F0+F1 · Blas + Olga · 2026-11-18

- Base: worktree `.worktrees/f0-f1-visual`, rama `feat/f0-f1-visual` (commit `b23ce11` + segunda tanda). App navegando con datos demo (`index.html?demo=1`).
- **39 capturas** en `capturas/2026-11-18/`: `qa-*.png` y `*-det*.png` (QA Blas), `rev-*.png` (recorrido de Olga, 3 sesiones), `rev3-*.png` (ronda final: tema claro en 7 vistas, verificación de correcciones).
- [Informe con hallazgos y veredicto](Revision-Olga-F0F1.md) · [Tarea](apx:tasks/task_53820456ff864518).
- Correcciones aplicadas: moneda con decimales, truncado/superposición en inventario, `.cli-wa.none` claro, contraste `.cdot`, **persistencia de tema** (bug real), precache del SW, fechas "19 nov", aria duplicado del editor. Readiness 4/5.

## Ropa v2 · QA F0+F1 · Flor + fixes de Dino · 2026-11-18

- Base: commit `be8a545` (fixes) en `feat/f0-f1-visual`, worktree `.worktrees/f0-f1-visual`. [Informe QA](QA-Flor-F0F1.md).
- Correcciones de los 3 hallazgos (P2 precio $0, P3 clamp de cuotas, P3 categoría default): error inline "El precio debe ser mayor a $0" unificado en pedido editor e inventario; cuotas fuera de 2–12 con error "Entre 2 y 12 cuotas" sin clamp silencioso; productos a mano con "Accesorio / Otro" (👜) y selector enfocado en el alta.
- Capturas en `capturas/2026-11-18/qa-flor/fixes/`: [precio 0 bloqueado](capturas/2026-11-18/qa-flor/fixes/01-fix-precio-0-error.png) · [cuotas rechazadas](capturas/2026-11-18/qa-flor/fixes/02-fix-cuotas-error-inline.png) · [inventario con Otro](capturas/2026-11-18/qa-flor/fixes/03-fix-categoria-otro-inventario.png) · [alta con Otro + foco](capturas/2026-11-18/qa-flor/fixes/04-fix-categoria-default-foco.png).
- Verificado en Chrome (`index.html?demo=1`, origen limpio, 0 errores de consola); `npm test` en `.worktrees/v2-nucleo` 39/39. Commits `be8a545` + `34ab448`.

## Ropa v2 · REDESIGN TOTAL · Blas · 2026-11-18

- Base: worktree `.worktrees/f0-f1-visual`, rama `feat/redesign-v2`. Rediseño estético completo solicitado por Nico ("casera/parcheada" → profesional/moderno con dopamina visual).
- Tokens nuevos (`src/ui/tokens.css`): escala tipográfica, paleta 1 color marca + neutrales, sombras escalonadas, motion con spring; `prefers-reduced-motion` respetado. Íconos: set SVG inline propio en `src/ui/iconos.js` (cero emojis de texto suelto en las 7 secciones, verificado por DOM).
- **36 capturas** en `capturas/2026-11-18/redesign/`: `rd-<vista>.png` por sección (dark/light), `rd-editor-*` y `rd-*err` (validaciones QA conservadas), `rd-celebracion.png` (momento de pedido pagado).
- Capturas clave: [inicio dark](capturas/2026-11-18/redesign/rd-inicio-dark-top.png) · [pedidos con filtro](capturas/2026-11-18/redesign/rd-pedidos-filtro.png) · [detalle pedido](capturas/2026-11-18/redesign/rd-detalle-final.png) · [cuotas rechazadas](capturas/2026-11-18/redesign/rd-editor-cuotas-err.png) · [celebración pagado](capturas/2026-11-18/redesign/rd-celebracion.png) · [agenda con plegado](capturas/2026-11-18/redesign/rd-agenda-fold.png) · [ajustes dark](capturas/2026-11-18/redesign/rd-ajustes-dark.png) · [inicio light](capturas/2026-11-18/redesign/rd-inicio-light.png).
- Verificado en Chrome (`index.html?demo=1`): navegación 7 secciones, filtros de chips, editor pedido/producto/cliente con errores inline, celebración de pago, tema claro/dark persistente, 0 errores de consola.

## Rediseño total (dopamina visual) · Blas + Echo · 2026-11-18

- Pedido de Nico: rediseño estético total — sombras, jerarquía, animación, íconos SVG, sin emojis.
- Base: worktree `.worktrees/redesign-total`, rama `feat/redesign-total` (desde `35cb938`), app con datos demo (`index.html?demo=1`).
- [Brief de rediseño](BRIEF-REDESIGN.md): diagnóstico y dirección de diseño.
- **11 capturas** en `capturas/2026-11-18/` con prefijo `red-`: Inicio, Pedidos, Inventario, Contactos, Ajustes, Agenda, Historial y detalle de pedido (oscuro y claro) + verificación de chips de filtro en claro.
- Verificación: Inicio con moneycard protagonista y contadores animados, nav con píldora activa, halo de fondo, chips de estado con contraste ≥6.4:1, inventario a 2 columnas en móvil (≤560px). `node --check` OK en todo `src/`. Los tests `ui.test.cjs` y `check-syntax.cjs` son de v1 y fallan igual en la base (preexistentes).

## Abanico de tarjetas en detalle de pedido · Dino · 2026-11-19

- Base: worktree `.worktrees/abanico-detalle`, rama `feat/abanico-detalle` desde master `8cee94f`. Sin commit ni push (pendiente de OK de Nico).
- 18 capturas en `capturas/2026-11-19/abanico/` con 2/3/4 productos × 320/393/1280 × claro/oscuro, tarjeta del medio seleccionada. Ejemplos: [3 productos 320 dark](capturas/2026-11-19/abanico/abanico-3prod-320-dark.png) · [3 productos 393 light](capturas/2026-11-19/abanico/abanico-3prod-393-light.png) · [4 productos 1280 dark](capturas/2026-11-19/abanico/abanico-4prod-1280-dark.png).
- Abanico con rotación por índice (≤7°, 4 y 6+ productos más cerrado), tarjeta seleccionada +14px de alto y -14px de elevación, fondo con tinte de acento y halo; teclado y doble tap intactos. Medición con `getBoundingClientRect`, sin solape con título/ayuda y sin overflow horizontal en ninguna combinación.
- Fix de opacidad: el gradiente de `.dcard.sel` pasó de `var(--card2) → var(--acc-soft)` (translúcido) a `var(--card2) → color-mix(in srgb, var(--card2) 88%, var(--acc))` (alfa 1 en ambos temas); así el texto de las tarjetas de atrás ya no se filtra a través de la seleccionada.
- Segundo fix (texto colgante): con una tarjeta seleccionada, `.dcards:has(.dcard.sel) .dcard:not(.sel) .dcard-txt` queda en `opacity:0` (transición `var(--t-med)`); las inactivas muestran sólo icono + borde y su texto reaparece al seleccionarlas. Verificado en las 18 combinaciones con `getComputedStyle().opacity`: 1 en la seleccionada y 0 en el resto; al recorrer las tres tarjetas el foco de opacidad sigue a la seleccionada. Capturas regeneradas el 2026-11-19; crops ampliados de 3prod-320-dark, 3prod-393-light y 4prod-320-dark sin “Precio unitario” cortado bajo la seleccionada.
- Desvíos de la propuesta de Blas: se acotó el offset y el ancho para que la tarjeta no se coma el texto a 320px (piso de 162px de contenido), se compensó la proyección horizontal de la rotación restando del ancho y se reservaron 26px extra en la altura del stack para la punta rotada.
- Verificado en Chromium local (`index.html`, datos demo inyectados en localStorage, 0 errores JS en las 18 combinaciones); `node --check` OK en todo `src/`. Tests v1 (`ui.test.cjs`, `check-syntax.cjs`) siguen fallando en la base, fuera de esta tarea.
## Ropa v2 · Recheck visual B1+B2 · Flor · 2026-11-19

- Base: worktree `.worktrees/pulido-p3`, rama `feat/pulido-p3` (desde `master` `8cee94f`). Served HTTP (`python3 -m http.server 8813`, `index.html` con datos locales inyectados sin coincidencia en `due`), **393px**, tema claro y oscuro. Sin commits ni push.
- **4 capturas** en `capturas/2026-11-19/pulido-p3/`: [filtro vacío dark](capturas/2026-11-19/pulido-p3/01-pedidos-filtro-vacio-dark.png) · [filtro vacío light](capturas/2026-11-19/pulido-p3/02-pedidos-filtro-vacio-light.png) · [ajustes light](capturas/2026-11-19/pulido-p3/03-ajustes-light.png) · [ajustes dark](capturas/2026-11-19/pulido-p3/04-ajustes-dark.png).
- Verificado: (B1) chip "En cuotas (0)" sin búsqueda → "No hay pedidos con este filtro" + cuerpo "No hay pedidos en “En cuotas”. Probá con otro filtro o registrá uno nuevo." + botón "Nuevo pedido", en dark y light; búsqueda sin coincidencia sigue "Sin resultados" + "Nada coincide con …" (no cae en copy de filtro). (B2) tarjeta Apariencia con 0 `<p>` (sin el mensaje duplicado), un solo botón con texto accesible "Cambiar a modo claro/oscuro" y SVG `aria-hidden="true"`; tarjeta "Datos de demo" con `<h3>` visible en ambos temas. 0 errores de consola (1 warning inofensivo de meta `apple-mobile-web-app-capable` deprecated, preexistente).
- Sin desviaciones: el copy y la accesibilidad coinciden con lo esperado; no hizo falta corregir nada adicional en la rama.

## Ropa v2 · Tema unificado (B3) · Flor · 2026-11-19

- Base: rama `feat/pulido-p3`, worktree `.worktrees/pulido-p3`. Served HTTP (`python3 -m http.server 8815`, `index.html`, 393px, claro y oscuro). Sin commits ni push.
- Fix: única fuente de verdad `db().theme` en `ropa_v2_data`. Quitadas todas las lecturas/escrituras de `localStorage["ropa_v2_tema"]` en `src/main.js` y `src/pantallas/pantalla-ajustes.js` (0 referencias en `src/`). `setTema()` sigue guardando en `ropa_v2_data` y notificando; `aplicarTema()` ahora lee `db().theme`. Copy de B2 y tarjeta "Datos de demo" conservados; botón accesible con SVG `aria-hidden="true"`.
- **4 capturas** en `capturas/2026-11-19/tema-unificado/`: [claro inicial](capturas/2026-11-19/tema-unificado/01-claro-inicial.png) · [oscuro Ajustes](capturas/2026-11-19/tema-unificado/02-oscuro-ajustes.png) · [oscuro tras reload](capturas/2026-11-19/tema-unificado/03-oscuro-tras-reload.png) · [claro tras reload](capturas/2026-11-19/tema-unificado/04-claro-tras-reload.png).
- Verificado click→click→reload en ambos sentidos: (a) dark → #themeBtn → light+sol → #tema-btn Ajustes → dark+luna → reload persiste dark; (b) light → #tema-btn → dark → #themeBtn → light → reload persiste light. `documentElement.dataset.theme === ropa_v2_data.theme` en todos los pasos; `ropa_v2_tema` nunca reaparece. Prueba de robustez: con `ropa_v2_tema=dark` residual inyectado y `data.theme=light`, reload respeta `light` (el valor viejo se ignora). 0 errores de consola (1 warning preexistente de meta deprecated). `node --check` OK en los 2 archivos tocados.

## Vistas previas aprobadas sueltas · Dino · 2026-11-19

- Tres capturas que quedaron sin versionar de la integración del 19-nov, con datos demo (Paco, María Fernanda y montos de ejemplo), sin datos de clientas reales ni secretos.
- **Abanico en la vista previa del detalle**: [abanico-carta-preview-vista-previa.png](capturas/2026-11-19/abanico-carta-preview-vista-previa.png).
- **Barra con etiquetas siempre visibles**: [390px](capturas/2026-11-19/nav-etiquetas-390.png) · [320px](capturas/2026-11-19/nav-etiquetas-320.png).

## Barra inferior con nombres de sección siempre visibles · Dino · 2026-11-19

- Propuesta visual de Blas APROBADA por Nico ("quedó bien la barra mostrando los nombres de las secciones"). Base: worktree `.worktrees/nav-etiquetas`, rama `feat/nav-etiquetas-siempre` desde master `148a27b`, commit `c15a8de`. Sin push (pendiente de OK de Nico). [Tarea](apx:tasks/task_56131fad0b1b43c0).
- **4 capturas** en `capturas/2026-11-19/`: [390 dark](capturas/2026-11-19/nav-etiquetas-390-dark.png) · [390 light](capturas/2026-11-19/nav-etiquetas-390-light.png) · [320 dark](capturas/2026-11-19/nav-etiquetas-320-dark.png) · [320 light](capturas/2026-11-19/nav-etiquetas-320-light.png). Served HTTP (`python3 -m http.server 8912`, `index.html?demo=1#inicio`), Chrome del proyecto en contexto aislado, 0 errores JS (1 warning preexistente de meta deprecated).
- Fix: las 7 etiquetas reales (Inicio/Agenda/Pedidos/Inventario/Contactos/Historial/Ajustes) se muestran siempre (ícono arriba + texto abajo). Se reemplazan —sin `!important`— las reglas que las ocultaban (`max-width:0; opacity:0`) y el `max-width` del activo (`56px` en ≤560px) que recortaba "Contactos". `≤560px` ya no fija font-size (hereda 9px); nuevo `@media (max-width:360px)` con `nav{left:4px;right:4px;padding:0}` y etiquetas a 8px. Barra intacta: 70px alto, radius 24, fondo translúcido, sombras; color de etiqueta activo heredado de `--acc-text` del tema (mint en dark, teal oscuro en light).
- Verificado con `getComputedStyle` en las 4 combinaciones: 7 etiquetas con `max-width:none / opacity:1 / white-space:nowrap`, 9px a 390 y 8px a 320, barra 70px/radius 24 (left 8px+padding 4px a 390; left 4px+padding 0 a 320), sin solape entre etiquetas (`getBoundingClientRect`: "Contactos" 44.9px en botón 49.9px a 390; "Inventario"/"Contactos" ~39–40px en botones 42.1px a 320). Color activo `rgb(95,242,219)` dark y `rgb(5,104,92)` light. `npm run check` OK (48 archivos) y `npm test` 51/51 en verde.

## Integración v2 final en vivo · Dino · 2026-11-19

- Master `148a27b` → integración de 4 ramas (`feat/nav-etiquetas-siempre` 426d48f, `feat/agenda-vista-semanas` 6c51f40, `feat/abanico-carta` 64eb2c6, `feat/glow-dark-off` eac49cb) en worktree `.worktrees/integracion-v2`, rama `integration/v2-final`, merge `b93b02d`. Conflicto resuelto en `tests/ui.test.mjs` conservando los 3 bloques de tests (Semanas + 2 de abanico). `npm test` 56/56 y `npm run check` OK (48 archivos). Push a master y Pages propagado: `master=origin=5678e1a`.
- Fix incluido `5678e1a`: subida de versión del caché del service worker (`ropa-v2-f0f1-r3` → `ropa-v2-integracion-v2final-r4`); sin él los visitantes con el SW viejo seguían viendo los assets anteriores y no veían ninguna de las 4 mejoras. Test de regresión agregado en `tests/ui.test.mjs`.
- **5 capturas del vivo** (`https://nicodelos24.github.io/Aplicacion-ropa/?demo=1`, viewport 390 css, Chrome del proyecto) en `capturas/2026-11-19/integracion-v2-vivo/`: [barra con nombres + Inicio claro](capturas/2026-11-19/integracion-v2-vivo/01-barra-inicio-light.png) · [Semanas día 20 elegido claro](capturas/2026-11-19/integracion-v2-vivo/02-semanas-dia-elegido-light.png) · [Semanas día 20 elegido oscuro](capturas/2026-11-19/integracion-v2-vivo/03-semanas-dia-elegido-dark.png) · [abanico + glow oscuro apagado](capturas/2026-11-19/integracion-v2-vivo/04-abanico-glow-dark.png) · [abanico claro](capturas/2026-11-19/integracion-v2-vivo/05-abanico-light.png). 0 errores de consola (1 warning preexistente de meta deprecated). Datos demo, no clientas reales.
- Verificado en vivo: 6 assets cambiados byte-a-byte (`sha256sum` local = vivo), switch Calendario↔Semanas presente, día 20 resaltado mostrando solo el pedido de María Fernanda (Abrigo largo), barra con las 7 etiquetas, abanico de 2 tarjetas en el detalle de Paco (Camisa blanca $950 + Corbata $300) sin neon en oscuro. Pendiente: aprobación final de Nico; NO se hizo el ajuste de tarjetas más cuadradas tipo carta (viene después).

## Nav inferior auto-ocultable · Dino · 2026-11-21

- Rama `feat/nav-auto-ocultable`, worktree temporal aislado, base master `6877204` + merge de `origin/master` `c85dadd` (fotos demo). Cache del service worker `ropa-v2-nav-fotos-r7` (integrado con la rama de fotos demo). Demo local (`?demo=1`), 390×844 CSS, Chrome del proyecto (`kaia_chrome_ropaapp`), sin datos de clientas reales.
- **[Nav visible a 390px](capturas/2026-11-21/nav-auto-ocultable-390.png)**: barra inferior con las 7 secciones y etiquetas, estado visible tras toque. Verificado además en vivo con `getComputedStyle`: oculta = `translateY(92px)` + `opacity:0` + `pointer-events:none` + `aria-hidden="true"` en 210ms; visible = `translateY(0)` + `opacity:1`.
- Comportamiento comprobado en navegador real a 390px: wheel/scroll abajo oculta pasado ~70px y 8px de umbral; scroll arriba y toque muestran; inactividad de 3s scrolleada oculta; abrir `#hoja` fuerza visible y el temporizador no la oculta; `main::after` reserva `nav-h + 30px` fijo (sin salto al ocultar); FAB sigue accesible. `prefers-reduced-motion` sin transición.
- Fix incluido: el evento `scroll` llega después del `wheel` y la ventana de gesto se borraba al consumir el recorrido, por lo que subir no reaparecía la barra; se mantiene la ventana de gesto y se quitó el reanclado prematuro. Test de regresión agregado.
- `npm test` 69/69 y `npm run check` OK (52 archivos). Tarea [task_ec0b56e97d054cd1](apx:tasks/task_ec0b56e97d054cd1).
