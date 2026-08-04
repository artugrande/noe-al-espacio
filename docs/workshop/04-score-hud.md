# Módulo 4 — Puntaje, HUD y coleccionables

## Objetivo

Dar puntos por coleccionar objetos y mostrar información legible encima de la escena 3D.

## Dos capas, dos ritmos

La simulación vive en `Hazards.tsx`. Al tocar un mate o una empanada, actualiza el puntaje del snapshot con `patchSnapshot`. El HUD es una capa HTML: `Hud.tsx` se suscribe con `useSyncExternalStore` y muestra puntaje, tiempo y escudo.

Esta separación es intencional:

- Three.js mueve objetos en cada cuadro.
- React actualiza texto y pantallas cuando cambia información útil para la persona.
- El tiempo del HUD se publica cada 100 ms, no 60 veces por segundo.

Los valores `SCORE_MATE` y `SCORE_EMPANADA` viven en `constants.ts`, así pueden ajustarse sin buscar números sueltos por el proyecto.

## Prompts para Cursor

- “Seguí el dato `score` desde una colisión con un mate hasta el texto que aparece en `Hud`.”
- “Cambiá el valor de la empanada a 20 puntos usando una constante. Indicá qué pruebas o chequeos harías.”
- “Mejorá la accesibilidad visual del HUD sin tocar la simulación ni mover componentes 3D.”

## Archivos para inspeccionar

- `components/game/Hazards.tsx`
- `components/game/gameState.ts`
- `components/hud/Hud.tsx`
- `app/page.tsx`
- `lib/game/constants.ts`
- `lib/game/scores.ts`

## Pausa: explicá el diff

Pedí: “Clasificá cada cambio como simulación 3D, estado compartido o presentación”. Si el diff mueve posiciones desde `Hud` o agrega JSX del HUD dentro del pool, revisalo: esas responsabilidades deben seguir separadas.

## Verificación de éxito

- El mate suma 10 y la empanada 15 con los valores actuales.
- El HUD cambia sin tapar ni impedir los controles.
- Al terminar, el puntaje aparece en la pantalla final y se guarda entre partidas.
- Recargar la página conserva la tabla de mejores puntajes.
