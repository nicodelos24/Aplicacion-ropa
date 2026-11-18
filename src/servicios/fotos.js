// Compresor de fotos: 480px máx por lado, JPEG calidad 0.72 (P1: miniatura
// visible al adjuntar). Devuelve Promise<dataURL>, error manejable por la UI.
const MAX_LADO = 480;
const CALIDAD = 0.72;

export function comprimirFoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || typeof URL === "undefined" || typeof Image === "undefined") {
      reject(new Error("Este navegador no soporta fotos")); return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const sc = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * sc);
        c.height = Math.round(img.height * sc);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", CALIDAD));
      } catch (e) { reject(new Error("No se pudo procesar la foto")); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo abrir la foto")); };
    img.src = url;
  });
}

export { MAX_LADO, CALIDAD };
