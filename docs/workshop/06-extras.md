# Módulo 6 — Extras con propósito

## Objetivo

Extender el juego con escudo, dificultad progresiva y logros sin romper el bucle principal.

## Escudo

Un pickup raro activa `hasShield`. La siguiente colisión con basura consume el escudo en lugar de terminar la misión. El HUD comunica si está activo y `usedShield` permite desbloquear un logro.

## Dificultad progresiva

`getDifficulty(gameTimeMs)` interpola desde los valores base hasta los máximos durante toda la misión. Aumentan la probabilidad de aparición y la velocidad de desplazamiento, pero ambas quedan limitadas. Como es una función pura, puede probarse sin renderizar 3D.

## Logros

`checkAchievements` recibe hechos de la partida y devuelve identificadores:

- coleccionar el primer mate;
- sobrevivir 90 segundos;
- usar un escudo.

La pantalla final traduce esos identificadores a textos. Los logros reconocen formas distintas de jugar sin agregar cuentas ni servidores.

## Prompts para Cursor

- “Explicá el recorrido del escudo desde que aparece hasta que absorbe una colisión.”
- “Agregá una prueba a `difficulty.test.ts` que compruebe que la dificultad no supera sus máximos.”
- “Diseñá un logro pequeño basado en datos que ya existen. Enumerá los archivos antes de cambiar código.”

## Archivos para inspeccionar

- `components/game/Hazards.tsx`
- `components/game/gameState.ts`
- `components/hud/Hud.tsx`
- `lib/game/difficulty.ts`
- `lib/game/difficulty.test.ts`
- `lib/game/curiosidades.ts`
- `lib/game/curiosidades.test.ts`
- `lib/game/types.ts`

## Pausa: explicá el diff

Pedí: “¿Qué nueva regla agrega el diff, dónde se guarda su dato y cómo se prueba?”. Un extra completo suele tocar tipo, regla, conexión y presentación; evitá duplicar la misma condición en varios componentes.

## Verificación de éxito

- El escudo se ve en el HUD y absorbe exactamente un golpe.
- La partida se vuelve gradualmente más rápida, sin superar los máximos.
- Los tests de dificultad y logros pasan con `npm test`.
- La pantalla final muestra los logros obtenidos.
