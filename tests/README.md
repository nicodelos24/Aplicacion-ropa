# Verificación local de UI

```bash
npm ci --ignore-scripts
npm test
npm run check
python3 -m http.server 8764
```

`npm test` corre `node --test tests/*.test.mjs`: dominio (`nucleo.test.mjs`), store (`store.test.mjs`), datos demo (`datos.test.mjs`), moneda (`monoeda.test.mjs`) y la app montada (`ui.test.mjs`). `npm run check` pasa `node --check` sobre todo `src/`, `sw.js` y esos tests: atrapa errores de sintaxis sin navegador.

## Qué cubre `tests/ui.test.mjs` (jsdom, sin navegador)

Monta el esqueleto de `index.html` en jsdom, instala `window`/`document`/`localStorage` y stubs (`matchMedia`, `scrollTo`, `URL.createObjectURL`, `fetch` que falla y registra llamadas) como globals, e importa `src/main.js` como módulo ES: se ejecuta el código real de la app, no una copia. Un único import por proceso (los módulos guardan estado); cada test reinicia con demo limpia.

Cubre: arranque demo y render de Inicio; navegación por las 7 secciones con la pestaña activa; toggle de tema (atributo `data-theme`, ícono, `db().theme` y persistencia en `ropa_v2_data.theme`; la clave vieja `ropa_v2_tema` quedó fuera de uso y el test comprueba que no se escribe ni se lee); chips de pedidos con contador; vacío de búsqueda sin resultados y vacío de bienvenida con “Nuevo pedido”; cuotas con piso 0 y auto-paso a Pagado; cambio de estado con confirmación (cancelar no muta, aceptar sí); Enter en una tarjeta del stack sin abrir lightbox; restaurar demo con confirmación; ausencia de red y de Firebase en `src/`; favicon, entrada `type="module"` y precache del service worker.

## Qué sigue cubriendo `tests/visual.js` (navegador real)

Abrí `http://localhost:8764/tests/visual.html` y tocá **Probar matriz**. El iframe usa la app real con `?demo=1`, en 320×568, 393×740 y 1280×640, claro/oscuro. La barra permite inspeccionar cada escena después de **Restablecer demo**. No accede a datos reales; el harness se niega a correr fuera de localhost. El tamaño del iframe es el viewport CSS probado.

La matriz verifica lo que jsdom no puede: geometría y `getBoundingClientRect`, contraste calculado de estilos renderizados (composición alfa y color-mix), overflow, alturas táctiles (`offsetHeight >= 44`), foco/inert reales del lightbox y de la hoja, selección del abanico de tarjetas y edición de tres productos con archivo de foto. Ninguna de estas pruebas reemplaza un teléfono real, un lector de pantalla ni un despliegue con service worker.
