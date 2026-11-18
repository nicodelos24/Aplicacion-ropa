# Aplicacion-ropa — PLAN de la segunda versión

> Copia íntegra del estado documentado de la v1 de Ropa al 2026-11-17 (v35, worktree `feat/ux-v34`, commit `cd851c7`), para servir de base del desarrollo de esta segunda versión mejorada. Los hallazgos y prioridades son de Bianca (revisión visual UX36) y Orion (QA funcional independiente); la decisión de qué implementar y en qué orden la toma Nico.

## Estado de partida (v1)

- **Revisión visual UX36 (Bianca): NO OK todavía.** Informe íntegro: `Revision-Bianca-UX36.md`. Evidencia: `capturas/2026-11-14/ux36-bianca/` (27 matrices fuente = 162 combinaciones de escena/ancho/tema + 8 capturas individuales); índice: `INDICE-CAPTURAS.md`.
- **QA funcional independiente (Orion): NEEDS WORK.** Informe: `QA-Orion-UX35-cd851c7.md`. Suite 23/23 y check OK; harness jsdom 60 casos, 44 PASS / 16 FAIL agrupados en cuatro hallazgos.
- Worktree `feat/ux-v34` termina limpio en `cd851c7` (HTML hash `0e12fd14…`); sin cambios de app/commit/push por los revisores.

## P1 — monetarios (UX36-01 / amplía UX35-02)

Decimal manual rompe Guardar con `d is not defined` sin mensaje; entradas inválidas manuales se guardan como cero; parser admite puntos malformados y concatena cifras en ambos formularios. Reproducido en Chrome los dos primeros; Orion reproduce los tres.

- Mensaje inline comprensible, foco y bloqueo sin mutar datos; reglas compartidas con cero válido preservado.
- Detalle técnico de Orion: `ReferenceError: d is not defined` en `index.html:1380` (`d.querySelector`); `abc`/`-10`/`1e3` guardan price=0 sin `.ferr`/aria-invalid (`:1329`); `1.2.3`→123, `12..00`→1200, `12.3456`→123456, `..`→0 por fallback de parseMoney sin validar gramática (`:598–615`).

## P2 — snapshot de foto (UX36-02 / amplía UX35-04)

Selección normal desde catálogo con foto no copia snapshot (`item.photo=null`); borrar el producto por UI deja pedido sin imagen. La corrección de representar una foto propia ya guardada sí pasa.

- Copiar foto al incorporar producto y probar el camino real completo (selección real, no solo fixture con foto propia).

## P2 — textos largos en Detalle (UX36-03 / amplía UX35-08 a Detalle)

Título de cliente y `.dname` largos rompen Detalle en los seis cruces. A320: hoja 290px frente a scroll 1240px.

- Wrap en selectores reales + contención del hijo flex, sin ocultar precio ni romper selección.

## P2 — accesibilidad por teclado (UX36-04)

Pedidos/contactos/días calendario no alcanzables por teclado (div onclick sin role/tabindex). Tab real tras último filtro salta a Inicio y omite pedidos.

- Acceso semántico con teclado, sin botones anidados.

## P2 — residual UX35-05 (Orion)

Categoría apunta a control inexistente (`inv-cat` sin destino; label.control=null en `:998`); nombrar el grupo semánticamente (legend/aria-labelledby). Los nueve botones siguen presentes.

## P3 — feedback y área táctil (UX36-05)

Feedback visual de foto manual (miniatura/texto visible) y área 44px del nuevo Quitar foto, hoy 36px. No cambiar la grilla de inventario 3× ni su excepción de densidad.

## Pendientes UX34 reobservados (sin duplicar)

Tickets existentes **UX34-06/07/08/10/11/13/14/16 y terminación 12/17**: alineación escritorio, cabecera 272px, esqueleto/foco/cierre/pie de hojas, vacíos con salida, alta bajo día elegido (hoy y 1174 a 393), claridad pago/entrega, confirmación neutral, precio/categoría y microcopy. **UX34-09 mejoró:** Nombre/Precio ya preceden Categoría y el rótulo fue corregido; queda foto por delante de esenciales. **SVG de categorías sí avanzó.** Sección 5 del informe `Revision-Bianca-UX36.md` con evidencia y aceptación.

## Pases que deben conservarse

Homónimos $300, borrador de foto Cancelar/Guardar, foto propia existente, búsqueda 90/no-match, fecha histórica y mixto qty2/$0 (Orion). En Chrome: adjuntar con compresor real y Cancelar/Guardar correcto; seis productos sin salto, navegación 6/6, contraste de estados ≥4,57:1, cuotas 6,53:1 claro/9,52:1 oscuro, total 6,79:1 claro; lightbox modal con Tab/Escape y movimiento reducido. Conservar **flechas+contador**, selección fija, confirmación y animaciones rápidas.

## Límites y verificación pendiente (UNVERIFIED en v1)

Teléfono físico, teclado virtual/safe areas, lector completo, zoom nativo, cámara/galería del dispositivo, cuentas/nube, WhatsApp/respaldo y caché instalada siguen sin comprobar. Revalidar versión publicada antes de reutilizar hallazgos: el Historial pasó de roto a funcionando durante la prueba de la v1.

## Reglas de proceso

- Sin aprobación general ni autorización de publicación sin pasar por Nico.
- Worktrees bajo `.worktrees/` con ramas nombradas; revalidar al commit corregido (QA de Orion + revisión de Bianca) antes de publicar.
- Capturas nuevas en `capturas/AAAA-MM-DD/` enlazadas desde `INDICE-CAPTURAS.md`.
