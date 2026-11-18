# Aplicacion-ropa — protocolo entre agentes (leer al empezar cualquier tarea)

Este repo es la **segunda versión mejorada de Ropa**. El plan, los hallazgos de revisión/QA y el índice de capturas de la versión actual se copiaron aquí como base del nuevo desarrollo; el código se adapta a partir del repo `Ropa` (`/home/nico/Documents/GitHub/Ropa`).

## Documentación vigente

- **README.md**: estado del proyecto y cómo partir del repo `Ropa`.
- **PLAN.md**: plan completo de la segunda versión (estado v35 + hallazgos P1/P2/P3 pendientes UX34–36, prioridades y aceptación).
- **INDICE-CAPTURAS.md**: índice único de capturas de Nico, Alba, Bianca y Orion/QA (histórico de la v1, referencia para la v2).
- **Revision-Bianca-*.md** y **QA-Orion-*.md**: informes de revisión visual y QA funcional por versión (histórico de la v1).

## Reglas vigentes

- Nada de contraseñas ni datos de clientas en cualquier archivo del repo.
- Las capturas se guardan en `capturas/AAAA-MM-DD/` y se enlazan desde `INDICE-CAPTURAS.md`; no borrar evidencia histórica.
- Los cambios de código se hacen en worktrees bajo `.worktrees/` con ramas nombradas, no directo en master; no hacer push sin avisar a Nico.
