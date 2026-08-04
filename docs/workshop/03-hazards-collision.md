# Módulo 3 — Obstáculos y colisiones

## Objetivo

Reutilizar un grupo fijo de objetos, moverlos por la escena y detectar cuándo tocan al cohete.

## Cómo funciona

`Hazards.tsx` crea un **pool** de 32 grupos al montar la escena. En vez de crear y destruir componentes durante la partida, activa un espacio libre, cambia su tipo y posición, y luego lo vuelve a ocultar. Esto evita trabajo extra y pausas.

En cada cuadro:

1. Puede activarse un objeto después de `SPAWN_DELAY_MS`.
2. Los activos avanzan hacia el cohete según la dificultad.
3. Los que salen de pantalla vuelven al pool.
4. Los que están en una profundidad cercana se comparan con `spheresOverlap`.

La colisión usa dos esferas invisibles. Hay contacto cuando la distancia entre centros es menor o igual que la suma de sus radios. La función compara distancias al cuadrado para evitar una raíz cuadrada innecesaria.

## Prompts para Cursor

- “Explicá el ciclo de vida de un slot del pool en `Hazards.tsx`: libre, activo, colisión y reciclado.”
- “Explicá `spheresOverlap` con un dibujo mental y un ejemplo numérico sencillo.”
- “Agregá una prueba unitaria para el caso exacto en que dos esferas apenas se tocan.”

## Archivos para inspeccionar

- `components/game/Hazards.tsx`
- `components/game/playerRef.ts`
- `lib/game/collisions.ts`
- `lib/game/collisions.test.ts`
- `lib/game/constants.ts`

## Pausa: explicá el diff

Pedí: “¿Este cambio crea componentes o llama `setState` dentro de `useFrame`? Explicá el costo”. Para una nueva regla de colisión, separá la matemática pura en `lib/game` y cubrila con una prueba antes de conectarla a la escena.

## Verificación de éxito

- Después del despegue aparecen objetos que bajan y se reciclan.
- Chocar basura termina la misión si no hay escudo.
- `npm test -- lib/game/collisions.test.ts` pasa.
- El número de grupos del pool permanece fijo durante la partida.
