# BRIEF-REDESIGN — Rediseño visual total Ropa v2

> Pedido de Nico (2026-11-18): la app se ve "desbalanceada", "casera" y "parcheada". Quiere un diseño
> **profesional, estético y moderno** que genere **dopamina visual**: transiciones y animaciones buenas,
> sombras en las tarjetas, solo íconos SVG (nada de emojis como ícono), manteniendo la arquitectura modular.
> Base: worktree `f0-f1-visual`, commit `35cb938` (rama `feat/redesign-v2`). El rediseño va en worktree y rama
> nueva (`feat/redesign-total`), sin push sin avisar.

## Diagnóstico del estado actual (captura `v2-hoy-inicio.png`)

1. **Cards planas**: sin sombras perceptibles, sin borde de luz, todos los planos al mismo nivel → look casero.
2. **Jerarquía débil**: saludo y números sin protagonismo; el dinero (el dato clave del negocio) pesa igual
   que "Clientes: 4".
3. **Desbalance**: 6 tarjetas idénticas en grilla; no hay focal visual ni ritmo (grande/mediano/chico).
4. **Nav inferior apretada**: 7 ítems con etiqueta en 393px queda congestionado; activo sin distinción fuerte.
5. **Sin ambiente**: fondo liso, sin halo/profundidad; el acento teal aparece solo en textos sueltos.
6. **Íconos sin peso**: SVGs pequeños monocromos dentro de cajitas grises, sin color ni coherencia.
7. **Espaciado irregular**: paddings y gaps que varían entre secciones.

## Dirección de diseño ("premium retail, vivo")

Los tokens de `src/ui/tokens.css` ya apuntan bien; el problema es que los componentes no los explotan.
Rediseño con foco en:

### Superficies y profundidad
- **Toda card** con sombra escalonada real (`--sh-1/2/3`), borde de luz superior (`--inset-hair`) y radio 20–24.
- Fondo con **halo radial teal sutil** arriba (5–8% de opacidad) + segunda manera fría abajo; nada de fondo liso.
- Tarjeta primaria de dinero (Por cobrar) **protagonista**: más grande, con gradiente del acento
  (`--grad-acc`) o glow suave (`--sh-acc`), número enorme tabular; el resto secundario en cards chicas.
- Jerarquía por tamaño: primaria grande, secundarias medianas, terciarias compactas — nunca 6 iguales.

### Motion y dopamina (todas con `prefers-reduced-motion` respetado)
- Entrada de pantallas con **stagger** (~30 ms por card) mantenido y pulido.
- **Contadores que cuentan**: montos animan de 0 al valor (~500 ms, `--ease-out`).
- **Tap con escala 0.96–0.97** + elevación en todas las cards/botones (feedback táctil uniforme).
- Transición entre secciones: crossfade + deslizo corto (ya existe, afinar).
- **Momento premiante** al marcar Pagado: check animado + glow del acento, sin exagerar.
- Chips de estado con dot animado (pulso sutil) y relleno del color del estado.
- Barra de progreso de cuotas que crece animada al cambiar.

### Navegación
- Nav inferior con **glass real** (`--blur`), altura generosa, etiquetas solo en el activo o tipografía más
  chica; **píldora activa con glow del acento**; íconos con stroke 1.8–2 y weight consistente.

### Íconos
- **Solo SVG inline** (ya están en `src/ui/iconos.js`): sin emojis en ningún título, botón o chip.
- Íconos de tarjetas con el color de acento de su métrica (`--pcash`, `--pcheck`…), dentro de squircle con
  relleno suave del mismo color (`--acc-soft` pattern).

### Tema claro
- Mismo sistema con sombras más suaves y halos al 3–4%; verificado AA en ambas temas.

### Alcanza a (todo lo visible)
Inicio, Pedidos (lista/detalle/editor), Inventario (grilla/editor/hoja), Contactos (lista/detalle/editor),
Agenda, Historial, Ajustes, hojas inferiores, toasts, confirmaciones, lightbox, skeleton loaders, nav y FAB.

### Reglas
- Cambios solo en `src/ui/*` (tokens/base/motion/componentes) y markup de pantallas; **no tocar** `nucleo/`,
  `estado/`, `datos/`, `servicios/` ni tests.
- Mantener arquitectura modular: nada de estilos inline en JS de pantallas más allá de lo imprescindible;
  los estilos viven en CSS de componentes.
- Todos los pases QA/contrast (≥4.5:1) y táctil (≥44px) se conservan.
- Capturas antes/después en `capturas/2026-11-18/` indexadas en `INDICE-CAPTURAS.md`.
