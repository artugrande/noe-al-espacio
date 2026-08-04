# Módulo 2 — Mover el cohete

## Objetivo

Conectar teclado y movimiento 3D sin provocar un render de React en cada cuadro.

## La regla de oro

> **El estado del juego no es el estado de React.**

La posición del cohete cambia hasta 60 veces por segundo. `Rocket.tsx` guarda una referencia al grupo 3D con `useRef`; `useFrame` modifica `rocket.position.x` directamente usando `dt` (tiempo desde el cuadro anterior). Así el movimiento mantiene la misma velocidad en computadoras rápidas o lentas.

`input.ts` conserva la intención del jugador fuera de React. `axisX()` devuelve `-1`, `0` o `1`, y `clampX()` evita salir de los límites. React sí sigue siendo útil para estados poco frecuentes, como estar en inicio, jugando o victoria.

## Actividad

Iniciá una partida, presioná Espacio y movete con flechas o A/D. Después cambiá temporalmente `MOVE_SPEED` y compará. Volvé a un valor controlable.

## Prompts para Cursor

- “Explicame cómo viaja una tecla desde `bindKeyboard` hasta `rocket.position.x`. No modifiques código.”
- “Agregá una inclinación suave al cohete al moverse, usando la referencia existente y sin `useState`.”
- “Revisá `Rocket.tsx`: ¿hay alguna actualización por cuadro que debería quedarse fuera del estado de React?”

## Archivos para inspeccionar

- `components/game/input.ts`
- `components/game/Rocket.tsx`
- `components/game/GameSession.tsx`
- `components/game/playerRef.ts`
- `lib/game/constants.ts`

## Pausa: explicá el diff

Pedí: “Marcá cada línea que corre una vez y cada línea que corre en cada frame”. Rechazá una propuesta que use `setState` para actualizar la posición continuamente. Verificá también que los listeners de teclado se limpien al desmontar el componente.

## Verificación de éxito

- Espacio inicia el vuelo; flechas y A/D mueven el cohete.
- El cohete no supera `PLAY_X_MIN` ni `PLAY_X_MAX`.
- El movimiento sucede en `useFrame` con una referencia, no con estado React por frame.
