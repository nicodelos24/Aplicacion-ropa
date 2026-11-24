# Auditoría de la app real publicada · Amber · 24-nov-2026

Pedido de Nova en nombre de Nico (alcance corregido): auditar **sólo la aplicación real publicada**, no maquetas. Sin publicar nada.

## Base verificada

- URL: `https://nicodelos24.github.io/Aplicacion-ropa/?demo=1` (vivo, datos de demostración).
- Generación publicada: `r38`. `sw.js` local y remoto byte-idénticos (`3b56d614…`), `src/main.js` idem (`17c57c81…`); `master` local = `origin/master` = `1cc1762`. No se tocó código ni se hizo commit/push.
- Chrome del proyecto `kaia_chrome_ropaapp` conectado (25 tools; `apx mcps check … --project p_1df5e060f70e`). Sin uso simultáneo: las pestañas 0/1 ajenas (`abanico-real-r39`, puerto 8766) quedaron intactas; se trabajó en pestaña propia con contexto aislado.
- Suite local: `npm test` 225/225 OK; `npm run check` sintaxis OK en 72 archivos (logs en esta carpeta).
- Consola del vivo: 0 errores propios de la app; 1 warning de arranque (`apple-mobile-web-app-capable` deprecated). El único 404 visto fue un `fetch` de prueba mal armado desde la consola (`/sw.js` en vez de `/Aplicacion-ropa/sw.js`), no un fallo de la app.

## Lo que funciona (comprobado en el vivo)

- Arranque con `?demo=1`: 5 pedidos, 6 productos, 4 contactos de demo; sin datos de clientas reales.
- Navegación a las 7 secciones por barra y por hash directo (`#pedidos`, `#agenda`, `#inventario`, `#contactos`, `#historial`, `#ajustes`): abren la vista correcta; `#inexistente` cae en Inicio.
- Tema claro/oscuro: conmuta y persiste en `ropa_v2_data.theme`.
- Pedidos: filtros por estado, alta de producto nuevo al pedido («Campera QA» $1,250.50 → queda 3º en el stack y el total pasa a $2,500.50), edición de artículo (validación `1.2.3` rechazada con mensaje «solo números y un punto» y foco en el campo), cuotas (+/−, «sin guardar», confirmación al salir, guardar → `cuotasPagadas` 2 de 3 persistido), cambio de estado a Pagado con confirmación y celebración.
- Agenda: calendario con `role=button`, `tabindex=0` y `aria-label` por día; tocar el 26/11 selecciona y muestra las entregas del día; «Nuevo pedido con entrega este día».
- Inventario (FAB → Nuevo producto) y Contactos (FAB → Nuevo contacto): formularios y cancelación sin guardar responden.
- Confirmaciones (`#confirmar`): `role=alertdialog`, `aria-modal`, `aria-labelledby/describedby`, foco atrapado entre Sí/No, Escape consume el aviso sin cerrar la hoja de abajo.
- Diseño responsive: sin desbordes laterales en 320/1280 (salvo los carruseles de chips, que son scrolleables por diseño); nav y FAB visibles; tarjetas e íconos con `aria-label` o texto.

## Hallazgos (para decidir, no aprobación)

1. **A11y · trampa de foco ausente en la hoja (`role=dialog aria-modal=true`).** Con el detalle abierto, 12–13 Tab desde el foco inicial sale a `#themeBtn` / `#search` fuera del diálogo; la hoja no pone `inert`/`aria-hidden` al resto de la app. El `alertdialog` de confirmación sí lo hace bien. Impacto: navegación por teclado anuncia un modal pero deja alcanzar la UI de detrás (WCAG 2.1.2 / 4.1.2). No rompe el flujo táctil ni lo pedido funcionalmente.
2. **A11y · zoom bloqueado.** `index.html` lleva `user-scalable=no` en el viewport. Impacto: pinch-to-zoom no disponible para baja visión (WCAG 1.4.4). Es independiente del warning de meta deprecado mencionado arriba.
3. **UX · tarjetas del stack se tapan entre sí a 320.** Con 3 artículos, la tarjeta del fondo («Corbata») recibe `elementFromPoint` propio sólo en su franja izquierda (~15–20 % del ancho); el resto lo cubre la tarjeta del frente. El lápiz de la barra nombra y edita la que está al frente, pero «tocar una tarjeta para traerla al frente» no es fiable en ese ancho. Confirmado con Playwright: el click central de `Corbata` es interceptado por `Campera QA`; el borde izquierdo sí selecciona. Ya estaba cubierto en revisiones v30/v35; sigue igual en r38.
4. **Menor · warning de meta** `apple-mobile-web-app-capable` deprecated, sin `mobile-web-app-capable`. No afecta funcionamiento.

## Lo que NO se pudo cubrir en esta etapa

- Viewport 390×844 y prueba en teléfono físico; el 320 y el 1280 sí.
- Cámara/galería reales, abrir WhatsApp (`wa.me`), descargar respaldo y restaurar demo (acciones del sistema o con efectos fuera de la app; no se dispararon).
- Persistencia tras recarga y service worker offline (se verificó el hash del SW, no el comportamiento sin red).
- Lectores de pantalla reales (VoiceOver/TalkBack); el análisis de foco es instrumental con Chrome.

## Evidencia

Carpeta `capturas/2026-11-24/auditoria-real-2026-11-24/` (13 PNG + logs de npm + `SHA256SUMS.txt`). Incluye inicio 320 claro/oscuro, pedidos 320 claro, detalle con 3 productos (r38), cuotas y cambio de estado, pedido pagado, agenda, inventario, contactos, historial, ajustes 320/1280. No se agregó fila al `INDICE-CAPTURAS.md` ni se publicó nada.
