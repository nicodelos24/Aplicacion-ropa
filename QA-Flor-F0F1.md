# QA-Flor-F0F1.md — QA funcional de Ropa v2 (F0+F1 con F2 integrado)

**Fecha:** 2026-11-18 · **QA:** Flor · **Branch:** `feat/f0-f1-visual` (worktree `.worktrees/f0-f1-visual`)
**Verificación en vivo:** Chrome del proyecto sobre `http://127.0.0.1:8737/index.html?demo=1` (origen limpio).

## Veredicto: APPROVED (sin bugs P1)

La app completa (7 secciones, editor, cuotas, búsqueda, agenda, clientes, persistencia) pasa QA funcional. Los tests del núcleo siguen 39/39 verdes. Quedan 2 hallazgos P2/P3 para pulir, ninguno bloquea.

## 1. Tests del núcleo

- `npm test` en `.worktrees/v2-nucleo` (rama `feat/v2-nucleo`): **39/39 ✔**.

## 2. CRUD de pedidos

- **Crear del inventario:** Paco + Camisa blanca → guarda con toast "Guardado ✓", contador de pedidos y chips recalculados.
- **Crear "a mano":** Tita + "Cinturón cuero" $700 → toast **"Guardado ✓ · 1 producto al inventario"**; el producto aparece en Inventario (6→6 productos) ✔. El pedido nuevo entra al tope de la lista (7 pedidos).
- **Editar:** al pedido de Paco le agregué producto a mano "Bufanda tejida" $450 → total recalcula $950→$1,400 y también entra al inventario ✔.
- **Cambiar estado:** con confirmación ("Cambiar estado"); cancelar no cambia nada, aceptar aplica (Nuevo→En cuotas, "Pagó 0 de 2") y chips se recalculan.
- **Eliminar:** confirmación con mensaje claro ("El inventario no cambia"); elimina pedido, chips y totales del header se recalculan, toast "Pedido eliminado".

## 3. Cuotas

- **− Cuota / + Cuota** en el detalle: 3→2→1→0 y de vuelta; nunca sale del rango.
- **Auto-paso a Pagado:** al pagar la última cuota el pedido pasa a "Pagado" (chips: En cuotas 0, Pagado +1) y se cierra la hoja ✔.
- **Animación premiante:** verificada en vivo — overlay con check animado (`.check-premiado`), anillo (`animation: anillos`) y disco verde, visible en el frame posterior al último pago y desaparece a ~1,1 s. Captura `06-premio-check-anillo.png`.

## 4. Búsqueda y filtros

- **Pedidos:** texto filtra por cliente/producto ("Rosita" → 2); sin coincidencias muestra estado vacío "Sin resultados / Nada coincide…" ✔. Chips Todos/Pagado/Mensaje enviado/En cuotas/Nuevo con contadores correctos; "En cuotas (0)" muestra lista vacía.
- **Inventario:** búsqueda case-insensitive ("Camisa" → Camisa blanca) y estado vacío propio ✔ (`08`, `10`).
- **Contactos:** búsqueda activa (sección en CON_BUSQUEDA).
- **Historial:** lista los movimientos; el buscador no está habilitado en esta sección (por diseño, CON_BUSQUEDA = pedidos/inventario/contactos). Si se quería búsqueda acá, es mejora futura, no bug.
- **Restaurar demo** limpia búsqueda y filtros al estado demo (ver §7).

## 5. Agenda

- Calendario noviembre 2026 con puntos por estado; días 19/20/22/25 marcados (1 entrega c/u) ✔.
- **Tap en día 25** → título "25 de noviembre" y solo el pedido de Lucía (Pantalón negro) ✔ (`11-agenda-dia-25-lucia.png`).
- Fechas de la demo relativas a hoy (19 nov = +1 día, 25 nov = +7): correctas al 18 nov.

## 6. Clientes

- **Alta desde editor:** escribir un nombre nuevo en el combobox y guardar crea el cliente (Tita quedó en Contactos → 4 clientes con chips de estados).
- **Hoja de cliente:** Rosita muestra "1 pendiente · 1 pedido hecho", WhatsApp, sección Pendientes (Vestido floral $1,200 Nuevo 📅 20 nov) y Hechos (Medias lanas $500 Pagado), botón "+ Nuevo pedido para Rosita" ✔ (`14-cliente-hoja-rosita.png`).

## 7. Persistencia

- **Tema:** claro/oscuro persiste en `localStorage` y sobrevive recarga ✔.
- **Recarga dura:** en `?demo=1` el boot resiembra la demo (comportamiento de demo, esperado — ver nota); en modo normal los datos van a localStorage (`boot` → `persistencia.guardar`).
- **"Restaurar demo":** confirmación + toast "Demo restaurado"; vuelve a los 5 pedidos demo limpios (chips Todos 5 / Pagado 2 / Msg 1 / Cuotas 1 / Nuevo 1) y sin los productos que agregué ✔.

## 8. Casos borde

| Caso | Resultado | Severidad |
|---|---|---|
| Precio `0` en producto a mano | **Se guarda un pedido de $0** y "Cosa" entra al inventario | **P2** |
| Precio `abc` | Rechazado con "Hay un precio inválido en los productos a mano" ✔ | — |
| Cliente vacío | Rechazado: campo marcado + "Escribí el nombre del cliente" ✔ | — |
| Cuotas `1` en "En cuotas" | Se **clampea silenciosamente a 2** (guarda "Pagó 0 de 2" sin aviso) | **P3** |
| Cuotas `13` | Idem: se guarda con 2 cuotas (clamp silencioso) | **P3** |
| Snapshot de producto | Edité Camisa blanca a $999 en Inventario; el pedido viejo conserva **$950** en su detalle ✔ | — |

## Hallazgos

### P2 — Precio 0 pasa la validación del pedido "a mano"
**Repro:** Nuevo pedido → Escribir a mano → nombre "Cosa", precio `0` → Guardar. Se crea un pedido de total $0 y el producto entra al inventario con $0. El validador de inventario manual sí lo acepta pero el caso esperable es advertencia o bloqueo.
**Sugerencia:** en `pantalla-pedido-editor.js` (y `pantalla-inventario-editor.js`), rechazar `parseMoneda(x) <= 0` con "El precio debe ser mayor a 0" (o avisar y dejar continuar).

### P3 — Cuotas fuera de rango se clampean sin aviso
**Repro:** Nuevo pedido → En cuotas → número `1` (o `13`) → Guardar. Se guarda con 2 cuotas sin mensaje. No pierde datos (el clamp de `cuotasValidas` funciona), pero el usuario no entiende por qué.
**Sugerencia:** mostrar error inline "Entre 2 y 12 cuotas" en vez de clamping silencioso (la función `cuotasValidas` ya devuelve `null`; el editor hace `?? CUOTAS_MIN`).

### P3 — Producto a mano entra al inventario con categoría default
**Repro:** pedido a mano "Bufanda tejida" → en Inventario figura como "👗 · Vestido". Funcionalmente no rompe (nombre/precio/ícono del pedido conservan su snapshot), pero conviene permitir categoría en el alta a mano o default "Accesorio / Otro". El producto creado directo desde Inventario sí conserva la categoría elegida (verificado con "Cinturón cuero" 👜).

## Qué NO se verificó en vivo

- Notificaciones reales de WhatsApp (fuera de alcance F3).
- Cámara real para fotos (el flujo de comprimir/galería quedó para una pasada con archivo de imagen).

## Evidencia

Capturas en `capturas/2026-11-18/qa-flor/` (31 imágenes): editor y edición con producto a mano (`03`, `04`), cuotas y premio (`05`, `06`), búsquedas y vacíos (`07`–`10`), agenda y cliente (`11`–`14`), tema/persistencia/restaurar (`15`–`18`), casos borde (`19`–`25`).
