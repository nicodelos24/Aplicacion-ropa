// skeleton.js — loaders para toda carga.
export function skeletonPedidos(n = 4) {
  return `<div class="stagger">${Array.from({ length: n }, () =>
    `<div class="card skel" style="height:96px"></div>`).join("")}</div>`;
}
export function skeletonGrilla(n = 9) {
  return `<div class="inv">${Array.from({ length: n }, () =>
    `<div class="inv-card skel" style="height:120px"></div>`).join("")}</div>`;
}
export function skeletonLineas(n = 5) {
  return `<div class="stagger">${Array.from({ length: n }, (_, i) =>
    `<div class="ev skel" style="height:52px;animation-delay:${i * 30}ms"></div>`).join("")}</div>`;
}
