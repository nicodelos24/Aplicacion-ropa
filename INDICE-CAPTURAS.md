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
- Carpeta `capturas/2026-11-14/ux36-bianca/` (se nombra sin enlace: un directorio no se sirve como página en Pages y devolvía 404): **27 matrices fuente =162 combinaciones** de escena/ancho/tema, **8 capturas individuales**; los162 recortes PNG y las6 láminas JPG son derivados, no pruebas adicionales. Viewports320×568/393×740/1280×800, claro/oscuro; interacción independiente393×740.
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
- Carpeta `capturas/2026-11-14/extensa-bianca/` (se nombra sin enlace, ídem: un directorio devolvía 404) con 153 PNG y mosaicos: `<vista>-<tema>-<ancho>` = base; `sheet-*` = hojas, top/bottom; `empty-*` = vacíos; `long-*` = estrés; cámaras y hallazgos con nombres descriptivos. Incluye un PNG de fixture sintético, no sólo screenshots.
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

## Fix animaciones: nav visible al ocultarse + velocidad · Dino · 2026-11-21

- Rama `fix/animaciones-nav-velocidad`, worktree `.worktrees/animaciones-nav-velocidad`, base `origin/master` `0ebd670`. Cache del service worker `ropa-v2-nav-fotos-r8`. Reporte de Nico 21-nov 21:49, diagnóstico con mediciones de Amber. Demo local (`?demo=1`), 390×844 CSS, Chrome del proyecto (`kaia_chrome_ropaapp`), 0 errores de consola (1 warning preexistente). Sin datos de clientas reales.
- **Causa 1**: `nav.oculta button{visibility:hidden}` cambiaba `visibility` en el mismo frame (no interpola), así que los íconos desaparecían de golpe aunque transform+opacity animaran 210ms. **Fix**: la nav base declara `visibility:visible` con `transition:visibility 0s`, y `.oculta button` usa `visibility:hidden` con `transition:visibility 0s linear var(--t-med)` (delay = duración del transform). Medido en vivo: a 60ms `opacity:0.42` + `translateY(53px)` con íconos `visible`; a 241ms (transform ya en 92px) pasan a `hidden`. Al volver a mostrar, `visible` vuelve en el mismo frame y se anima normal.
- **Causa 2**: apilamiento de duraciones — `.vista`/`.stagger` usaban `--t-slow:340ms` y delays 20→276ms (última tarjeta ~616ms), y `.hoja-in` 440ms. **Fix**: `--t-slow` 340→200ms, stagger 18ms por tarjeta con techo 120ms (delays 16/34/52/70/88/106/120ms), hoja 440→220ms. Medido en vivo: `--t-slow:200ms`, vista `0.2s`, primera tarjeta delay 16ms, hoja `hojaEntra 0.22s`.
- **3 capturas DESPUÉS** (390 css, local, fijando la animación con Web Animations API para el frame intermedio): [nav visible](capturas/2026-11-21/animaciones-01-nav-visible.png) · [nav a mitad del ocultado con íconos aún visibles](capturas/2026-11-21/animaciones-02-nav-ocultandose.png) · [pedido abierto (hoja a 220ms)](capturas/2026-11-21/animaciones-03-pedido-abierto.png).
- `npm test` 69/69 y `npm run check` OK (52 archivos). Sin tocar BD/Firebase ni artículos.

## Fix animaciones, 2da pasada: transición simétrica + quitar blur costoso · Dino · 2026-11-21

- Nico reportó (21-nov 22:16) que la transición de la barra seguía "un poco rota" al ocultar/reaparecer y lentitud en pedidos e inventario. Rama `fix/animaciones-nav-velocidad` (misma), desde `origin/master` `ff99532`. Cache del sw `ropa-v2-nav-fotos-r9`. Demo local (`?demo=1`), 390×844 CSS, Chrome del proyecto (`kaia_chrome_ropaapp`), 0 errores de consola (1 warning preexistente), sin datos reales.
- **Reproducción y medición**: trace rAF de la nav en la URL pública a 390px, scroll real abajo y arriba. Ocultar y reaparecer animaban con la misma curva ease-out de 210ms, pero el `visibility:hidden` con `transition-delay:210ms` del commit anterior creaba asimetría (íconos `hidden` al reaparecer hasta el final) y `pointer-events` saltaba de `none` a `auto` en el mismo frame. Sitio público medido con `navBlur: saturate(1.45) blur(22px)` y 5 capas de backdrop-filter activas; en inventario 10 botones `.inv-acciones` con `blur(10px)` y 5 fotos. Primer perfil (caché fría): 2 long animation frames de 97.9 y 85.2ms, 1 long task de 70ms, RecalcStyle 75→141ms, Layout 26→49ms. Con caché caliente los long frames no se repitieron de forma sostenida (A/B 0.1ms recalc en ambos) — el costo real es trabajo de paint por blur, no decode de fotos (las 5 fotos están `complete`, 480px naturales) ni re-render JS (ScriptDuration ~0ms).
- **Cambios**: (1) nav sin `backdrop-filter` ni reglas de `visibility`/delay — solo transform+opacidad con la MISMA curva en ida y vuelta; `aria-hidden` (en JS) + `pointer-events:none` mantienen accesibilidad y bloquean clics mientras oculta. Fondo opaco 92% equivalente. (2) botones de inventario sin `backdrop-filter:blur(10px)`, fondo `rgba(12,15,24,.9)` equivalente → 0 capas de blur en inventario (antes 10). (3) `render()` ya no fuerza reflow con `void main.offsetWidth`; usa cancelación de animaciones + flush de estilo (`getComputedStyle().animationName`).
- **Verificado tras el fix**: trace rAF en ambos sentidos con la misma curva simétrica y `visibility:visible` constante; 0 long frames en el perfil local; recalc 0.1ms, 8 layouts, nav sin blur y 0 capas de blur en inventario. Ajustes sigue arriba a la derecha, sin salto de layout, fotos y FAB intactos.
- **4 capturas DESPUÉS** (390 css, local, frame intermedio fijado con Web Animations API): [nav visible](capturas/2026-11-21/animaciones-v2-01-nav-visible.png) · [nav a mitad del ocultado](capturas/2026-11-21/animaciones-v2-02-nav-ocultandose.png) · [pedido abierto](capturas/2026-11-21/animaciones-v2-03-pedido-abierto.png) · [inventario sin blur en botones](capturas/2026-11-21/animaciones-v2-04-inventario.png).
- `npm test` 69/69 y `npm run check` OK (52 archivos). Sin tocar BD/Firebase ni artículos.

## Ropa v2 · Barra reaparece sola tras pausa · Dino · 2026-11-22

- Rama `fix/nav-reaparicion-pausa`, worktree `.worktrees/nav-reaparicion-pausa`, commit `a708176` (base `origin/master` `d1c40e3`). Caché del service worker `ropa-v2-nav-pausa-r10`. Servido local (`python3 -m http.server 8765`), Chrome del proyecto (`kaia_chrome_ropaapp`), 390 css, datos demo (`?demo=1`) y real sin flag, sin datos de clientas reales ni secretos. Sin push. [Tarea](apx:tasks/task_8433cb35c12b4897).
- **Comportamiento nuevo**: al bajar la barra se oculta igual que antes; si seguís bajando no rebota (un solo temporizador rearmado en cada gesto + memoria de última dirección); tras ~4,5 s quieto vuelve sola con la MISMA transición de 210 ms (`transform` + `opacidad`, sin blur/reflow) y se queda visible hasta un gesto nuevo; al subir o tocar sigue apareciendo al instante. Con capa abierta (hoja/modal/lightbox) no se oculta ni reaparece.
- **Verificado en navegador real**: las 7 secciones (Inicio, Agenda, Pedidos, Inventario, Contactos, Historial, Ajustes) en demo y en real sin flag; la barra oculta al bajar y vuelve a los ~4,5 s con `transform: translateY(0)` y `opacity:1` en todos los casos. 0 errores JS (1 warning preexistente de meta deprecated).
- **6 capturas** en `capturas/2026-11-22/`: [Inicio oculta](capturas/2026-11-22/inicio-nav-oculta.png) · [Inicio vuelve](capturas/2026-11-22/inicio-nav-vuelve.png) · [Pedidos oculta](capturas/2026-11-22/pedidos-nav-oculta.png) · [Pedidos vuelve](capturas/2026-11-22/pedidos-nav-vuelve.png) · [Inventario oculta](capturas/2026-11-22/inventario-nav-oculta.png) · [Inventario vuelve](capturas/2026-11-22/inventario-nav-vuelve.png). Todas con datos demo.
- `npm test` 69/69 y `npm run check` OK (52 archivos). Sin tocar Firebase/BD ni fotos demo en datos reales.

## Barra inferior: reaparece sola tras una pausa · Amber · 2026-11-22

- Pedido de Nico 22-nov. Rama `fix/nav-reaparicion-pausa` desde `origin/master` `d1c40e3`, publicada como `a708176`. Cache del service worker `ropa-v2-nav-pausa-r10`. Sin base de datos ni fotos nuevas en datos reales.
- Cambio visible: la barra baja al desplazarse hacia abajo, vuelve al subir o al tocar, y si queda oculta reaparece sola tras 4,5 s quietos con la misma transición de 210 ms. No vuelve a ocultarse hasta un gesto nuevo (sin oscilación). Los pasos pequeños de inercia al bajar rápido ya no revierten el ocultamiento (sin rebote).
- Verificado en la URL pública `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1` a 390×844: oculta al bajar, sigue oculta a los 4 s, visible a los 5 s y sigue visible a los 8 s; 0 errores y 0 avisos de consola. Las 7 secciones measuren la misma transición (`0.21s, 0.21s`) y sin `backdrop-filter`, incluidas pedidos e inventario.
- **6 capturas** (390 css, demo local): [Inicio, barra oculta](capturas/2026-11-22/inicio-nav-oculta.png) · [Inicio, barra vuelve](capturas/2026-11-22/inicio-nav-vuelve.png) · [Pedidos, barra oculta](capturas/2026-11-22/pedidos-nav-oculta.png) · [Pedidos, barra vuelve](capturas/2026-11-22/pedidos-nav-vuelve.png) · [Inventario, barra oculta](capturas/2026-11-22/inventario-nav-oculta.png) · [Inventario, barra vuelve](capturas/2026-11-22/inventario-nav-vuelve.png).
- Pruebas: nuevos `tests/nav-scroll.test.mjs` y `tests/nav-reaparicion-ui.test.mjs` en verde; `npm run check` OK (53 archivos). Fallo preexistente y no relacionado: `agenda: alternador Calendario ↔ Semanas…` falla también en `origin/master` sin estos cambios (fechas de la demo; depende del día). Revisión de secretos y datos de clientas: sin hallazgos en el diff. Tarea `task_8433cb35c12b4897`.

## Barra inferior: reaparición a medio segundo · Amber · 2026-11-22

- Pedido de Nico 22-nov: la barra, al quedar oculta bajando, vuelve a aparecer sola tras 500 ms quietos (antes 4,5 s). Rama `fix/nav-reaparicion-500ms` desde `origin/master` `9ec2912`. Cache del service worker `ropa-v2-nav-pausa-r11`. Sin tocar base de datos, datos reales ni fotos.
- Se compararon 400, 500 y 600 ms en navegador real a 390×844: con 400 ms la vuelta se siente apurada casi un parpadeo; con 600 ms se nota la espera; 500 ms resultó intencional y parejo. Medición con 500 ms: oculta al bajar en ~150 ms, empieza a volver a los ~500 ms y termina a ~700 ms con la MISMA curva de 210 ms; 0 errores y 0 avisos de consola.
- Verificado en las 7 secciones (Inicio, Agenda, Pedidos, Inventario, Contactos, Historial, Ajustes) con demo y sin flag: todas ocultan al bajar, vuelven tras la pausa, no oscilan y mantienen `transition 0.21s` sin `backdrop-filter`. Seguir bajando con eventos seguidos no rebota.
- **4 capturas** (390 css, local): [Inicio, barra oculta](capturas/2026-11-22/nav-500ms-inicio-oculta.png) · [Inicio, barra vuelve](capturas/2026-11-22/nav-500ms-inicio-vuelve.png) · [Pedidos, barra oculta](capturas/2026-11-22/nav-500ms-pedidos-oculta.png) · [Pedidos, barra vuelve](capturas/2026-11-22/nav-500ms-pedidos-vuelve.png).
- Pruebas: 9/9 en `tests/nav-scroll.test.mjs` y `tests/nav-reaparicion-ui.test.mjs`; `npm run check` OK (53 archivos). Fallo preexistente no relacionado: `agenda: alternador Calendario ↔ Semanas…` también falla en `origin/master` sin este cambio (depende de la fecha). Sin secretos ni datos de clientas en el diff.

## Ropa v2 · editor de pedido conserva la cantidad · Dino · 2026-11-22

- Rama `fix/pedido-cantidad-editor`, worktree `.worktrees/pedido-cantidad-editor`, base `bdcf046`. Caché del service worker `ropa-v2-pedido-cantidad-r14`. Hallazgo de Flor en la ronda «romper y pulir»; tarea [task_cea18e6f02ca4602](apx:tasks/task_cea18e6f02ca4602). Regla aplicada: opción A (preservar cantidad, sin tocar datos históricos del demo) mientras Nico no elija la B.
- **Causa**: el editor reconstruía el total sumando `price` sin `qty` y el store no normalizaba los ítems al guardar, así que editar el pedido de Rosita (2× Medias lanas $250, total $500) mostraba $250 y al guardar bajaba el total a $250.
- **Fix**: `pantalla-pedido-editor.js` lee `qty` de cada ítem del snapshot (sumando homónimos), muestra un stepper −/+ por producto y calcula con cantidad; `store.js` conserva los ítems originales si el llamador no los manda y normaliza `qty >= 1` al editar. Sin push; revisión visual final de Flor: **PASA**.
- **2 capturas de Flor** en `capturas/2026-11-22/`: [Editor de Rosita con Cantidad 2](capturas/2026-11-22/flor-importe-editor-rosita-editor-qty2.png) · [Guardado: Rosita conserva $500](capturas/2026-11-22/flor-importe-editor-rosita-guardado-500.png). Datos demo, sin clientas reales. Reemplazan al par `flor-importe-editor-antes/despues.png`, que mostraba Lucía/$1,400 y era engañoso.
- Verificado en pantalla por Flor en la revisión final: el editor abre con Cantidad 2 y Total $500, guardar conserva $500 y la tarjeta sigue legible a 320 px. `npm test` 75/75 y `npm run check` OK (53 archivos), incluidas dos pruebas de regresión nuevas en `tests/store.test.mjs` y `tests/ui.test.mjs`. Chrome del proyecto soltado por Flor.

## Pedido de Paco: editor muestra Corbata, no Medias lanas · Dino · 2026-11-22

- Rama `fix/paco-corbata-demo`, worktree `.worktrees/paco-corbata-demo`, base `origin/master` `6ae89eb` (rebaseado; integra el fix de nav a 2 s). Caché del service worker `ropa-v2-paco-corbata-r18`. Hallazgo NEW de la ronda «romper y pulir» de Flor, captura de origen `capturas/2026-11-22/qa-editor-paco-productos-incorrectos.png`; tarea `task_6e880409d7e74577`.
- **Causa**: en `demo.js` el ítem Corbata del pedido `d2` de Paco usaba `id: di5`, que en el inventario demo es «Medias lanas». El editor reconstruye la selección por `productoId`, así que mostraba Camisa blanca + Medias lanas ($1,200) en vez de Camisa blanca + Corbata ($1,250). Sin tocar las reglas del store ni del editor.
- **Fix (solo datos demo)**: Corbata tiene id propio `di6` y entra al inventario demo con nombre/precio/categoría (`otro`) y foto de muestra ficticia (`fotos/remera.jpg`, ya existente); el pedido `d2` referencia `inventory[5]`. Se sumó `di6` a `fotos-demo.js` para la marca «Foto de prueba · Demo». Sin datos reales.
- Verificado en demo local (`?demo=1`, Chrome del proyecto, tras limpiar el service worker stale): editor de Paco muestra **Camisa blanca $950 + Corbata $300 = Total $1,250**, sin Medias lanas. El detalle del pedido sigue mostrando $1,250 y «Camisa blanca · Corbata». 0 errores de consola.
- **1 captura** (demo local, 390 css): [Editor de Paco con Camisa blanca + Corbata $1,250](capturas/2026-11-22/qa-editor-paco-productos-corregidos.png).
- Pruebas: regresión nueva en `tests/ui.test.mjs` (abre el editor de `d2`, verifica productos, ids y precios); `npm test` 82/82 y `npm run check` OK (53 archivos).

## Barra inferior: reaparición a 2,5 s · Amber · 2026-11-22 · revisión visual aprobada por Nico

- Pedido de Nico 22-nov vía Nova: la barra auto-ocultable debe reaparecer a los 2–3 s en vez de a los 0,5 s actuales. Valor elegido: **2500 ms** (`REAPARICION_MS` en `src/ui/nav-scroll.js`). Rama `fix/nav-reaparicion-2500ms` desde `origin/master` `2db834e`, integrada por merge con el fix del toast y el vínculo clienteId ya publicados. Caché del service worker `ropa-v2-nav-2500ms-toast-r16` (r15 ya estaba publicada por el fix del toast). Sin tocar base de datos, datos reales ni fotos.
- Medición en navegador real (Chrome del proyecto, demo local, 390×844), repetida tras el hallazgo de Nova: con rueda real, tras el gesto la nav queda `oculta`, reaparece pasada la pausa de 2,5 s (`mostrarPorPausa`), sigue visible 3 s después (sin rebote) y mantiene la MISMA transición `0.21s, 0.21s`. Cronómetro interno de la medición ~2,0 s porque arranca después de la captura «oculta» (que consume ~0,5 s); el disparo real es a los 2500 ms de la última actividad, según `REAPARICION_MS`. 0 errores de consola. Tests de `nav-scroll.test.mjs` y `nav-reaparicion-ui.test.mjs` en verde.
- **Capturas del ciclo oculta→reaparecida** (demo local, `v2`: ocultar y capturar, esperar la pausa y capturar con la transición terminada, todo en un mismo bloque de Playwright): [390 claro oculta](capturas/2026-11-22/nav2500-v2-390-light-oculta.png) · [390 claro reaparecida](capturas/2026-11-22/nav2500-v2-390-light-reaparecida.png) · [390 oscuro oculta](capturas/2026-11-22/nav2500-v2-390-dark-oculta.png) · [390 oscuro reaparecida](capturas/2026-11-22/nav2500-v2-390-dark-reaparecida.png). Las parejas tienen md5 distinto (no son la misma imagen): la «oculta» no muestra barra y la «reaparecida» sí, con las 7 etiquetas, mint en la activa y sin neon en oscuro.
- Otras capturas de estado: [390 claro visible](capturas/2026-11-22/nav2500-390-light-visible.png) · [390 oscuro visible](capturas/2026-11-22/nav2500-390-dark-visible.png) · [320 claro visible](capturas/2026-11-22/nav2500-320-light-visible.png) · [320 oscuro visible](capturas/2026-11-22/nav2500-320-dark-visible.png). Las capturas v1 `nav2500-390-{light,dark}-{oculta,reaparecida}.png` se descartan: la etiquetada «reaparecida» era byte-idéntica a la «oculta» por un retardo entre medición y captura; NO usarlas como evidencia.
- Pruebas: `npm test` 75/75 y `npm run check` OK (53 archivos) en la rama original; tras el merge de integración se vuelven a correr en el resultado combinado. Sin secretos ni datos de clientas en el diff (solo fixture sintético demo). **Aprobado visualmente por Nico** (22-nov, vía Nova): mostró las capturas v2 correctas `nav2500-v2-390-light-oculta.png` y `nav2500-v2-390-light-reaparecida.png`, con md5 distintos, antes de autorizar la publicación. Nota de Chrome: no se abrieron pestañas nuevas para el merge/publicación (solo verificación HTTP del vivo).

## Aviso de error que tapaba el encabezado · Dino · 2026-11-22

- Hallazgo de la ronda «romper y pulir» de Flor: al guardar un pedido sin productos aparecía «Agregá al menos un producto» y el aviso quedaba flotando en `top:0` tapando el encabezado al ir a Inventario y a otras secciones, aunque el temporizador de 4,2 s hubiera vencido. Causa: `toast.js` no limpiaba el timer al mostrar otro aviso; `hoja.js`/`render()` solo recalculaban `espacioToast()`, que **revela** el aviso en vez de ocultarlo. No había ninguna llamada que ocultara el toast al cerrar la hoja ni al cambiar de sección.
- Fix en `fix/toast-persistente` (base `bdcf046`, rebaseado sobre `origin/master` `2db834e`): un único temporizador en `toast.js` con `ocultarToast()` que cancela el timer y quita la clase `mostrar`; se llama desde `cerrarHoja()` y desde `render()` en `main.js`. Cache del service worker `ropa-v2-toast-r15` (la r14 ya fue usada por el fix de cantidad).
- Verificado en demo local (`?demo=1`, 390×844): el aviso aparece al guardar sin productos; al cerrar la hoja e ir a Inventario queda `mostrar: false`, `opacity: 0`, `--toast-space: 0px`, hoja `hoja` (cerrada) y header libre; tras 4,4 s sigue oculto (no reaparece). 0 errores de consola.
- **2 capturas** (demo local, 390 css): [Antes — aviso tapando el header en Inventario](capturas/2026-11-22/toast-antes-inventario-tapando-header.png) · [Después — header libre en Inventario](capturas/2026-11-22/toast-despues-inventario-header-libre.png).
- Hallazgo 2 (hoja huérfana al guardar cliente): con repro limpia no se reproduce; la hoja cierra (`hojaCls: "hoja"`, `abierta: false`) y la nav responde al primer clic. Coincide con el caveat de la tarea (hubo `page.goto` y 4 clics fallaron en la sesión original). Sin cambio de código adicional.
- Pruebas: 3 regresiones nuevas en `tests/ui.test.mjs` (cerrar hoja, cambiar de sección, autocierre); `npm test` 78/78 (incluidas las regresiones de cantidad) y `npm run check` OK (53 archivos). Sin secretos ni datos de clientas en el diff. Tarea `task_ad007eca301d4d76`.

## Pedido editado se vincula a la clienta existente · Dino · 2026-11-22

- Hallazgo de ronda «romper y pulir» (Flor, por lectura de código; sin navegador entonces): al editar un pedido y cambiar el nombre a una clienta ya registrada, `editarPedido()` en `store.js` hacía `{ ...original, ...datos }` y los `datos` del editor no traían `clienteId`, así que el pedido no aparecía en la hoja de Contactos de esa clienta.
- Fix en `fix/clienteid-pedido` (base `bdcf046`): helper `vincularCliente()` resuelve el vínculo por el nombre final con `clientePorNombre()` (case-insensitive, sin espacios) y se aplica tanto en `crearPedido()` como en `editarPedido()`. Si el nombre es nuevo, queda `clienteId: null` (pedido suelto, sin crear clienta automáticamente).
- Verificado en demo local (`?demo=1`, 390×844, Chrome del proyecto): pedido `d2` de Paco editado con nombre «Rosita» → `clienteId: "dc1"`, cartel «Cliente conocido» del editor ya coincide con el guardado; Contactos pasó de «Rosita 2 pedidos / Paco 1 pedido» a «Rosita 3 pedidos / Paco sin pedidos» y el pedido editado figura en la ficha de Rosita. 0 errores de consola.
- **1 captura** (demo local, 390 css): [Pedido editado en la ficha de Rosita](capturas/2026-11-22/clienteid-pedido-editado-en-contactos.png).
- Pruebas: 3 regresiones nuevas en `tests/store.test.mjs` (edición con clienta registrada, nombre nuevo sin vínculo, case-insensitive); `npm test` 75/75 y `npm run check` OK (53 archivos). Sin secretos ni datos de clientas en el diff. Tarea `task_4aecdc7ba9024079`.

## Ropa v2 · QA funcional final sobre lo publicado · Flor · 2026-11-20

- Base: master/publicado `da5a47a` (= origin), vivo `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1`, navegación con Chrome del proyecto `kaia_chrome_ropaapp`. Visor de fotos verificado además en la demo pública `https://nicodelos24.github.io/ropa-v2-demo-fotos/` (mismo código, datos con fotos). Sin cambios de código. Tarea `apx:tasks/task_b732978120564726`.
- **9 capturas** en `capturas/2026-11-20/qa-flor/`: [lista Pedidos 390 claro](capturas/2026-11-20/qa-flor/02-pedidos-lista-390-light.png) · [detalle abanico 390 claro](capturas/2026-11-20/qa-flor/03-pedidos-detalle-abanico-390-light.png) · [detalle abanico 390 oscuro](capturas/2026-11-20/qa-flor/08-pedidos-detalle-abanico-390-dark.png) · [lista 320 claro](capturas/2026-11-20/qa-flor/04-pedidos-lista-320-light.png) · [detalle abanico 320 claro](capturas/2026-11-20/qa-flor/05-pedidos-detalle-abanico-320-light.png) · [detalle abanico 320 oscuro](capturas/2026-11-20/qa-flor/07-pedidos-detalle-abanico-320-dark.png) · [visor de foto 390 oscuro](capturas/2026-11-20/qa-flor/09-visor-foto-390-dark.png).
- Verificado en vivo: 7 secciones pintan su pantalla (Inicio, Agenda, Pedidos, Inventario, Contactos, Historial, Ajustes) con sus 7 etiquetas en la nav; switch Calendario↔Semanas con franja L16–D22 y filtro por día (día 21 → solo María Fernanda/Abrigo largo, día 20 → "Nada agendado", coherente con los datos demo); detalle de Pedidos con abanico de 2 tarjetas rotadas simétricamente y z-index por cercanía (Paco: Camisa blanca $950 + Corbata $300), primer toque trae al frente (eleva 10px, scale 1.037) sin abrir visor, segundo toque abre visor; sin overflow horizontal a 320 (scrollWidth=clientWidth=305) ni solape. Sin neon en modo oscuro y con footer de nav siempre etiquetado.
- Visor de foto ampliada confirmado en la demo de fotos: tarjetas con `data-ph` e `img.dthumb`, mismo flujo de doble toque → dialog "Foto ampliada" con botón de cierre que funciona. En `?demo=1` las tarjetas no traen foto (`data-ph=""`), por eso el texto de ayuda correctamente omite "otro toque amplía su foto" y el doble toque no abre visor (comportamiento esperado, no hallazgo).
- Consola: 0 errores en ambas URLs (1 warning preexistente e inofensivo de meta `apple-mobile-web-app-capable` deprecated en el vivo; 0 warnings en la demo de fotos). `npm test` 55/55 y `npm run check` OK (48 archivos) sobre master. Datos demo, sin clientas reales. **Veredicto QA: APPROVED, 0 hallazgos bloqueantes.** Nota menor no bloqueante: el detalle se cierra con Escape (verificado) además del botón X/Cerrar.

## Ropa v2 · revisión visual final sobre lo publicado · Olga · 2026-11-20

- Base: master/publicado `da5a47a` (=`origin`; `6877204` posterior es docs-only, diff de código vacío), vivo `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1` y demo de fotos `https://nicodelos24.github.io/ropa-v2-demo-fotos/`, Chrome del proyecto `kaia_chrome_ropaapp` (recibido suelto de Flor, devuelto suelto al terminar). Sin cambios de código. Tarea `apx:tasks/task_b732978120564726`.
- **12 capturas** en `capturas/2026-11-20/revision-olga/`: [Inicio 390 oscuro](capturas/2026-11-20/revision-olga/01-inicio-390-dark.png) · [Inicio 390 claro](capturas/2026-11-20/revision-olga/02-inicio-390-light.png) · [lista Pedidos 390 claro](capturas/2026-11-20/revision-olga/03-pedidos-lista-390-light.png) · [detalle abanico 390 claro](capturas/2026-11-20/revision-olga/04-pedidos-abanico-390-light.png) · [switch Agenda 390 claro](capturas/2026-11-20/revision-olga/05-agenda-switch-390-light.png) · [Semanas 390 claro](capturas/2026-11-20/revision-olga/06-agenda-semanas-390-light.png) · [día sin entregas 390 claro](capturas/2026-11-20/revision-olga/07-agenda-vacio-390-light.png) · [búsqueda sin resultados 390 claro](capturas/2026-11-20/revision-olga/08-busqueda-vacia-390-light.png) · [Historial 390 claro](capturas/2026-11-20/revision-olga/09-historial-390-light.png) · [Ajustes 390 claro](capturas/2026-11-20/revision-olga/10-ajustes-390-light.png) · [Inicio 320 oscuro](capturas/2026-11-20/revision-olga/11-inicio-320-dark.png) · [visor de foto 390 oscuro](capturas/2026-11-20/revision-olga/12-visor-foto-390-dark.png).
- Revisado en vivo: 7 secciones con jerarquía y contraste coherentes en claro/oscuro a 390 y 320; nav con 7 etiquetas legibles sin solape; tarjeta "Por cobrar" protagonista con número tabular; chip/estados y progreso de cuotas legibles; abanico del detalle de Pedidos simétrico con z-index por cercanía (primer toque eleva 10px/scale 1.037 sin abrir visor, medido por `getComputedStyle`); visor con foto ampliada y X fuera de la imagen; estados vacíos con copy útil ("Sin resultados… Probá con otro nombre", "Nada agendado este día"); `prefers-reduced-motion` → animaciones 1e-05s; sin overflow a 320 (`scrollWidth=clientWidth=305`); consola 0 errores (1 warning preexistente de meta deprecated). No se encontró ningún hallazgo que rompa lo pedido.
- Notas menores P3, no bloqueantes: en Agenda→Semanas, antes de elegir día, aparecen dos textos de ayuda casi seguidos ("Tocá un día para ver sus pedidos" dentro de la franja y "Tocá un día de la franja para ver sus pedidos." debajo); al elegir día se reduce a uno. Los chips de filtro de Pedidos desbordan horizontalmente de forma intencional (scroll). El header sticky tapa el switch de Agenda al desplazarse ~49px, comportamiento estándar. **Veredicto visual: sin objeciones** (la decisión final de aprobación es de Nico).

## Ropa v2 · cierre de la revisión final · 2026-11-20

- **Flor · QA funcional: APPROVED, 0 hallazgos bloqueantes.** `npm test` 55/55 · `npm run check` OK (48 archivos) · consola 0 errores (1 warning preexistente de meta deprecated). 7/7 secciones, Semanas con switch y filtro por día, detalle de Pedidos con abanico simétrico y visor (confirmado con fotos en `ropa-v2-demo-fotos`), sin overflow a 320 ni neon en dark. 9 capturas en `capturas/2026-11-20/qa-flor/` (enlazadas en la sección QA de este índice).
- **Olga · revisión visual: sin objeciones, 0 hallazgos bloqueantes.** 12 capturas en `capturas/2026-11-20/revision-olga/` (sección inmediatamente anterior). Notas menores P3 no bloqueantes, detalladas arriba. Chrome del proyecto `kaia_chrome_ropaapp` usado por Flor y devuelto suelto a Olga, y devuelto suelto por Olga al terminar.
- Base revisada por ambos: `da5a47a` (= origin; `6877204` posterior es docs-only, diff de código vacío). Sin cambios de código. Capturas quedan locales: publicarlas es una decisión aparte con OK de Nico. Tarea `apx:tasks/task_b732978120564726` cerrada con estos veredictos; la aprobación final de producto sigue siendo de Nico.

## Ropa v2 · ronda «romper y pulir» incremental sobre 9e45b49 · Flor · 2026-11-22

- Base: `origin/master` `9e45b49`, vivo `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1`, Chrome del proyecto `kaia_chrome_ropaapp` (turno exclusivo, recibido en `about:blank`). Sin cambios de código, sin tareas nuevas, sin publicar. Datos demo (`?demo=1`), sin clientas reales.
- **0 hallazgos reales** en la cobertura pedida; 3 falsos positivos descartados (demo viejo persistido en `localStorage` con Corbata `di5`/Medias lanas/$1,200; `REAPARICION_MS` 500 local vs 2000 servido — master local 5 commits detrás de origin; chips de `#chips` con `overflow-x:auto` a 320 que no desbordaron el documento). Consola 0 errores (1 warning preexistente de meta `apple-mobile-web-app-capable` deprecated). `npm test` 81/81 y `npm run check` OK (53 archivos).
- **10 capturas** (demo fresco, scale css): [Inicio claro 390](capturas/2026-11-22/flor-ronda-inicio-claro-390.png) · [Pedidos claro 390](capturas/2026-11-22/flor-ronda-pedidos-claro-390.png) · [detalle Paco claro 390](capturas/2026-11-22/flor-ronda-paco-detalle-claro-390.png) · [editor Paco claro 390](capturas/2026-11-22/flor-ronda-editor-paco-claro-390.png) · [editor cantidad 2 claro 390](capturas/2026-11-22/flor-ronda-editor-cantidad2-claro-390.png) · [editor nombre Rosita claro 390](capturas/2026-11-22/flor-ronda-editor-cliente-rosita-claro-390.png) · [Contactos claro 390](capturas/2026-11-22/flor-ronda-contactos-claro-390.png) · [Pedidos claro 320](capturas/2026-11-22/flor-ronda-pedidos-claro-320.png) · [Pedidos claro 1280](capturas/2026-11-22/flor-ronda-pedidos-claro-1280.png) · [Pedidos oscuro 1280](capturas/2026-11-22/flor-ronda-pedidos-oscuro-1280.png).
- Verificado en vivo: Paco $1,250 con Camisa blanca $950 + Corbata $300 (sin Medias lanas), guardar sin cambios no altera el total; Rosita $500 con contador «− 2 +» queda `qty:2`/total 500 al guardar; editar nombre a Rosita vincula `clienteId:"dc1"` y aparece en su ficha de Contactos; nav se oculta al scrollear y reaparece a ~2 s de pausa en Inicio, Pedidos, Inventario y Contactos sin tapar encabezados; sin desbordes de documento ni textos cortados a 320/390/1280, claro y oscuro. Chrome devuelto suelto en `about:blank` al terminar.

## Ronda de QA «romper y pulir» — 22-nov-2026 (demo pública, versión ya publicada)

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Historial | 1280 | claro | [flor-ronda2-historial-1280-claro.png](capturas/2026-11-22/flor-ronda2-historial-1280-claro.png) |
| Historial | 320 | oscuro | [flor-ronda2-historial-320-oscuro.png](capturas/2026-11-22/flor-ronda2-historial-320-oscuro.png) |
| Ajustes | 1280 | oscuro | [flor-ronda2-ajustes-1280-oscuro.png](capturas/2026-11-22/flor-ronda2-ajustes-1280-oscuro.png) |
| Ajustes | 320 | claro | [flor-ronda2-ajustes-320-claro.png](capturas/2026-11-22/flor-ronda2-ajustes-320-claro.png) |
| Agenda (filtro por día) | 1280 | oscuro | [flor-ronda2-agenda-filtro-dia-1280-oscuro.png](capturas/2026-11-22/flor-ronda2-agenda-filtro-dia-1280-oscuro.png) |
| Agenda (vista Semanas) | 320 | claro | [flor-ronda2-agenda-semanas-320-claro.png](capturas/2026-11-22/flor-ronda2-agenda-semanas-320-claro.png) |
| Pedido sin productos (mensaje de validación) | 320 | claro | [flor-ronda2-pedido-sin-productos-mensaje.png](capturas/2026-11-22/flor-ronda2-pedido-sin-productos-mensaje.png) |
| Agenda (hallazgo del «+», ya corregido: ver cierre abajo) | 320 | claro | [flor-ronda2-agenda-texto-tapado-320-claro.png](capturas/2026-11-22/flor-ronda2-agenda-texto-tapado-320-claro.png) |

El hallazgo del «+» de esta ronda **ya está cerrado**: se corrigió en `3f68a17` y se verificó sobre el sitio publicado (`0ad6bb7`, capturas `fix-agenda-320-vivo-*.png` en el cierre de abajo); la tarea quedó cerrada y no hay nada pendiente de esta ronda. La imagen se conserva como evidencia histórica del estado anterior. El resto de la ronda no mostró fallos. La cobertura anterior del día (editor de pedidos, vínculo de cliente, aviso del encabezado, barra y pantallas Inicio/Pedidos/Contactos/Inventario) ya está documentada en este índice y no se repitió.

Cierre del hallazgo del «+» (22-nov, sitio público ya publicado, 320×720): [Agenda claro, texto completo y FAB separado](capturas/2026-11-22/fix-agenda-320-vivo-claro.png) · [Agenda oscuro, lo mismo](capturas/2026-11-22/fix-agenda-320-vivo-oscuro.png). Medición en vivo: texto x=34..209, «+» x=229..287 (20 px de separación, sin solape) en claro y oscuro; el «+» abre «Nuevo pedido». Fix: `componentes.css` reserva la columna del FAB en `@media (max-width:360px)`.

## Rectificación de enlaces del índice · Dino · 2026-11-22

- Auditoría con `curl` + caché-buster sobre los 131 enlaces de este índice publicado: **110 respondían 200 y 21 daban 404**. No hubo secciones duplicadas ni se borró evidencia: solo se corrigió a dónde apunta cada enlace.
- **19 capturas del 2026-11-20 subidas en este mismo cambio** (`capturas/2026-11-20/qa-flor/` 7 y `capturas/2026-11-20/revision-olga/` 12): existían en local pero nunca se habían versionado, así que sus enlaces en las secciones de Flor y Olga daban 404 en Pages. Sin cambios de código; datos demo, sin clientas reales.
- **2 enlaces a carpetas** (`capturas/2026-11-14/ux36-bianca/` y `extensa-bianca/`) se dejaron como ruta en texto: un directorio no se sirve como página en Pages. Los archivos concretos de esas carpetas siguen enlazados y responden 200.
- Las **10 capturas `flor-ronda-*`** de la ronda sobre `9e45b49` se verificaron con caché-buster: **200 image/png con tamaño real** y están versionadas desde `5f91fb0`. No se subió nada por ellas; la duda de que faltaran era un falso positivo.
- Ronda2: el «+» ya estaba corregido en `3f68a17`, publicado y verificado (`0ad6bb7`). El cierre de su sección se reescribió para decir que está cerrado y remitir a las capturas `fix-agenda-320-vivo-*.png`; la imagen del hallazgo queda como evidencia histórica.

## Ajuste visual Agenda (22-nov-2026) — pendiente del visto de Nico, NO publicado

Pedido de Nico por video: (1) tocar una fecha del calendario no debe repetir la animación de entrada del almanaque; (2) la vista Semanas debe mostrar un indicador claro de qué días tienen contenido. Capturas sobre la rama `fix/agenda-anim-y-indicadores` (demo local, sin tocar la barra a 1,5 s ni datos reales):

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Vista Semanas con indicadores de color | 390 | oscuro | [agenda-semanas-indicadores-oscuro.png](capturas/2026-11-22/agenda-semanas-indicadores-oscuro.png) |
| Calendario al tocar fechas, sin reanimación | 390 | oscuro | [agenda-calendario-sin-reanimacion-oscuro.png](capturas/2026-11-22/agenda-calendario-sin-reanimacion-oscuro.png) |
| Video corto: tocar 3 fechas seguidas sin que el almanaque se abra de nuevo | 390 | oscuro | [agenda-tocar-fechas-sin-reanimacion.mp4](capturas/2026-11-22/agenda-tocar-fechas-sin-reanimacion.mp4) |

Los puntos de la franja ahora tienen color asignado (antes no tenían regla CSS y eran invisibles) y los días con entregas llevan fondo sutil. Tests 84/84 y `npm run check` OK. **Sin publicar**: falta el visto de Nico. (Nota 23-nov: este ajuste quedó ya publicado dentro de `6c8a9e6` en master; la rama local `fix/agenda-anim-y-indicadores` y su nota aquí quedan como histórico.)

## Ropa v2 · ronda «romper y pulir» de interfaz visual · Olga · 2026-11-22/23

- Base: master/publicado `99bbd6d` (barra reaparece a los 90 s), vivo `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1`, Chrome del proyecto `kaia_chrome_ropaapp` (en turno exclusivo, devuelto suelto). Sin cambios de código. Tarea `apx:tasks/task_b4616270d0b044ef`.
- **22 capturas** en `capturas/2026-11-23/`: [Agenda 320 claro](capturas/2026-11-23/olga-agenda-320-claro.png) · [Agenda 390 claro](capturas/2026-11-23/olga-agenda-390-claro.png) · [Agenda 390 oscuro](capturas/2026-11-23/olga-agenda-390-oscuro.png) · [Agenda 1280 claro — hallazgo 1](capturas/2026-11-23/olga-agenda-1280-claro.png) · [Pedidos 1280 oscuro — hallazgo 1](capturas/2026-11-23/olga-pedidos-1280-oscuro.png) · [Pedidos 390 claro](capturas/2026-11-23/olga-pedidos-390-claro.png) · [Pedidos 390 oscuro](capturas/2026-11-23/olga-pedidos-390-oscuro.png) · [búsqueda sin resultados, Contactos 390 claro](capturas/2026-11-23/olga-contactos-vacio-busqueda-390-claro.png) · [búsqueda sin resultados, Pedidos 390 claro](capturas/2026-11-23/olga-pedidos-vacio-busqueda-390-claro.png) · [editor con nombre largo 390](capturas/2026-11-23/olga-editor-nombre-largo-390.png) · [detalle con varias prendas 320 claro](capturas/2026-11-23/olga-pedidos-detalle-abanico-320-claro.png) · [barra oculta 390](capturas/2026-11-23/olga-nav90s-oculta-390.png) · [barra reaparecida 390](capturas/2026-11-23/olga-nav90s-reaparecida-390.png) · [Inicio 390 claro](capturas/2026-11-23/olga-inicio-390-claro.png) · [Inicio 390 oscuro](capturas/2026-11-23/olga-inicio-390-oscuro.png) · [Inventario 390 claro](capturas/2026-11-23/olga-inventario-390-claro.png) · [Inventario 390 oscuro](capturas/2026-11-23/olga-inventario-390-oscuro.png) · [Contactos 390 claro](capturas/2026-11-23/olga-contactos-390-claro.png) · [Contactos 390 oscuro](capturas/2026-11-23/olga-contactos-390-oscuro.png) · [Historial 390 claro](capturas/2026-11-23/olga-historial-390-claro.png) · [Historial 390 oscuro](capturas/2026-11-23/olga-historial-390-oscuro.png) · [Ajustes 390 oscuro](capturas/2026-11-23/olga-ajustes-390-oscuro.png).
- Revisado: 7 secciones en claro/oscuro a 320/390/1280, vacíos de búsqueda con copy claro, nombre de cliente largo truncado sin romper el editor, detalle multi-prenda legible, barra de 90 s se oculta y reaparece sin romper nada; hallazgos previos (+ de Agenda 320, aviso/hoja huérfana) no se repiten.
- **Hallazgo 1 (mejora, no urgente)**: en desktop 1280 px la app usa una columna angosta centrada y se desperdicia espacio a los costados (evidencia: `olga-agenda-1280-claro.png`, `olga-pedidos-1280-oscuro.png`). Se ve prolijo; queda como mejora de aprovechamiento de pantalla ancha para una próxima ronda. Registrada como `task_320f6be506434b37` (prioridad baja).

## Ropa v2 · aprovechar el ancho en computadora (hallazgo 1 de Olga) · Dino · 2026-11-23

- Base: rama `feat/desktop-ancho` sobre master `6c8a9e6`. Demo local (`?demo=1`), sin datos reales. Tarea `apx:tasks/task_320f6be506434b37`.
- **Antes** (1280 px, contenido en columna de 560 px centrada): [Inicio oscuro](capturas/2026-11-23/dino-antes-1280-oscuro-inicio.png) · [Pedidos oscuro](capturas/2026-11-23/dino-antes-1280-oscuro-pedidos.png) · [Inventario oscuro](capturas/2026-11-23/dino-antes-1280-oscuro-inventario.png) · [Contactos oscuro](capturas/2026-11-23/dino-antes-1280-oscuro-contactos.png) · [Agenda claro](capturas/2026-11-23/dino-antes-1280-claro-agenda.png) · [Historial claro](capturas/2026-11-23/dino-antes-1280-claro-historial.png).
- **Después** (1280 px, ancho útil 1200 px): [Inicio oscuro](capturas/2026-11-23/dino-despues-1280-oscuro-inicio.png) · [Pedidos oscuro (2 columnas)](capturas/2026-11-23/dino-despues-1280-oscuro-pedidos.png) · [Inventario oscuro (5 por fila)](capturas/2026-11-23/dino-despues-1280-oscuro-inventario.png) · [Contactos claro (3 columnas)](capturas/2026-11-23/dino-despues-1280-claro-contactos.png) · [Agenda claro (calendario + entregas lado a lado)](capturas/2026-11-23/dino-despues-1280-claro-agenda.png) · [Agenda oscuro](capturas/2026-11-23/dino-despues-1280-oscuro-agenda.png) · [Agenda oscuro con «otras entregas» desplegadas](capturas/2026-11-23/dino-despues-1280-oscuro-agenda-otras-entregas.png) · [Historial oscuro (2 columnas)](capturas/2026-11-23/dino-despues-1280-oscuro-historial.png) · [Ajustes oscuro (2 columnas)](capturas/2026-11-23/dino-despues-1280-oscuro-ajustes.png).
- **Celular sin cambios** (mismos anchos de siempre, sin scroll horizontal, sin errores de consola): [Pedidos 320 oscuro](capturas/2026-11-23/dino-despues-320-oscuro-pedidos.png) · [Inventario 320 claro](capturas/2026-11-23/dino-despues-320-claro-inventario.png) · [Inicio 390 claro](capturas/2026-11-23/dino-despues-390-claro-inicio.png) · [Inicio 390 oscuro](capturas/2026-11-23/dino-despues-390-oscuro-inicio.png) · [Pedidos 390 oscuro](capturas/2026-11-23/dino-despues-390-oscuro-pedidos.png) · [Contactos 390 oscuro](capturas/2026-11-23/dino-despues-390-oscuro-contactos.png) · [Agenda 390 claro](capturas/2026-11-23/dino-despues-390-claro-agenda.png).
- Medición en vivo a 1280×800: `#main` pasa de 560 a 1200 px; inventario 3→5 columnas, pedidos 1→2, contactos 1→3, historial 1→2. La barra inferior auto-ocultable sigue igual (536 px, fija abajo). Pruebas: `npm test` verde y `npm run check` OK, con `tests/escritorio.test.mjs` cubriendo los breakpoints y que el celular no cambie.
## Ropa v2 · guardar solo con confirmación · Dino · 2026-11-23

- Base: master `11753c3` (ya con el ancho de escritorio); rama `fix/confirmacion-guardado-ediciones` (worktree `.worktrees/confirmacion-guardado-ediciones`). Chrome del proyecto `kaia_chrome_ropaapp` (usado y devuelto suelto). Demo local en `http://127.0.0.1:8931/?demo=1`.
- Requerimiento de Nico: nada se guarda sin confirmación explícita. Las cuotas del detalle dejan de autoguardarse (`+/−` cuentan en memoria; `Guardar cuotas` persiste, `Descartar` revierte) y los editores de pedido, inventario y cliente avisan con `confirmar.js` antes de cerrar con cambios sin guardar (X, Cancelar, toque en el fondo, Escape y atrás del navegador).
- Verificado además por JS en el navegador real: subir/bajar cuotas sin persistir, Descartar, Guardar (queda `Pagó 2 de 3` y cierra sin preguntar), aviso al cerrar por X y Escape (el aviso consume su Escape y no se reabre encima), y los tres editores avisando con el valor escrito conservado. 0 errores de consola.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Detalle: cuotas pendientes con «sin guardar» y Guardar/Descartar | 390 | claro | [confirmacion-cuotas-pendientes-390.png](capturas/2026-11-23/confirmacion-cuotas-pendientes-390.png) |
| Detalle: cuotas pendientes a 320 | 320 | claro | [confirmacion-cuotas-pendientes-320.png](capturas/2026-11-23/confirmacion-cuotas-pendientes-320.png) |
| Aviso «¿Salir sin guardar las cuotas?» | 390 | claro | [confirmacion-aviso-salir-cuotas-390.png](capturas/2026-11-23/confirmacion-aviso-salir-cuotas-390.png) |
| Aviso «¿Salir sin guardar las cuotas?» a 320 | 320 | claro | [confirmacion-aviso-salir-cuotas-320.png](capturas/2026-11-23/confirmacion-aviso-salir-cuotas-320.png) |
| Aviso «¿Salir sin guardar el pedido?» en el editor | 320 | claro | [confirmacion-aviso-editor-pedido-320.png](capturas/2026-11-23/confirmacion-aviso-editor-pedido-320.png) |

### QA independiente (Flor) · 2026-11-23

Misma rama, servida en `http://127.0.0.1:8739/index.html?demo=1` a 320 px con el Chrome del proyecto. Verificado en navegador real: `+` mueve el contador y la barra sin escribir en `ropa_v2_data` (sigue `cuotasPagadas: 1`), tope 3/3 y piso 0, `Descartar` revierte, las cinco vías de cierre del detalle (X, Cerrar, fondo, Escape, atrás) avisan y conservan el cambio al cancelar (el atrás rearma `{hoja:1}`), `Guardar cuotas` persiste y celebra al completar, y los tres editores avisan solo con cambios. `npm test` 101/101 y `npm run check` OK.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Cuotas pendientes «2 de 3 sin guardar» (revisión QA) | 320 | claro | [qa-flor-cuotas-pendientes-320.png](capturas/2026-11-23/qa-flor-cuotas-pendientes-320.png) |
| Aviso «¿Salir sin guardar las cuotas?» (revisión QA) | 320 | claro | [qa-flor-aviso-salir-cuotas-320.png](capturas/2026-11-23/qa-flor-aviso-salir-cuotas-320.png) |

### Cierre del hallazgo y publicación · 2026-11-23

- Hallazgo de Flor: `abrirHoja()` limpiaba la guardia, así que al reabrir el detalle o cancelar el aviso de cambio de estado, las cuotas pendientes se perdían sin preguntar. Arreglado en `f235805`: la guardia solo la limpia el cierre forzado o el cierre ya confirmado, con dos tests nuevos (`npm test` 103/103).
- Caché de la PWA a `ropa-v2-nav-1500ms-r22` y `componentes.css?v=3` (`21ec0a1`), para que las clientas no queden con los estilos viejos.
- Publicado en master (`21ec0a1`). Verificado en vivo sobre https://nicodelos24.github.io/Aplicacion-ropa/?demo=1: `sw.js` sirve `r22` y `main.css` pide `componentes.css?v=3`; en el detalle de Lucía `+` deja «Pagó 2 de 3 sin guardar» sin tocar `ropa_v2_data` (sigue 1), cancelar el aviso de «Mensaje enviado» conserva el pendiente, y cerrar por X pregunta «¿Salir sin guardar las cuotas?»; salir sin guardar deja el pedido en 1 de 3. 0 errores de consola.

## Ropa v2 · animación de la agenda y los chips · Dino · 2026-11-23

- Base: master `21ec0a1` (ya con el ancho de escritorio, el pliegue de otras entregas y el guardado con confirmación), rama `fix/agenda-anim-vistas`, vivo local `127.0.0.1:4193/index.html?demo=1` (Chrome del proyecto, viewport 390 y 320, tema oscuro). Demo, sin datos de clientas. Tarea `apx:tasks/task_88cf235b2ebc48cc`.
- Qué se animó: el switch Calendario ↔ Semanas entra con crossfade + deslizo corto (200 ms); las flechas de mes y de semana reescriben solo la grilla / la franja y esa pieza entra deslizando desde el lado de la flecha (220 ms, ±30 px); el chip activo de Pedidos e Historial entra con el tono del stagger de las tarjetas (220 ms) y su punto se enciende. Todo con `transform`/`opacity`, `prefers-reduced-motion` respetado y el mismo lenguaje `--t-fast/med/slow`/`--ease-out` de `motion.css`.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Vista Semanas ya asentada (referencia) | 390 | oscuro | [agenda-anim-semanas-390.png](capturas/2026-11-23/agenda-anim-semanas-390.png) |
| Cambio de semana a mitad del deslizo | 390 | oscuro | [agenda-anim-semana-cambio-medio-390.png](capturas/2026-11-23/agenda-anim-semana-cambio-medio-390.png) |
| Calendario tras cambiar de mes, sin desborde a 320 | 320 | oscuro | [agenda-anim-calendario-320.png](capturas/2026-11-23/agenda-anim-calendario-320.png) |
| Chip «Pagados» activo tras filtrar | 320 | oscuro | [agenda-anim-chips-320.png](capturas/2026-11-23/agenda-anim-chips-320.png) |

- Medido en el navegador: `chipOn` 0,22 s y `agendaCambia` 0,2 s / 0,22 s activos (no `none`), `#main` conserva una sola animación (`.vista`, no se relanza), 30 cambios de mes seguidos en 384 ms y sin desborde horizontal a 320 px. Tests 108/108 y `npm run check` OK (sobre master `0178a02`, ya con el guardado con confirmación, sin pisarlo). Push a master `6419213` autorizado por Nico.

### Verificación del vivo · 2026-11-23

- Publicado en master (`6419213`). Verificado en vivo sobre https://nicodelos24.github.io/Aplicacion-ropa/?demo=1: `sw.js` sirve `ropa-v2-nav-1500ms-r23`, `main.css` pide `motion.css?v=3`, y en la agenda real el switch a Semanas devuelve `agendaCambia`, las flechas de semana y de mes dan `agendaCambia` con `data-dir="prox"`, el chip de Pedidos y el de Historial dan `chipOn`, y `#main` sigue con una sola animación. 0 errores de consola.

### Recorte del desborde del deslizo a 320 px · 2026-11-23

- QA de Flor: durante `agendaCambia` con `data-dir="prox"` a 320 px el `scrollWidth` del documento subía de 305 a 316 px mientras corría el deslizo (y volvía solo al terminar). Arreglo en `src/ui/base.css`: `#main{overflow-x:clip}` — recorta el pico sin crear contexto de scroll (`hidden`) ni tocar márgenes, `agendaCambia` ni `.vista`. Caché de la PWA a `ropa-v2-nav-1500ms-r24` y `base.css?v=3`.
- Medido en el Chrome del proyecto a 320 px (viewport útil 305 px, tema oscuro y claro), con la animación congelada a mitad del deslizo (`agendaCambia` en `translateX(30px)`): sin el clip el documento da 316 px; con el clip se queda en 305 px. Barrido de 5 px durante 320 ms en cuatro cambios de mes y tres de semana: pico 305 px, sin un píxel de desborde. Las siete pantallas en reposo siguen en 305 px, el `topbar` sigue pegado arriba y la hoja de detalle se abre sin desborde.
- `npm test` 109/109 (108 + el nuevo del clip) y `npm run check` OK.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Deslizo de mes congelado a mitad, sin desborde (medidor en pantalla) | 320 | oscuro | [dino-agenda-320-clip-deslizo-pausado.png](capturas/2026-11-23/dino-agenda-320-clip-deslizo-pausado.png) |
| Deslizo de semana congelado a mitad, sin desborde | 320 | oscuro | [dino-agenda-320-clip-semana-pausada.png](capturas/2026-11-23/dino-agenda-320-clip-semana-pausada.png) |
| Deslizo de mes congelado a mitad, tema claro | 320 | claro | [dino-agenda-320-clip-deslizo-claro.png](capturas/2026-11-23/dino-agenda-320-clip-deslizo-claro.png) |

#### Verificación del vivo · 2026-11-23

- Publicado en master (`2e7049a`). Chrome del proyecto sobre https://nicodelos24.github.io/Aplicacion-ropa/?demo=1 a 320 px (viewport útil 305 px): `sw.js` sirve `ropa-v2-nav-1500ms-r24`, `main.css` importa `base.css?v=3` y `#main` computa `overflow-x: clip`. Barrido cada 5 ms durante 320 ms: tres cambios de mes y dos de semana con pico 305 px (0 px de desborde, antes 316); `agendaCambia` 0,22 s con `data-dir="prox"` intacto. 0 errores de consola.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Calendario en el vivo publicado, sin desborde tras los cambios de mes | 320 | oscuro | [dino-agenda-320-clip-vivo.png](capturas/2026-11-23/dino-agenda-320-clip-vivo.png) |

## Ropa v2 · Inventario por secciones (decisión B) · Dino · 2026-11-23

- Secciones propias de la clienta para ordenar el inventario: crear, renombrar, borrar (las prendas pasan a «Sin sección», nunca se borran) y asignar prendas. El inventario se muestra en cajones plegables por sección, con «Sin sección» al final, contador y búsqueda que filtra dentro de cada cajón.
- Ajustes de Olga aplicados y medidos en el Chrome del proyecto a 390 px: blancos táctiles de 28 controles (`.sec-toggle`, `.sec-acc`, `.sec-nueva`, tarjetas y acciones) todos ≥44 px y sin solapamientos (hit-test en el centro de cada uno); carets que bajan al abrir y vuelven a la derecha al plegar (`aria-expanded` acompañando); copy del cajón vacío «Todavía no hay prendas acá. Editá una prenda y elegí esta sección.». En la hoja: X 44×44, filas de 52 px, input de 50 px y botón Crear 92×50.
- Sin desborde horizontal (documento 375 px sobre viewport de 390), fotos sin roturas, 0 errores de consola. `npm test` 132/132 y `npm run check` OK.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Inventario agrupado por secciones con cajones y contadores | 390 | claro | [secciones-inventario-390-claro.png](capturas/2026-11-23/secciones-inventario-390-claro.png) |
| El mismo inventario en tema oscuro | 390 | oscuro | [secciones-inventario-390-oscuro.png](capturas/2026-11-23/secciones-inventario-390-oscuro.png) |
| Hoja «Tus secciones» con renombrar y borrar por fila | 390 | oscuro | [secciones-hoja-390-oscuro.png](capturas/2026-11-23/secciones-hoja-390-oscuro.png) |
| Cajón recién creado y vacío, con el copy de estado vacío | 390 | oscuro | [secciones-vacia-390-oscuro.png](capturas/2026-11-23/secciones-vacia-390-oscuro.png) |

## Ropa v2 · Inventario con buscador, filtros y orden (decisión 1) · Dino · 2026-11-23

- Buscador del inventario con **chips de categoría y contador**, **selector de orden** (Los últimos, Más usados, Nombre A–Z, Precio menor a mayor y mayor a menor) y **vista alterna lista/grilla** (variante 3 de las maquetas: foto mini, nombre, sección, «N pedidos» y precio). El orden actúa dentro de cada cajón de sección; «más usados» cuenta unidades de todos los pedidos.
- Con un filtro puesto los cajones vacíos se ocultan; sin coincidencias el vacío dice la búsqueda y el filtro y ofrece «Quitar filtros». Los filtros son de pantalla: no tocan datos ni el inventario guardado.
- Medido en el Chrome del proyecto: sin desborde (documento 405 px sobre 420 y 305 px sobre 320), filas de 56-57 px, controles de 44 px, 0 errores de consola. `npm test` 147/147 y `npm run check` OK.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Inventario con chips de categoría y selector de orden (grilla de siempre) | 390 | claro | [inventario-filtros-grilla-390-claro.png](capturas/2026-11-23/inventario-filtros-grilla-390-claro.png) |
| Vista alterna lista: foto mini, sección, pedidos y precio | 390 | claro | [inventario-vista-lista-390-claro.png](capturas/2026-11-23/inventario-vista-lista-390-claro.png) |
| La misma lista en oscuro, con el selector de orden y el botón «Grilla» | 420 | oscuro | [inventario-vista-lista-420-oscuro-2.png](capturas/2026-11-23/inventario-vista-lista-420-oscuro-2.png) |
| Lista a 320 px: sin desborde, precio y acciones sin pisarse | 320 | oscuro | [inventario-vista-lista-320-oscuro.png](capturas/2026-11-23/inventario-vista-lista-320-oscuro.png) |
| Filtro «Vestido» puesto: un solo cajón y «1 producto en Vestido» | 390 | claro | [inventario-filtro-vestido-lista-390-claro.png](capturas/2026-11-23/inventario-filtro-vestido-lista-390-claro.png) |
| Búsqueda que no coincide con el filtro: vacío con «Quitar filtros» | 420 | oscuro | [inventario-filtros-vacio-420-oscuro.png](capturas/2026-11-23/inventario-filtros-vacio-420-oscuro.png) |

#### Verificación del vivo · secciones · 2026-11-23

- Publicado en master (`8e3784e`; los commits de secciones son `f8430f4`, `3280427` y `567ce5d`). Chrome del proyecto sobre https://nicodelos24.github.io/Aplicacion-ropa/?demo=1: `sw.js` sirve `ropa-v2-nav-1500ms-r26` y `/src/ui/componentes/secciones.css` responde 200.
- Primer ingreso con el service worker viejo: al abrir «Inventario» la consola tiró `The requested module '../estado/store.js' does not provide an export named 'secciones'` y la pantalla quedó en Inicio (el SW r25 seguía sirviendo `store.js` previo a `f8430f4`). Con el registro y la caché viejos descartados, la app del vivo carga sin errores y muestra los tres cajones con su contador.
- Medido en el vivo a 390 px: cajones «Dama · verano/2», «Hombre · básicos/2», «Sin sección/2», chips de categoría con contador. A 320 px (viewport útil 305 px) documento 305 px, sin desborde; 27 controles medidos (cajones, acciones, botón de secciones, tarjetas, chips) todos ≥44 px de alto. Caret con `transform: matrix(0, -1, 1, 0, 0, 0)` al abrir y `aria-expanded` acompañando; cajón nuevo vacío con el copy «Todavía no hay prendas acá. Editá una prenda y elegí esta sección.». Hoja «Tus secciones» con las cuatro filas y su contador (Interior/0 incluida). Filtro «Vestido» dejó un cajón de dos prendas. 0 errores de consola con la caché al día.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Inventario del vivo con cajones por sección y cajón nuevo vacío | 390 | oscuro | [dino-secciones-vivo-390-oscuro.png](capturas/2026-11-23/dino-secciones-vivo-390-oscuro.png) |
| Hoja «Tus secciones» en el vivo, con contadores | 390 | claro | [dino-secciones-vivo-hoja-390-claro.png](capturas/2026-11-23/dino-secciones-vivo-hoja-390-claro.png) |
| Los mismos cajones a 320 px, sin desborde | 320 | oscuro | [dino-secciones-vivo-320-oscuro.png](capturas/2026-11-23/dino-secciones-vivo-320-oscuro.png) |
- QA de Flor sobre la rama (`8e3784e`): [inventario 390 claro](capturas/2026-11-23/flor-secciones-inventario-390-claro.png) · [390 oscuro](capturas/2026-11-23/flor-secciones-inventario-390-oscuro.png) · [320 oscuro](capturas/2026-11-23/flor-secciones-inventario-320-oscuro.png) · [vista lista 320](capturas/2026-11-23/flor-secciones-vista-lista-320-oscuro.png) · [hoja de secciones](capturas/2026-11-23/flor-secciones-hoja-390-oscuro.png).

#### Verificación del vivo · salto de caché r26→r27 (generación del service worker) · 2026-11-23

- **El incidente.** El SW r25 dejaba en caché `store.js` previo a `f8430f4` y el build r26 lo importaba con `secciones`: primer ingreso, `The requested module '../estado/store.js' does not provide an export named 'secciones'`, Inventario no montaba (línea de arriba).
- **Reproducido** en el Chrome del proyecto con el mismo origen y dos árboles servidos: build previo (`2075d4c`, SW r24) navegado, y al cambiar el servidor al código r26 la recarga mezcló `main.js` nuevo con el `store.js` viejo de caché: `... does not provide an export named 'exportar'`. Se repitió con una entrada `store.js` sin `exportar`/`secciones` escrita a mano en la caché.
- **Arreglo** (`sw.js`, commit `0e32ae7`): una caché por generación, cada asset precargado con `?gen=<VERSION>` (una caché anterior no puede contestar la clave nueva), respuesta desde caché solo cuando la generación precargó entera y borrado de la anterior en `activate`. `VERSION` en `r27`; test nuevo `tests/sw-generacion.test.mjs` (5 casos) corre el `sw.js` real en `node:vm` con un `store.js` viejo cacheado.
- **Verificado en el vivo** (`0e32ae7` en master, Pages sirviendo `const VERSION = "r27"`): página abierta sin registro, `?demo=1#inventario` monta el Inventario con los tres cajones, `caches` queda solo en `ropa-v2-nav-1500ms-r27` con 34 claves y 0 errores de consola. Recorrido Pedidos → Inicio → Inventario a 320 px sin errores. `npm test` 152/152 y `npm run check` OK.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Inventario del vivo tras el arreglo, cajones por sección | 390 | oscuro | [dino-sw-r27-inventario-390-oscuro.png](capturas/2026-11-23/dino-sw-r27-inventario-390-oscuro.png) |
| El mismo inventario en claro | 390 | claro | [dino-sw-r27-inventario-390-claro.png](capturas/2026-11-23/dino-sw-r27-inventario-390-claro.png) |
| Inventario a 320 px sin desborde | 320 | claro | [dino-sw-r27-inventario-320-claro.png](capturas/2026-11-23/dino-sw-r27-inventario-320-claro.png) |

## Ropa v2 · Pedido con filas compactas por sección (decisión Y) · Dino · 2026-11-23

- El armado del pedido deja la grilla de tarjetas y pasa a **filas compactas de 52 px agrupadas por sección** (maqueta Y de Blas con los ajustes de Olga), para no perder el hilo del pedido mientras se elige. Cada cabecera de sección es plegable y lleva el badge **elegidos/total** (se tiñe cuando la sección tiene algo elegido); arriba, un buscador filtra dentro de las secciones.
- Buscar **nunca deselecciona**: lo elegido que no coincide con la búsqueda se mantiene a la vista con su check, y si nada coincide el vacío dice la búsqueda y tiene «Quitar búsqueda» sin perder lo marcado. Lo elegido va primero dentro de su sección (después lo más usado y lo último cargado) y plegar una sección no toca la selección ni el total; el contador del pie dice «N productos elegidos».
- Medido en Chromium 390 px (y 320/1280): filas de 52 px, check de 22 px con objetivo táctil de la fila entera, 0 px de desborde horizontal y 0 errores de consola. `npm test` 161/161 y `npm run check` OK (61 archivos).

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Selector del pedido agrupado por sección con badge y elegidos marcados | 390 | oscuro | [dino-pedido-filas-390-dark.png](capturas/2026-11-23/dino-pedido-filas-390-dark.png) |
| El mismo selector en tema claro | 390 | claro | [dino-pedido-filas-390-light.png](capturas/2026-11-23/dino-pedido-filas-390-light.png) |
| Buscando: filtra dentro de las secciones y mantiene lo elegido | 390 | oscuro | [dino-pedido-filas-buscar-390-dark.png](capturas/2026-11-23/dino-pedido-filas-buscar-390-dark.png) |
| Buscando en claro | 390 | claro | [dino-pedido-filas-buscar-390-light.png](capturas/2026-11-23/dino-pedido-filas-buscar-390-light.png) |
| Búsqueda sin coincidencias: vacío con salida y los elegidos a la vista | 390 | oscuro | [dino-pedido-filas-vacio-390-dark.png](capturas/2026-11-23/dino-pedido-filas-vacio-390-dark.png) |
| El mismo vacío en claro | 390 | claro | [dino-pedido-filas-vacio-390-light.png](capturas/2026-11-23/dino-pedido-filas-vacio-390-light.png) |
| Una prenda más elegida y una sección plegada: badge 1/2 y «3 productos elegidos» | 390 | oscuro | [dino-pedido-filas-elegido-390-dark.png](capturas/2026-11-23/dino-pedido-filas-elegido-390-dark.png) |
| Lo mismo en claro | 390 | claro | [dino-pedido-filas-elegido-390-light.png](capturas/2026-11-23/dino-pedido-filas-elegido-390-light.png) |

#### Verificación del vivo · selector del pedido por sección (r28) · 2026-11-23

- Publicado en master (`1bdca3a`) y servido por Pages: `sw.js` ya responde `const VERSION = "r28"` con `picker.css` y `pedido-picker.js` en el precache.
- Chrome con registro limpio sobre `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1`: el pedido de Paco abre con **3 secciones** (Dama · verano 2, Hombre · básicos 1/2, Sin sección 1/2), **6 filas de 52 px**, Camisa blanca y Corbata marcadas, total $1,250 y «2 productos elegidos»; `caches` queda solo en `ropa-v2-nav-1500ms-r28`, 0 px de desborde horizontal y 0 errores de consola en claro y oscuro.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Selector del pedido por sección en el vivo (r28) | 390 | oscuro | [dino-pedido-vivo-390-dark.png](capturas/2026-11-23/dino-pedido-vivo-390-dark.png) |
| El mismo selector en el vivo, tema claro | 390 | claro | [dino-pedido-vivo-390-light.png](capturas/2026-11-23/dino-pedido-vivo-390-light.png) |

## Ropa v2 · Sin negro+naranja en carteles (pedido de Nico) · 2026-11-23

- A pedido de Nico se evacúa el par negro+naranja de la interfaz, sobre todo en modo oscuro. El naranja queda **sólo** en el estado «Mensaje enviado» (excepción explícita): badge, chip, borde de tarjeta, punto de calendario/agenda e ícono de reloj siguen igual.
- Lo que se cambió: el ícono y el botón de aceptar de **todos los carteles de confirmación** (confirmar, cancelar, salir sin guardar, eliminar, restaurar) pasan de naranja a **rojo**; el ícono de los toasts de error/aviso, el contador «sin guardar» de cuotas y los íconos de edición del historial también dejan el naranja. El botón «Cancelar» y las confirmaciones neutrales no se tocan.
- Verificado en navegador real (Chromium 393×740, tema oscuro y claro): los tres carteles afectados no muestran ningún naranja; ícono y botón de acción en rojo. `npm test` 167/167 y `npm run check` OK. Generación del service worker subida a r30.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Cartel «Restaurar datos de demo» | 390 | oscuro | [paleta-cartel-restaurar-390-oscuro.png](capturas/2026-11-23/paleta-cartel-restaurar-390-oscuro.png) |
| Cartel «Eliminar este pedido» | 390 | oscuro | [paleta-cartel-eliminar-pedido-390-oscuro.png](capturas/2026-11-23/paleta-cartel-eliminar-pedido-390-oscuro.png) |
| Cartel «Salir sin guardar el pedido» | 390 | oscuro | [paleta-cartel-salir-sin-guardar-390-oscuro.png](capturas/2026-11-23/paleta-cartel-salir-sin-guardar-390-oscuro.png) |
| Cartel «Restaurar datos de demo», para comparar | 390 | claro | [paleta-cartel-restaurar-390-claro.png](capturas/2026-11-23/paleta-cartel-restaurar-390-claro.png) |

## Ropa v2 · «Quitar filtros» limpia también la búsqueda · 2026-11-23

- Hallazgo bajo de la revisión visual de Olga: con texto en el buscador del inventario, «Quitar filtros» restablecía categoría y orden pero dejaba la búsqueda puesta (pantalla en «Sin resultados» hasta borrar el campo a mano).
- Ahora el botón también limpia `vista.busqueda` y vacía el input `#search` (mismo patrón que «Limpiar búsqueda» de pedidos). El copy del vacío ya era coherente y no cambió.
- Verificado en navegador real sobre la app local (`?demo=1`): «zzz» + filtro Medias ⇒ «Quitar filtros» ⇒ 6 prendas en 3 cajones, buscador vacío, chip «Todas» activo, orden «Los últimos», 0 errores de consola. `npm test` 168/168 y `npm run check` OK. Generación del service worker a r31.

| Escena | Ancho | Tema | Archivo |
|---|---|---|---|
| Vacío «Sin resultados» con «zzz» y filtro Medias | 390 | oscuro | [dino-quitar-filtros-antes-390-oscuro.png](capturas/2026-11-23/dino-quitar-filtros-antes-390-oscuro.png) |
| Después de «Quitar filtros»: inventario completo y buscador vacío | 390 | oscuro | [dino-quitar-filtros-despues-390-oscuro.png](capturas/2026-11-23/dino-quitar-filtros-despues-390-oscuro.png) |

## Ropa v2 · revisión visual del inventario en vivo (Olga) · 2026-11-23

- Revisión visual del inventario con filtros, orden y vista lista (decisión 1) sobre el **vivo publicado** (`https://nicodelos24.github.io/Aplicacion-ropa/?demo=1`), a 320, 390, 420 y 1280 px en tema claro y oscuro: barra de filtros y chips con contador, selector de orden, grilla, lista compacta y vacío de búsqueda con «Quitar filtros».
- **0 hallazgos bloqueantes.** El único hallazgo, de severidad baja, fue que «Quitar filtros» no limpiaba el texto del buscador; ya está **corregido y publicado en r31** (sección inmediatamente anterior de este índice).
- Notas menores no bloqueantes: los nombres de sección largos se truncan con elipsis en pantallas angostas («Dama…» a 320 px) y la fila de chips se desliza en horizontal (`.chips` con `overflow-x:auto`), que es el comportamiento previsto del componente compartido.
- Las 14 capturas son de la demo (`?demo=1`) con datos de demostración («Vestido floral», «Pantalón negro», «Camisa blanca», «Abrigo largo», badge DEMO): **sin datos de clientas, sin teléfonos, sin correos y sin claves**. Estaban en local sin versionar; entran en este mismo cambio.
- **Aviso: en la mitad de los archivos la imagen no muestra la pantalla que sugiere su nombre** (comprobado releyendo cada PNG y midiendo los 14 tamaños). **Cuatro de las 14 son el cartel de confirmación «¿Eliminar la sección “Hombre - básicos”?»**: `inv-1280-claro-grilla` (1280×900), `inv-420-claro-grilla` (420×900), `inv-320-oscuro-secciones` y `inv-320-oscuro-pick-seccion` (320×780); estos dos últimos son los dos **casi idénticos entre sí**. **Tres dicen 390 px en el nombre pero miden 320×780**: `inv-390-claro-vacio-filtro`, `inv-390-oscuro-chip-activo` e `inv-390-oscuro-vacio-filtro`. La tabla de abajo consigna la escena y el ancho reales; los archivos no se renombran ni se borran porque son evidencia histórica.
- **Lo que estas 14 capturas no prueban** (queda sin evidencia y habría que volver a capturar si se necesita): la **grilla a 1280 px en claro**, las **secciones a 420 px** y la **hoja «Tus secciones» en reposo**. Del tema claro a 1280 px solo hay el cartel, no el inventario.

| Escena real (según la imagen) | Ancho real | Tema | Archivo |
|---|---|---|---|
| Cartel «¿Eliminar la sección “Hombre - básicos”?» — *el nombre dice grilla claro; la grilla 1280 en claro no está capturada* | 1280 | oscuro | [inv-1280-claro-grilla.png](capturas/2026-11-23/revision-olga/inv-1280-claro-grilla.png) |
| Grilla con chips de categoría y contador, filtro en «Vestido» (1 producto) | 320 | claro | [inv-320-claro-grilla.png](capturas/2026-11-23/revision-olga/inv-320-claro-grilla.png) |
| Vista lista compacta, 6 productos con foto mini, sección y precio | 320 | claro | [inv-320-claro-lista.png](capturas/2026-11-23/revision-olga/inv-320-claro-lista.png) |
| Grilla en oscuro, filtro en «Vestido» (1 producto) | 320 | oscuro | [inv-320-oscuro-grilla.png](capturas/2026-11-23/revision-olga/inv-320-oscuro-grilla.png) |
| Cartel «¿Eliminar la sección “Hombre - básicos”?» — *el nombre dice secciones* | 320 | oscuro | [inv-320-oscuro-secciones.png](capturas/2026-11-23/revision-olga/inv-320-oscuro-secciones.png) |
| El mismo cartel; **este y el anterior son casi idénticos entre sí** — *el nombre dice pick-seccion* | 320 | oscuro | [inv-320-oscuro-pick-seccion.png](capturas/2026-11-23/revision-olga/inv-320-oscuro-pick-seccion.png) |
| Vacío «Sin resultados» con «zzz» + filtro Vestido y «Quitar filtros» — *el nombre dice 390, mide 320* | 320 | claro | [inv-390-claro-vacio-filtro.png](capturas/2026-11-23/revision-olga/inv-390-claro-vacio-filtro.png) |
| Chip «Vestido» activo sobre la grilla, contador y resultado filtrado — *el nombre dice 390, mide 320* | 320 | oscuro | [inv-390-oscuro-chip-activo.png](capturas/2026-11-23/revision-olga/inv-390-oscuro-chip-activo.png) |
| Grilla por secciones (6 productos) con el control para pasar a lista | 390 | oscuro | [inv-390-oscuro-grilla.png](capturas/2026-11-23/revision-olga/inv-390-oscuro-grilla.png) |
| Vista lista con sección y precio por fila, control para volver a grilla | 390 | oscuro | [inv-390-oscuro-lista.png](capturas/2026-11-23/revision-olga/inv-390-oscuro-lista.png) |
| Vacío «Sin resultados» con «zzz» + filtro Vestido — *el nombre dice 390, mide 320* | 320 | oscuro | [inv-390-oscuro-vacio-filtro.png](capturas/2026-11-23/revision-olga/inv-390-oscuro-vacio-filtro.png) |
| Cartel «¿Eliminar la sección “Hombre - básicos”?» — *el nombre dice grilla claro; las secciones a 420 no están capturadas* | 420 | oscuro | [inv-420-claro-grilla.png](capturas/2026-11-23/revision-olga/inv-420-claro-grilla.png) |
| Vacío «Sin resultados» con «zzz» + filtro Vestido y «Quitar filtros» | 420 | claro | [inv-420-claro-vacio-filtro.png](capturas/2026-11-23/revision-olga/inv-420-claro-vacio-filtro.png) |
| El mismo vacío en oscuro | 420 | oscuro | [inv-420-oscuro-vacio-filtro.png](capturas/2026-11-23/revision-olga/inv-420-oscuro-vacio-filtro.png) |

## Ropa v2 · archivo de evidencia suelta del 21 y 22 de nov · Dino · 2026-11-23

- Estas **19 piezas** (18 PNG y 1 informe Markdown) estaban **solo en local, sin versionar**, y 17 de las 18 imágenes no tenían fila en este índice. Se archivan tal cual —sin renombrar ni borrar— y cada una entra con la escena que **realmente se ve** en la imagen, releída una por una. Sin cambios de código. Tarea `apx:tasks/task_0d4b25de94144b6f`.
- **Origen**: rondas de QA de Flor del 22-nov temprano (importe/cantidad del editor de pedido, nombre largo y datos raros, home a 320), la ronda «romper y pulir» (agenda con desborde, foto de detalle) y la batería de datos raros de Tito (contactos, inventario, ajustes). El informe es la revalidación UX34–36 de Flor del 21-nov.
- **Datos**: demo local (`?demo=1`), con los nombres de muestra del elenco demo (Rosita, Paco, Lucía, María Fernanda) y tres fichas armadas para probar datos raros: «La Jefa» (Zoé Éñiguez), una ficha con la etiqueta `O'Brien` y un producto «Abrigo `<img src=x onerror=alert(1)>` "Comillas" O'Brien». Un teléfono de 9 dígitos (`999 999 999`) y un nombre de 37 caracteres son entradas de prueba. **Sin datos de clientas reales, sin correos y sin claves.**

### Advertencias de archivo (leer antes de usar una imagen por su nombre)

- `flor-importe-editor-despues.png` **no es el «después» del mismo editor que el «antes»**: el «antes» es el editor de **Rosita** (Vestido floral + Camisa blanca, sin producto elegido) y el «después» es el **detalle del pedido de Lucía** con Pantalón negro $1,400. El par que documenta el arreglo del importe es `flor-importe-editor-rosita-editor-qty2.png` / `flor-importe-editor-rosita-guardado-500.png`, y la sección «editor de pedido conserva la cantidad» de este índice ya lo dice: este par anterior «mostraba Lucía/$1,400 y era engañoso». Se archiva como evidencia histórica, **no** como prueba del arreglo.
- **`romper-foto-detalle-claro-320.png` y `romper-foto-detalle-oscuro-320.png` son la misma imagen**: md5 distinto, pero la diferencia después de quitar metadatos es de 0.09 píxeles, un artefacto de codificación. **Ninguna de las dos está en tema claro**: son la foto ampliada sobre fondo casi negro, el mismo visor en los dos archivos. El **visor en tema claro no está capturado**.
- `qa-inventario-nombre-largo-320.png` mide **305×1086**, no 320 de ancho: el recorte quedó sobre el ancho útil del contenido, no sobre el viewport.
- `qa-editor-pedido-cantidad-perdida-tras-guardar.png` **no es una captura de pantalla: es una vista de página completa de 305×1377** con las cinco tarjetas de Pedidos apiladas y la barra repetida en medio; sirve por el texto de los totales, no como evidencia de un estado concreto.
- `tito-ajustes-1280-prefijo-invalido.png`: en el campo del prefijo quedó escrito el texto literal `+<b>598</b>57`, **markup pegado en un campo de teléfono**. `tito-ajustes-1280-prefijo-raro.png` (1265×996) muestra el **mismo ajuste en reposo con `+598`** limpio: el archivo dice «raro», pero lo raro está en el otro. Los dos miden distinto porque uno es ventana (900) y el otro página completa.
- La app tiene ese campo validado (`/^\+\d{1,4}$/`, aviso «Prefijo inválido: debe empezar con + (ej. +598)»), así que el texto pegado **no se guarda**. Estas capturas no prueban un fallo de guardado: prueban que el campo acepta y muestra cualquier texto mientras no se guarde.
- `tito-ajustes-1280-prefijo-invalido.png`, `tito-ajustes-1280-prefijo-raro.png` y `tito-inventario-1280-raro.png` miden 1265/1280 px pero muestran la app en **columna angosta centrada**, la disposición **anterior** al aprovechamiento del ancho de escritorio: no son el estado actual.

### Las 18 capturas

| Escena real (según la imagen) | Ancho | Tema | Archivo |
|---|---|---|---|
| Editor de pedido de **Rosita** (099111222) con la grilla «Del inventario»: Vestido floral $1,200 y Camisa blanca $950; **sin ningún producto elegido y sin total a la vista** | 320 | oscuro | [flor-importe-editor-antes.png](capturas/2026-11-22/flor-importe-editor-antes.png) |
| **Detalle del pedido de Lucía**: Pantalón negro, $1,400, TOTAL $1,400, sello «Mensaje enviado», fecha 29 nov y la ayuda «Tocá una tarjeta para traerla al frente · otro toque amplía su foto» — *el nombre dice «después» del editor de Rosita; no es la misma pantalla* | 320 | oscuro | [flor-importe-editor-despues.png](capturas/2026-11-22/flor-importe-editor-despues.png) |
| Hoja «Nuevo cliente» con un **nombre de prueba de 37 caracteres** («María José del Valle González Pérez…»), WhatsApp con **9 dígitos raros** (999 999 999), notas vacías, Guardar y Cancelar, sin desborde horizontal | 320 | oscuro | [qa-contacto-nombre-largo-tel-raro-320.png](capturas/2026-11-22/qa-contacto-nombre-largo-tel-raro-320.png) |
| Editor de pedido de **Paco** (098765432) con la grilla de productos: Vestido floral $1,200, Camisa blanca $950, Pantalón negro y Abrigo largo — **es la captura del hallazgo del editor**: el pedido de Paco tenía que mostrar Camisa blanca + Corbata, no esta lista genérica | 320 | oscuro | [qa-editor-paco-productos-incorrectos.png](capturas/2026-11-22/qa-editor-paco-productos-incorrectos.png) |
| Pedidos completo (página entera, 5 tarjetas apiladas): María Fernanda $3,200 Pagado (2026-11-23), Lucía $1,400, totales $3,450 Cobrado / $3,850 Por cobrar / 5 Pedidos, chips Todos (5) y Pagado (2), Rosita $1,200 Nuevo (2026-11-24) y Rosita $250 Medias lanas; el nombre describe el hallazgo de la cantidad perdida al guardar | 305 (pág. completa) | oscuro | [qa-editor-pedido-cantidad-perdida-tras-guardar.png](capturas/2026-11-22/qa-editor-pedido-cantidad-perdida-tras-guardar.png) |
| Editor de pedido con **TOTAL $250** frente a los dos productos de la grilla ($1,400 y $3,200) y a la Camisola Angélica de nombre larguísimo con **precio de prueba `1234567890` / `$1,234.56`**; estado «Nuevo» y «Mensaje enviado», En cuotas, fecha y notas vacías | 320 | oscuro | [qa-editor-pedido-total-250-vs-500.png](capturas/2026-11-22/qa-editor-pedido-total-250-vs-500.png) |
| **Inicio** con «Por cobrar $3,850», «3 pedidos por cerrar · 1 en cuota», $3,700 Cobrado / 1 En cuota, los accesos Agenda/Productos/Clientes y «Próximos en agenda» con María Fernanda; cabecera «Domingo, 22 de noviembre · Hola, Dueña» | 320 | oscuro | [qa-home-320.png](capturas/2026-11-22/qa-home-320.png) |
| Inventario en **grilla a 320**: los 6 productos (Vestido floral $1,200, Camisa blanca $950, Pantalón negro $1,400, Abrigo largo $3,200, Medias lanas $250, Camisola Angélica con nombre larguísimo y precio `1234567890` / `$1,234.56`), badge DEMO en cada tarjeta; el nombre largo no desborda — *mide 305×1086, es recorte del contenido* | 305 | oscuro | [qa-inventario-nombre-largo-320.png](capturas/2026-11-22/qa-inventario-nombre-largo-320.png) |
| El mismo inventario en **grilla de escritorio** (6 productos en 3 columnas): el nombre largo y el precio de prueba se envuelven sin romper la tarjeta | 1280 | oscuro | [qa-inventario-nombre-largo-desktop.png](capturas/2026-11-22/qa-inventario-nombre-largo-desktop.png) |
| **Agenda → Calendario, noviembre 2026**, con la grilla de días desbordando el ancho (la última columna de días queda cortada en el borde) — el hallazgo del overflow a 320 | 320 | **claro** | [romper-agenda-calendario-overflow-320.png](capturas/2026-11-22/romper-agenda-calendario-overflow-320.png) |
| **Foto ampliada** de la demo (visor con «Foto de prueba · Demo» y la X de cierre) sobre fondo casi negro — *el nombre dice «claro», pero el visor es oscuro* | 320 | oscuro | [romper-foto-detalle-claro-320.png](capturas/2026-11-22/romper-foto-detalle-claro-320.png) |
| **La misma imagen**: misma foto ampliada y mismo fondo oscuro; **no es el visor en tema claro** (la diferencia con la anterior es de 0.09 px, artefacto de codificación) | 320 | oscuro | [romper-foto-detalle-oscuro-320.png](capturas/2026-11-22/romper-foto-detalle-oscuro-320.png) |
| **Ajustes → Prefijo de país** con el texto `+<b>598</b>57` pegado en el campo del prefijo (markup en un campo de teléfono) y «Guardar prefijo» a la vista | 1280 | oscuro | [tito-ajustes-1280-prefijo-invalido.png](capturas/2026-11-22/tito-ajustes-1280-prefijo-invalido.png) |
| **El mismo ajuste en reposo**: el campo muestra `+598` limpio, sin el valor raro — *el nombre dice «raro», pero lo raro está en el archivo anterior* | 1265 (pág. completa) | oscuro | [tito-ajustes-1280-prefijo-raro.png](capturas/2026-11-22/tito-ajustes-1280-prefijo-raro.png) |
| **Contactos desplazado hasta abajo**: María Fernanda (Al día, sin teléfono), la ficha con etiqueta `O'Brien` y teléfono 099 111 000 con «Sin pedidos» y la nota «Cliente de prueba con ace…»; el encabezado «Tus contactos · 5 Clientes» queda congelado arriba | 320 | oscuro | [tito-contactos-320-raro-scroll.png](capturas/2026-11-22/tito-contactos-320-raro-scroll.png) |
| **Contactos desde arriba** con las 5 fichas demo y las raras: Rosita (1 pendiente · 1 pedido hecho), Paco, Lucía, María Fernanda, la ficha «La Jefa» (Zoé Éñiguez) y la de `O'Brien` con «Sin pedidos» | 305 (pág. completa) | oscuro | [tito-contactos-320-raro.png](capturas/2026-11-22/tito-contactos-320-raro.png) |
| **El mismo caso a 390**: las cinco fichas, las etiquetas raras (`La Jefa`, `O'Brien`) y el botón flotante «+» de alta | 390 | oscuro | [tito-contactos-390-raro.png](capturas/2026-11-22/tito-contactos-390-raro.png) |
| **Inventario a 1280 con un producto raro**: además de los 6 demo, una tarjeta llamada «Abrigo `<img src=x onerror=alert(1)>` "Comillas" O'Brien» a $12.50 — entrada de prueba de datos sucios, mostrada como **texto** (no ejecuta nada) | 1265 (pág. completa) | oscuro | [tito-inventario-1280-raro.png](capturas/2026-11-22/tito-inventario-1280-raro.png) |

### El informe archivado

- [QA-Flor-revalidacion-UX34-36.md](capturas/2026-11-21/QA-Flor-revalidacion-UX34-36.md) — informe de **Flor**, 21-nov-2026, con la revalidación de los hallazgos UX34–36 sobre el SHA publicado `0ebd670` (caché `ropa-v2-nav-fotos-r7`): matriz funcional de UX36-01/02/03/04/05 y UX35-05, los tres residuos de copy de UX34 (13, 14 y 10) y veredicto **APPROVED**, `npm test` 69/69. Es la entrada que dio origen a la corrección `503a7ab` (rama `fix/ux34-residuos`, ya publicada) y se archiva **sin editar**, tal como lo escribió Flor.
- **Nota de archivo**: el informe lleva la fecha del 21-nov en su nombre y en su carpeta, pero el archivo se creó en local el 22-nov a las 18:38, junto con las capturas de la misma ronda. Se conserva la fecha del nombre porque el contenido corresponde a esa pasada.

### Estado

- **Lo que estas 19 piezas prueban**: los estados de la demo que dicen las escenas de arriba, en la versión del 22-nov anterior al aprovechamiento del ancho de escritorio. Sirven como evidencia histórica de las rondas de QA y de los hallazgos ya cerrados y publicados (importe y cantidad del editor, productos de Paco, overflow de la agenda, residuos UX34).
- **Lo que no prueban**: el tema claro del visor de fotos, el «después» del editor de Rosita ni el estado actual de escritorio (los 1265/1280 px son de la disposición en columna angosta). Si hace falta eso, hay que volver a capturar.

## Ropa v2 · QA en pantalla de los arreglos 4–8 · Flor · 2026-11-23

Sobre el **sitio vivo publicado** https://nicodelos24.github.io/Aplicacion-ropa/?demo=1 (sha `becdc1c`, `sw.js VERSION = "r33"`), con el Chrome del proyecto a 390×844, tema oscuro y datos de demostración (`?demo=1`; sin clientas reales). Consola: 0 errores (solo el aviso de deprecación de `apple-mobile-web-app-capable`). `npm test` 195/195 y `npm run check` OK (66 archivos). Veredicto: **APPROVED**.

| Escena verificada | Ancho | Tema | Archivo |
|---|---|---|---|
| Aviso ámbar «Se guardó sin las fotos» al guardar una prenda con foto y la cuota llena; franja en flujo, no tapa el contenido | 390 | oscuro | [qa-flor-r33-aviso-ambar-sin-fotos-390-oscuro.png](capturas/2026-11-23/qa-flor-r33-aviso-ambar-sin-fotos-390-oscuro.png) |
| Aviso rojo «No se guardó» cuando el localStorage rechaza la escritura; arriba del contenido | 390 | oscuro | [qa-flor-r33-aviso-rojo-no-guardo-390-oscuro.png](capturas/2026-11-23/qa-flor-r33-aviso-rojo-no-guardo-390-oscuro.png) |
| Inicio: contadores animados `$3,850` por cobrar y `$3,700` cobrado, iguales a las tarjetas de Pedidos | 390 | oscuro | [qa-flor-r33-moneda-inicio-390-oscuro.png](capturas/2026-11-23/qa-flor-r33-moneda-inicio-390-oscuro.png) |
| Pedidos: chips Todos / Pagado / Mensaje enviado / En cuotas / Nuevo con sus tonos y conteos | 390 | oscuro | [qa-flor-r33-pedidos-filtros-tonos-390-oscuro.png](capturas/2026-11-23/qa-flor-r33-pedidos-filtros-tonos-390-oscuro.png) |
| Editor de prenda: botón «Galería» (`capture=environment` en «Tomar foto») actualiza la vista previa al elegir archivo | 390 | oscuro | [qa-flor-r33-producto-galeria-390-oscuro.png](capturas/2026-11-23/qa-flor-r33-producto-galeria-390-oscuro.png) |
| Editor de pedido «Escribir a mano»: «Agregar foto al producto» acepta el archivo y muestra «Foto lista: se guarda al confirmar» | 390 | oscuro | [qa-flor-r33-pedido-foto-manual-390-oscuro.png](capturas/2026-11-23/qa-flor-r33-pedido-foto-manual-390-oscuro.png) |
| Detalle del pedido: «Editar este artículo» (barra o visor de la foto) abre la hoja con tipo, nombre, precio y el subtotal al día mientras se escribe; guardar vuelve al pedido ya actualizado | 390 | oscuro | [dino-editar-articulo-hoja.png](capturas/2026-11-23/dino-editar-articulo-hoja.png) |

### Detalle de lo probado

- **Hallazgo 4 (aviso de guardado)**: sin espacio para la foto, el aviso ámbar dice «Se guardó sin las fotos / El cambio quedó guardado, pero no entraron las fotos porque el dispositivo está sin espacio. Los datos y los precios están a salvo.» (tono `aviso`); con el localStorage rechazando la escritura, el rojo dice «No se guardó / El dispositivo rechazó el cambio y no se guardó nada…» (tono `error`). En ambos, el nodo está **en flujo** (`main.y ≥ aviso.y + alto`), no tapa contenido y se cierra con la X. Tras recargar, `hidden=true` y sin título: **no reaparece**. Un guardado normal no muestra franja (`hidden=true`). Para forzar los estados se llenó `localStorage` con claves temporales `qa_*`, borradas al final; las dos prendas creadas quedaron solo en la sesión del navegador y **no** se subieron al repo.
- **Hallazgo 5 (moneda)**: `fmt()` se usa tanto en las tarjetas como en `animarContadores`; montos finales `$3,850`/`$3,700` idénticos en Inicio y Pedidos, `data-final` coincide con el texto del contador. Las tarjetas de Pedidos muestran `$3,200`, `$1,400`, `$1,250`, `$1,200` y `$500` con el mismo formato.
- **Hallazgos 6 y 7 (barrel + filtros)**: los cinco chips están presentes con conteos (Todos 5, Pagado 2, Mensaje enviado 1, En cuotas 1, Nuevo 1). Tonos calculados: Pagado verde `rgb(132,237,176)`, Mensaje enviado naranja `rgb(255,192,137)`, En cuotas azul `rgb(180,195,255)`, Nuevo gris `rgb(198,202,217)`. Filtrar por «En cuotas» dejó solo Lucía; por «Nuevo», solo Rosita; «Todos» restaura las 5 tarjetas; la búsqueda «Lucía» filtra correctamente sobre el barrel. Sin regresiones visibles.
- **Hallazgo 8 (foto)**: en el editor de prenda, «Tomar foto» (`capture="environment"`) y «Galería» (ambos `input[type=file]`, `accept=image/*`) reciben el archivo y cambian la vista previa a un `data:image` (verificado longitud ~51.635 caracteres). En el editor de pedido, «Escribir a mano» → «Agregar foto al producto» (`pedido-photo`) acepta el archivo y la hoja confirma «Foto lista: se guarda al confirmar» antes de Guardar.
- **No incluido**: el disparo real de la cámara del dispositivo (en Chrome de escritorio se simuló con `setInputFiles` en el input `capture`). No se probaron otros anchos ni el tema claro en esta ronda; las capturas anteriores de Olga cubren esos casos sobre versiones previas.

## Ropa v2 · textos de pagos y vacío de búsqueda en el vivo · Dino · 2026-11-23

Sobre el **sitio vivo publicado** https://nicodelos24.github.io/Aplicacion-ropa/?demo=1 (master `390b834`, `sw.js VERSION = "r33"`), con el Chrome del proyecto a 659×631 y datos de demostración (`?demo=1`; sin clientas reales). Son los tres textos de `fix/ux34-residuos`, integrados en `87fe28f` y ya visibles en el vivo. Consola: 0 errores (solo el aviso de deprecación de `apple-mobile-web-app-capable`). `npm test` 167/167 y `npm run check` OK sobre el merge con r29.

| Escena verificada | Ancho | Tema | Archivo |
|---|---|---|---|
| Pedidos: buscar `zzz` deja el vacío «Sin resultados» con el botón «Limpiar búsqueda»; al tocarlo el buscador queda vacío y vuelven los 5 pedidos | 659 | claro | [ux34-vivo-limpiar-busqueda.png](capturas/2026-11-23/ux34-vivo-limpiar-busqueda.png) |
| Ficha de Rosita: secciones «Pendientes de pago (1)» y «Pagados (1)», sin «Pendientes»/«Hechos» | 659 | claro | [ux34-vivo-cliente-pagados.png](capturas/2026-11-23/ux34-vivo-cliente-pagados.png) |
| Detalle del pedido de Paco con la confirmación al pasar a Pagado: CTA «Marcar como pagado» (neutral) y Cancelar | 659 | claro | [ux34-vivo-marcar-como-pagado.png](capturas/2026-11-23/ux34-vivo-marcar-como-pagado.png) |

### Detalle de lo probado

- **UX34-13**: `#hoja-in .sect-titulo` devuelve exactamente `Pendientes de pago (1)` y `Pagados (1)`; no queda ningún título con el copy viejo.
- **UX34-14**: desde el pedido de Paco (`msg`) el destino `paid` abre la confirmación con CTA `Marcar como pagado` y clase `cbtn-yes neutral`; un destino que no es Pagado sigue mostrando `Cambiar estado`; Cancelar cierra el diálogo y el pedido conserva su estado. En el pedido ya pagado (`d5`) la fila Pagado viene marcada y el clic no hace nada.
- **UX34-10**: con `#search` en `zzz` el vacío muestra el botón `[data-acc="limpiar"]` «Limpiar búsqueda»; al tocarlo, `#search.value` queda vacío, el vacío desaparece y vuelven las 5 tarjetas.
- **No incluido**: prueba táctil real en móvil y tema oscuro; las capturas son de la ventana del Chrome del proyecto.

## Revisión Olga — «Editar este artículo» (23-nov-2026, vivo origin/master `7450880`/r34)
Aprobado. Capturas en `capturas/2026-11-23/`: [visor con «Editar este artículo»](capturas/2026-11-23/olga-lightbox-editar-390-oscuro.png) · [hoja de edición, arriba](capturas/2026-11-23/olga-hoja-editar-articulo-390-oscuro.png) · [hoja, abajo con Guardar/Cancelar](capturas/2026-11-23/olga-hoja-editar-articulo-390-oscuro-bottom.png) · [toast «Artículo actualizado · $980»](capturas/2026-11-23/olga-toast-articulo-actualizado-390-oscuro.png).
- Flujo completo a 390×844, tema oscuro: tarjeta con foto → 2do toque amplía → «Editar este artículo» → hoja con tipo de prenda, nombre, precio, «Cantidad 1 · no se toca desde acá» (subtotal vivo), Tomar foto/Galería/Quitar, Guardar/Cancelar. 0 errores de consola en todo el flujo.
- Editar precio no toca la cantidad; el subtotal del pedido se actualiza exactamente por la diferencia ($1,250→$1,280 al subir $950→$980). El cambio se propaga a la tarjeta del detalle, a la agenda y al total.
- Persistencia real verificada recargando **sin** `?demo=1` (con el flag, `boot()` siempre re-siembra `datosDemo()` y pisa el localStorage — comportamiento esperado del modo demo, no un bug): el nombre y precio editados sobrevivieron al reload.
- Foco: dentro del visor, Tab cicla entre «Editar este artículo» y «Cerrar imagen ampliada» (trap correcto, sin fuga). Cerrando el visor con su botón X el foco vuelve a la tarjeta del artículo en el detalle, como se pidió. (Nota aparte, no pedida: Escape cierra el visor y el detalle en cascada hasta Inicio, no solo el visor — mencionar si en algún momento se quiere Escape de a un nivel por vez.)
- Alturas táctiles, contraste y ausencia de desborde horizontal: OK a simple vista en oscuro a 390 px.

## Ropa v2 · bloque de usabilidad (Nico 23-nov-2026 vía Nova) · Amber · r35

Capturas del worktree `fix/usabilidad-secciones-fotos-ruido`, servidor local con `?demo=1` (sin datos de clientas), Playwright 320/390 px × claro/oscuro, 0 errores de página. `npm test` 211/211, `npm run check` OK.

| Escena | Ancho / tema | Archivo |
|---|---|---|
| Inventario: secciones sin flechas, rótulo «Ocultar» y botón «Organizar» | 320 claro | [inventario-320-light.png](capturas/2026-11-23/usabilidad-r35/inventario-320-light.png) |
| Inventario | 390 oscuro | [inventario-390-dark.png](capturas/2026-11-23/usabilidad-r35/inventario-390-dark.png) |
| Hoja «Organizar»: foto de cada prenda junto a nombre y precio | 390 claro | [organizar-390-light.png](capturas/2026-11-23/usabilidad-r35/organizar-390-light.png) |
| Hoja «Organizar» | 320 oscuro | [organizar-320-dark.png](capturas/2026-11-23/usabilidad-r35/organizar-320-dark.png) |
| Detalle del pedido: lápiz compacto «Editar» + burbuja «?», sin botón gigante | 390 oscuro | [pedido-390-dark.png](capturas/2026-11-23/usabilidad-r35/pedido-390-dark.png) |

Serie completa (12 capturas: inventario/organizar/pedido × 320/390 × claro/oscuro) en `capturas/2026-11-23/usabilidad-r35/`.

## QA Flor — «Nuevo producto» desde el detalle del pedido (23/24-nov-2026, feat/pedido-alta-producto b62f84d + merge master) · Aprobado

Informe completo en **[QA-Flor-Nuevo-Producto-23nov.md](QA-Flor-Nuevo-Producto-23nov.md)** (0 hallazgos). Capturas de Flor en `capturas/2026-11-24/`:

| Escena | Archivo |
|---|---|
| Hoja «Nuevo producto» vacía, 390 oscuro | [nuevo-producto-01-hoja-vacia-390-oscuro.png](capturas/2026-11-24/nuevo-producto-01-hoja-vacia-390-oscuro.png) |
| Hoja llena sin foto, 390 oscuro | [nuevo-producto-02-hoja-llena-sin-foto-390-oscuro.png](capturas/2026-11-24/nuevo-producto-02-hoja-llena-sin-foto-390-oscuro.png) |
| Detalle con artículo nuevo sin foto (avatar por categoría), 390 oscuro | [nuevo-producto-03-detalle-sin-foto-avatar-390-oscuro.png](capturas/2026-11-24/nuevo-producto-03-detalle-sin-foto-avatar-390-oscuro.png) |
| Hoja con foto elegida, 390 oscuro | [nuevo-producto-04-hoja-con-foto-390-oscuro.png](capturas/2026-11-24/nuevo-producto-04-hoja-con-foto-390-oscuro.png) |
| Detalle con artículo con foto, 390 oscuro | [nuevo-producto-05-detalle-con-foto-390-oscuro.png](capturas/2026-11-24/nuevo-producto-05-detalle-con-foto-390-oscuro.png) |
| Hoja a 320, oscuro | [nuevo-producto-06-hoja-320-oscuro.png](capturas/2026-11-24/nuevo-producto-06-hoja-320-oscuro.png) |
| Detalle a 320, oscuro | [nuevo-producto-07-detalle-320-oscuro.png](capturas/2026-11-24/nuevo-producto-07-detalle-320-oscuro.png) |
| Detalle 390 claro (modo real, foto en producto e ítem) | [nuevo-producto-08-detalle-claro-390-real.png](capturas/2026-11-24/nuevo-producto-08-detalle-claro-390-real.png) |
| Hoja vacía 390 claro (real) | [nuevo-producto-09-hoja-vacia-claro-390-real.png](capturas/2026-11-24/nuevo-producto-09-hoja-vacia-claro-390-real.png) |

Verificación post-merge (Dino, 24-nov): lápiz compacto de la usabilidad r35 y «Nuevo producto» conviven en `.dcards-pie`, alta en vivo OK a 390 oscuro: [verif-merge-pedido-390-oscuro.png](capturas/2026-11-24/verificacion-merge/verif-merge-pedido-390-oscuro.png). Publicado en master (`cd3ac5d`) y verificado en el vivo (`?demo=1`, r35 con ambas cosas juntas, alta completa con «Chal en vivo» $600 → total $1,850): [verif-vivo-pedido-390-oscuro.png](capturas/2026-11-24/verificacion-merge/verif-vivo-pedido-390-oscuro.png). Nota: visitantes con la pestaña vieja abierta siguen viendo la generación r35 cacheada hasta recargar con el SW actualizado (cache-first por diseño).

## Olga — entrada por URL con sección y navegación (24-nov-2026, vivo r38 / master `1cc1762`) · APROBADO

[Tarea `task_c5b84c5172fa4017`](apx:tasks/task_c5b84c5172fa4017). Verificación en el vivo con `?demo=1`, sin datos de clientas reales. Apertura directa de `#inventario`, `#pedidos`, `#contactos` y `#agenda`: cada una abrió su pantalla. `#inventarioo` abrió Inicio sin error visible. Barra → Inventario → Agenda y atrás → Inventario: correctos. Recarga manteniendo `#inventario`: correcta a 320×720, claro y oscuro. 390×844 claro/oscuro: sin desbordes ni anomalías visuales. Consola: **0 errores** en toda la sesión (1 warning habitual de arranque).

Chrome del proyecto `kaia_chrome_ropaapp`: tomado 04:33 y soltado 04:41 (hora UTC del servidor), sin uso simultáneo. La primera toma quedó bloqueada por la caída previa del Chrome; tras reiniciarse APX el server reconectó y la revisión se completó.

| Escena | Viewport / tema | Captura |
|---|---|---|
| `#inventario` abre Inventario | 390×844 · claro | [olga-hash-390-inventario-claro.png](capturas/2026-11-24/olga-hash-390-inventario-claro.png) |
| `#pedidos` abre Pedidos | 390×844 · claro | [olga-hash-390-pedidos-claro.png](capturas/2026-11-24/olga-hash-390-pedidos-claro.png) |
| `#contactos` abre Contactos | 390×844 · claro | [olga-hash-390-contactos-claro.png](capturas/2026-11-24/olga-hash-390-contactos-claro.png) |
| `#agenda` abre Agenda | 390×844 · claro | [olga-hash-390-agenda-claro.png](capturas/2026-11-24/olga-hash-390-agenda-claro.png) |
| `#pedidos` en oscuro | 390×844 · oscuro | [olga-hash-390-pedidos-oscuro.png](capturas/2026-11-24/olga-hash-390-pedidos-oscuro.png) |
| `#contactos` en oscuro | 390×844 · oscuro | [olga-hash-390-contactos-oscuro.png](capturas/2026-11-24/olga-hash-390-contactos-oscuro.png) |
| `#agenda` en oscuro | 390×844 · oscuro | [olga-hash-390-agenda-oscuro.png](capturas/2026-11-24/olga-hash-390-agenda-oscuro.png) |
| `#inventarioo` cae en Inicio | 390×844 · claro | [olga-hash-390-inexistente-inicio-claro.png](capturas/2026-11-24/olga-hash-390-inexistente-inicio-claro.png) |
| `#inventarioo` cae en Inicio | 390×844 · oscuro | [olga-hash-390-inexistente-inicio-oscuro.png](capturas/2026-11-24/olga-hash-390-inexistente-inicio-oscuro.png) |
| Recarga con `#inventario` mantiene Inventario | 320×720 · claro | [olga-hash-320-inventario-recarga-claro.png](capturas/2026-11-24/olga-hash-320-inventario-recarga-claro.png) |
| Recarga con `#inventario` mantiene Inventario | 320×720 · oscuro | [olga-hash-320-inventario-recarga-oscuro.png](capturas/2026-11-24/olga-hash-320-inventario-recarga-oscuro.png) |

## Dino — buscador de Inventario sin tildes (24-nov-2026, `fix/buscador-sin-tildes`) · Verificado

[Tarea `task_2dba147f8c3244f7`](apx:tasks/task_2dba147f8c3244f7). Verificación local con `?demo=1` en Inventario, sin datos reales. `pantalon` y `PANTALÓN` muestran únicamente el producto `di3` (Pantalón); `zzz` deja 0 tarjetas y muestra «Sin resultados». Resumen coherente con las prendas visibles. Consola: 0 errores. Suite completa 228/228 y `npm run check` OK (72 archivos).

Chrome del proyecto `kaia_chrome_ropaapp`: turno coordinado con Amber, tomado 09:06 y liberado 09:07 UTC. Contexto aislado y pestaña cerrados al terminar; servidor local detenido.

| Escena | Captura |
|---|---|
| Búsqueda `PANTALÓN`: una coincidencia | [dino-buscador-con-tilde.png](capturas/2026-11-24/dino-buscador-con-tilde.png) |
| Búsqueda `zzz`: sin coincidencias | [dino-buscador-sin-tildes.png](capturas/2026-11-24/dino-buscador-sin-tildes.png) |

## Flor — «romper y pulir»: persistencia, sin red, respaldo y barrido 390 (24-nov-2026, vivo r41) · NEEDS WORK

Tarea `task_f6b782df70874b1e`. Demo pública `?demo=1` (datos ficticios) en el Chrome del proyecto, contexto aislado, 390×844 (viewport CSS 375×844), claro/oscuro. `npm test` 231/231 y `npm run check` OK (72 archivos); 0 errores de consola. Chrome tomado 11:06 UTC y soltado 11:15 UTC; sin pestañas ajenas ni publicación.

- **Hallazgo 1 (bloquea la prueba de persistencia en demo):** cargar `?demo=1`, cambiar tema o agregar producto, recargar → vuelve todo al estado sembrado (tema `dark`, 5 pedidos / 6 productos / 4 clientas). `localStorage` sí guardó el cambio antes de recargar; `boot(datosDemo())` lo pisa. Propuesta: [task_b87662b6d7ba4f1c](apx:tasks/task_b87662b6d7ba4f1c). Persistencia real sin el flag NO verificada en esta ronda.
- **Sin red:** con SW r41 activo y `navigator.onLine=false`, recargar `#inicio` abre la app completa (no pantalla en blanco); reconectar y recargar también abre bien. Los cambios previos no sobreviven por el hallazgo 1, no por el SW. Captura: [sin red, recarga 390 claro](capturas/2026-11-24/flor-romper-pulir/sin-red-recarga-390-claro.png).
- **Respaldo:** botón «Descargar respaldo» en Ajustes descargó `respaldo-ropa-2026-11-24.json` (5,382 bytes), JSON válido con `orders/inventory/secciones/clients/events/log/users/usuarioId/prefijo/theme/demo`, 5/6/4/2/5 elementos respectivamente. Sin restaurar ni abrir archivos del sistema.
- **Barrido visual 390:** Inicio, Pedidos, Ajustes e Historial, claro y oscuro, sin desbordes de página (`scrollWidth == clientWidth == 375`), botones de nav visibles y textos legibles. Los chips de filtros de Pedidos desbordan su contenedor `.chips` pero el contenedor es horizontal-scroll y el ancho se recupera deslizando; no bloquea. El contador «Por cobrar» se capturó a mitad de animación ($3,560.83 en claro, $3,563.58 en oscuro, siendo el final $3,850); propuesta menor: [task_9a67fb4ef4524cf7](apx:tasks/task_9a67fb4ef4524cf7).

| Escena | Viewport / tema | Captura |
|---|---|---|
| Recarga sin red, app abierta | 390×844 · oscuro (flag demo) | [sin-red-recarga-390-claro.png](capturas/2026-11-24/flor-romper-pulir/sin-red-recarga-390-claro.png) |
| Inicio con el contador a mitad de animación | 390×844 · claro | [moneycard-light-390.png](capturas/2026-11-24/flor-romper-pulir/moneycard-light-390.png) |
| Inicio con el contador a mitad de animación | 390×844 · oscuro | [moneycard-dark-390.png](capturas/2026-11-24/flor-romper-pulir/moneycard-dark-390.png) |
| Inicio estabilizado | 390×844 · claro | [inicio-390-light.png](capturas/2026-11-24/flor-romper-pulir/inicio-390-light.png) |
| Inicio estabilizado | 390×844 · oscuro | [inicio-390-dark.png](capturas/2026-11-24/flor-romper-pulir/inicio-390-dark.png) |
| Pedidos (filtros con scroll horizontal) | 390×844 · claro | [pedidos-390-light.png](capturas/2026-11-24/flor-romper-pulir/pedidos-390-light.png) |
| Pedidos (filtros con scroll horizontal) | 390×844 · oscuro | [pedidos-390-dark.png](capturas/2026-11-24/flor-romper-pulir/pedidos-390-dark.png) |
| Filtros deslizados al final | 390×844 · claro | [filtros-light-390.png](capturas/2026-11-24/flor-romper-pulir/filtros-light-390.png) |
| Filtros deslizados al final | 390×844 · oscuro | [filtros-dark-390.png](capturas/2026-11-24/flor-romper-pulir/filtros-dark-390.png) |
| Ajustes con «Descargar respaldo» | 390×844 · claro | [ajustes-390-light.png](capturas/2026-11-24/flor-romper-pulir/ajustes-390-light.png) |
| Ajustes con «Descargar respaldo» | 390×844 · oscuro | [ajustes-390-dark.png](capturas/2026-11-24/flor-romper-pulir/ajustes-390-dark.png) |
| Historial | 390×844 · claro | [historial-390-light.png](capturas/2026-11-24/flor-romper-pulir/historial-390-light.png) |
| Historial | 390×844 · oscuro | [historial-390-dark.png](capturas/2026-11-24/flor-romper-pulir/historial-390-dark.png) |

## Dino — integración foco/zoom/abanico cuadrado (24-nov-2026, vivo r41 / master `027e9ce`) · Verificado

Sin datos de clientas reales: demo `?demo=1`, pedido de Paco. Correcciones integradas: el foco queda dentro de la hoja del detalle (Tab y Shift+Tab, fondo `inert`, retorno al control que abrió), el viewport permite zoom (sin `user-scalable=no`, `main.css?v=10`, meta `mobile-web-app-capable`) y las tarjetas cuadradas del abanico se seleccionan a 320 con 3 artículos. Se subió la generación del SW de r39 a r41: con r40 el vivo seguía sirviendo módulos viejos por la caché; r41fuerza la regeneración. Verificado en el vivo a 320 y 390: 17 Tabs seguidos dentro de la hoja, fondo con `inert=true`, `overflow=hidden`, clic en ambas tarjetas laterales cambia la selección, 0 errores de consola. Hubo 503 transitorios de GitHub Pages al recargar (`manifest.json`/`orden.js`) que no se reprodujeron en reintentos. Suite 231/231 y `npm run check` OK (72 archivos). Chrome del proyecto: tomado a las 09:37 y liberado a las 10:12 UTC.

| Escena | Captura |
|---|---|
| Detalle con abanico cuadrado, local 320 oscuro | [dino-abanico-320-oscuro.png](capturas/2026-11-24/verificacion-integracion/dino-abanico-320-oscuro.png) |
| Detalle en vivo r41, 320 claro | [vivo-r41-320-claro-detalle.png](capturas/2026-11-24/verificacion-integracion/vivo-r41-320-claro-detalle.png) |

## Tito — «romper y pulir» seguridad: XSS, WhatsApp y localStorage (24-nov-2026, vivo r42) · NEEDS WORK

Tarea `task_003a495f248e4a76`. Demo pública `?demo=1`, contexto/pestaña aislada del Chrome del proyecto, datos ficticios. 390×844 (viewport CSS 375×844), claro/oscuro. Sin publicar ni tocar datos reales. Chrome tomado y soltado en esta ronda; evidencias en `capturas/2026-11-24/seguridad-r42/`.

- **XSS:** payloads `<img src=x onerror=…>`, `<script>…</script>`, `"'><svg onload=…>` en clienta, producto, notas de pedido, sección e Historial. Se renderizan como texto (`esc()`), 0 elementos inyectados, `window.__PWN` nunca se activó. Inicio, Pedidos (lista y detalle), Contactos (lista y perfil), Inventario e Historial sin ruptura. El respaldo exportado contiene los strings dentro de JSON (`JSON.stringify`), no HTML ejecutable.
- **WhatsApp:** teléfonos con `javascript:…`, `?text=…&api_url=…` y prefijo malicioso se reducen a dígitos; `window.open` recibió únicamente `https://wa.me/<dígitos>` con `noopener,noreferrer`. Un teléfono internacional `+1…` se mantuvo sin prefijar `598`.
- **localStorage:** JSON inválido, string raíz y array raíz degradan a estado vacío con nav intacta. **Hallazgo MEDIO:** un campo interno con tipo inesperado (`clients[0].name={x:1}` o `clients[0].tel={x:1}`) pasa `sanitizar()` y rompe Contactos (`TypeError` en `fmtTel`/`toUpperCase`), mostrando «Algo falló al abrir esta sección». Propuesta: [task_4f1df60ccac44e69](apx:tasks/task_4f1df60ccac44e69).
- **Prolijidad 390:** Inicio, Contactos, Pedidos, Inventario e Historial con datos inventados, claro/oscuro, sin overflow horizontal de página (`scrollWidth == clientWidth == 375`) ni errores de render. Los scrolls internos de chips no bloquean.

| Escena | Captura / evidencia |
|---|---|
| Inicio con textos de prueba (claro) | [01-inicio-light-390.png](capturas/2026-11-24/seguridad-r42/01-inicio-light-390.png) |
| Contactos con payload como texto (claro) | [02-contactos-light-390.png](capturas/2026-11-24/seguridad-r42/02-contactos-light-390.png) |
| Pedidos con payload como texto (claro) | [03-pedidos-light-390.png](capturas/2026-11-24/seguridad-r42/03-pedidos-light-390.png) |
| Inventario con payload como texto (claro) | [04-inventario-light-390.png](capturas/2026-11-24/seguridad-r42/04-inventario-light-390.png) |
| Historial con payload como texto (claro) | [05-historial-light-390.png](capturas/2026-11-24/seguridad-r42/05-historial-light-390.png) |
| Historial con payload como texto (oscuro) | [06-historial-dark-390.png](capturas/2026-11-24/seguridad-r42/06-historial-dark-390.png) |
| Hallazgo: nombre de clienta como objeto (oscuro) | [08-hallazgo-name-object-dark-390.png](capturas/2026-11-24/seguridad-r42/08-hallazgo-name-object-dark-390.png) |
| Consola del hallazgo (teléfono como objeto) | [07-localStorage-corrupto-console.log](capturas/2026-11-24/seguridad-r42/07-localStorage-corrupto-console.log) |
| Consola del hallazgo (nombre como objeto) | [08-hallazgo-name-object-dark-console.log](capturas/2026-11-24/seguridad-r42/08-hallazgo-name-object-dark-console.log) |

## Gala — Restaurar demo por el camino central (24-nov-2026, vivo r46 / rama `fix/restaurar-demo-central`) · Verificado

Tarea `task_e2e9f472fc594b31`. Sin datos de clientas reales: demo `?demo=1`, pedido ficticio «Prueba Restaurar». «Restaurar demo» usaba `store.boot()` directo (carga/guardado sin rollback ni aviso); ahora es la acción `restaurarDemo()` del store, que viaja por `set()` — mismo rollback, mismo `suscribirDisco` — y conserva cuenta/prefijo/tema. El arranque (`boot()`) queda intacto. Verificado: 6 pedidos → restaurar → 5 pedidos con `theme=light` y `prefijo=+54` conservados, toast «Demo restaurado»; con disco que rechaza la escritura, estado intacto y franja roja «No se guardó» sin toast de éxito. Suite 246/246 y `npm run check` OK. Chrome del proyecto tomado y soltado en esta ronda.

| Escena | Captura |
|---|---|
| Antes: 6 pedidos, modo claro, prefijo +54 | [antes-6-pedidos-claro-prefijo54.png](capturas/2026-11-24/restaurar-demo/antes-6-pedidos-claro-prefijo54.png) |
| Después: 5 pedidos demo, ajustes conservados | [despues-5-pedidos-ajustes-conservados.png](capturas/2026-11-24/restaurar-demo/despues-5-pedidos-ajustes-conservados.png) |
| Disco rechaza: franja «No se guardó», sin toast de éxito | [fallo-disco-aviso-no-se-guardo.png](capturas/2026-11-24/restaurar-demo/fallo-disco-aviso-no-se-guardo.png) |
| Vivo r46: 6→5 pedidos, tema claro y prefijo +54 conservados, 0 errores | [vivo-r46-restaurar-demo-ajustes-conservados.png](capturas/2026-11-24/restaurar-demo/vivo-r46-restaurar-demo-ajustes-conservados.png) |


## Edu — revisión visual en equipo (25-nov-2026) · Verificado local

Tarea `task_4506f4156ab544cb`. Demo `?demo=1`, datos ficticios, 393×852 (CSS) y 320×740; sin cambios de backend ni lógica de negocio. Corregidos: «Limpiar búsqueda» en el vacío de Contactos (también vacía el campo y devuelve el foco), Cancelar en Editar pedido vuelve al detalle del mismo pedido sin consumir la entrada del historial, y «1 entrega» en singular para calendario y accesibilidad. Suite **250/250** y `npm run check` **OK (74 archivos)**. Cambios sin commit/publicar, pendientes de autorización de Nico.

| Hallazgo | Antes | Después |
|---|---|---|
| Barrido visual 390: Inicio, Pedidos, Ajustes e Historial, claro y oscuro | [inicio light](capturas/2026-11-25/ropa-equipo-2026-11-25-escritorio1440-inicio-light.png) [inventario dark](capturas/2026-11-25/ropa-equipo-2026-11-25-escritorio1440-inventario-dark.png) [inventario light](capturas/2026-11-25/ropa-equipo-2026-11-25-escritorio1440-inventario-light.png) [pedidos dark](capturas/2026-11-25/ropa-equipo-2026-11-25-escritorio1440-pedidos-dark.png) [pedidos light](capturas/2026-11-25/ropa-equipo-2026-11-25-escritorio1440-pedidos-light.png) | — |
| Foco móvil 393: detalle de pedido y lightbox | [detalle](capturas/2026-11-25/ropa-equipo-2026-11-25-foco-movil393-detalle-pedido-light.png) [lightbox](capturas/2026-11-25/ropa-equipo-2026-11-25-foco-movil393-lightbox-light.png) | — |
| Vacío móvil 393: Contactos, Inventario y Pedidos | [contactos](capturas/2026-11-25/ropa-equipo-2026-11-25-vacio-movil393-contactos-light.png) [inventario](capturas/2026-11-25/ropa-equipo-2026-11-25-vacio-movil393-inventario-light.png) [pedidos](capturas/2026-11-25/ropa-equipo-2026-11-25-vacio-movil393-pedidos-light.png) | — |

## Toby — pulido visual P1/P2 (26-nov-2026, rama `fix/ux-busqueda-cancelar-plural`) · Verificado local

Tarea `task_4506f4156ab544cb`. Demo `?demo=1`, datos ficticios, 393×852 (CSS) y 320×740; sin cambios de backend ni lógica de negocio. Corregidos: «Limpiar búsqueda» en el vacío de Contactos (también vacía el campo y devuelve el foco), Cancelar en Editar pedido vuelve al detalle del mismo pedido sin consumir la entrada del historial, y «1 entrega» en singular para calendario y accesibilidad. Suite **250/250** y `npm run check` **OK (74 archivos)**.

| Hallazgo | Antes | Después |
|---|---|---|
| Contactos: búsqueda sin resultados sin salida |
| Editar pedido: Cancelar volvía al listado | [antes-editar-cancelar-listado-393.png](capturas/2026-11-26/antes-editar-cancelar-listado-393.png) | [despues-editar-cancelar-vuelve-detalle-393.png](capturas/2026-11-26/despues-editar-cancelar-vuelve-detalle-393.png) |
| Agenda: «1 entregas» | [antes-agenda-1-entregas-393.png](capturas/2026-11-26/antes-agenda-1-entregas-393.png) | [despues-agenda-1-entrega-393.png](capturas/2026-11-26/despues-agenda-1-entrega-393.png) |

**Confirmación de r47 en el vivo** (`?demo=1&gen=r47`), sin rehacer: viewport `width=device-width, initial-scale=1, viewport-fit=cover` (zoom permitido); hoja con `.topbar`, `#main`, `#nav` y `#fab` en `inert=true`, `body.overflow=hidden`, 20 Tabs seguidos dentro de `#hoja`; tarjetas de 156×152 y 162×158 px a 320, selección por teclado de la lateral; cierre con Escape restaura `inert=false`; 0 errores de consola. Captura: [vivo-r47-zoom-foco-abanico-320.png](capturas/2026-11-26/vivo-r47-zoom-foco-abanico-320.png).
