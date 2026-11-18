// iconos.js — SVG inline del design system (trazo 1.8, linecap round).
const SVG = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

export const ICONO = {
  cash: SVG(`<rect x="2.5" y="6" width="19" height="13" rx="2.5"/><circle cx="12" cy="12.5" r="3"/><path d="M6 9.5h.01M18 15.5h.01"/>`),
  check: SVG(`<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5.5"/>`),
  checkSolo: SVG(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`),
  clock: SVG(`<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>`),
  cal: SVG(`<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>`),
  tag: SVG(`<path d="M20.6 13.3 13.3 20.6a2 2 0 0 1-2.8 0l-7.1-7.1a2 2 0 0 1-.6-1.5l.4-6a2 2 0 0 1 1.9-1.9l6-.4a2 2 0 0 1 1.5.6l7.1 7.1a2 2 0 0 1 0 2.8z"/><circle cx="8.5" cy="8.5" r="1.4"/>`),
  people: SVG(`<circle cx="9" cy="8" r="3.5"/><path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.4.5 4 2.5 4 5.4"/>`),
  plus: SVG(`<path d="M12 5v14M5 12h14"/>`),
  moon: SVG(`<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>`),
  sun: SVG(`<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.8 4.8l1.8 1.8m10.4 10.4l1.8 1.8M19.2 4.8l-1.8 1.8M6.6 17.4l-1.8 1.8"/>`),
  wa: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.05 2.25c-5.4 0-9.78 4.38-9.78 9.78 0 1.72.45 3.34 1.24 4.74L2.25 21.5l4.85-1.27a9.74 9.74 0 0 0 4.95 1.35c5.4 0 9.78-4.38 9.78-9.78s-4.38-9.55-9.78-9.55zm0 17.84c-1.6 0-3.1-.48-4.36-1.3l-.31-.19-3.24.85.86-3.16-.2-.33a8.06 8.06 0 0 1-1.24-4.32c0-4.48 3.65-8.12 8.12-8.12 4.48 0 8.12 3.64 8.12 8.12 0 4.48-3.64 8.45-8.12 8.45z"/><path d="M15.1 13.9c-.15-.08-.9-.45-1.05-.5-.14-.05-.24-.08-.35.07-.1.16-.4.5-.5.6-.09.1-.18.12-.33.04-.15-.07-.63-.23-1.2-.74-.44-.4-.74-.88-.83-1.03-.09-.15-.01-.23.06-.31.07-.07.15-.18.22-.27.08-.09.1-.15.15-.25.05-.1.03-.19-.02-.27-.05-.07-.35-.85-.48-1.16-.13-.31-.26-.27-.35-.27h-.3c-.1 0-.27.04-.4.19-.14.16-.53.52-.53 1.26 0 .74.54 1.46.62 1.56.07.1 1.06 1.62 2.56 2.27.36.16.64.25.85.32.36.11.69.1.95.06.29-.05.9-.37 1.02-.72.13-.36.13-.66.09-.72-.04-.07-.14-.1-.28-.17z"/></svg>`,
  pencil: SVG(`<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/>`),
  trash: SVG(`<path d="M4 7h16M9.5 4h5M6.5 7l.9 13h9.2l.9-13M10 11v5.5M14 11v5.5"/>`),
  x: SVG(`<path d="M6 6l12 12M18 6L6 18"/>`),
  alert: SVG(`<path d="M12 3.5 21.5 20h-19L12 3.5z"/><path d="M12 10v4.5M12 17.2v.3"/>`),
  camera: SVG(`<path d="M8.5 7 10 4.5h4L15.5 7"/><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/>`),
  image: SVG(`<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 17.5 10 12l4 4 3-3 2.5 2.5"/>`),
  buscar: SVG(`<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 16 16"/>`),
  logout: SVG(`<path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/><path d="M9 12h11l-3.5-3.5M20 12l-3.5 3.5"/>`),
  download: SVG(`<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/>`),
  upload: SVG(`<path d="M12 17V5m0 0 4 4m-4-4-4 4M4 19h16"/>`),
  chevIzq: SVG(`<path d="M14.5 5.5 8 12l6.5 6.5"/>`),
  chevDer: SVG(`<path d="M9.5 5.5 16 12l-6.5 6.5"/>`),
  chevDerChico: `<span aria-hidden="true">›</span>`,
};

export const CATS = [
  ["vestido", "👗", "Vestido"],
  ["top", "👚", "Top / Remera"],
  ["pantalon", "👖", "Pantalón / Leggin"],
  ["short", "🩳", "Short / Bermuda"],
  ["interior", "🩲", "Ropa interior"],
  ["camisa", "👔", "Camisa / Blusa"],
  ["abrigo", "🧥", "Abrigo / Chaqueta"],
  ["media", "🧦", "Medias"],
  ["otro", "👜", "Accesorio / Otro"],
];
export const CAT_ICON = Object.fromEntries(CATS.map(c => [c[0], c[1]]));

export const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export const DOW = ["D","L","M","M","J","V","S"];
