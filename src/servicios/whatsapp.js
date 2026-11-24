// WhatsApp: re-export del núcleo (la capa de UI no calcula, solo muestra).
import { linkWhatsApp } from "../nucleo/contacto.js";
export {
  PREFIJO_DEFECTO, prefijoLimpio, waTel, maskTel, fmtTel, linkWhatsApp,
} from "../nucleo/contacto.js";

/** Abre el chat directo (necesita DOM; el cálculo vive en nucleo). */
export function abrirWhatsApp(tel, texto, prefijo) {
  const link = linkWhatsApp(tel, texto, prefijo);
  if (typeof window !== "undefined" && link) window.open(link, "_blank", "noopener,noreferrer");
}
