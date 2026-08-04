# Módulo 1 — Hola, React Three Fiber

## Objetivo

Entender cómo `Canvas` crea el mundo 3D y cómo `Scene` agrega fondo, luces, estrellas y objetos.

## Actividad

Abrí `http://localhost:3000/dev/scene`. Esta ruta aislada permite experimentar sin pasar por las pantallas del juego.

En `GameCanvas.tsx`, `Canvas` configura la cámara, la resolución y WebGL. Dentro de él, `Scene` describe lo que existe en el mundo:

- `ambientLight` ilumina todas las caras suavemente.
- `directionalLight` simula una luz que llega desde una dirección.
- `Stars` genera el campo de estrellas.
- Cada `mesh` o `group` tiene posición, geometría y material.

Probá cambiar **un valor por vez**: color de fondo, intensidad de una luz o cantidad de estrellas. Guardá y observá la recarga automática.

## Prompts para Cursor

- “Explicame `components/game/GameCanvas.tsx` como si recién empezara con 3D. ¿Qué hacen cámara, `fov` y `dpr`?”
- “En `Scene.tsx`, proponé un cambio pequeño para que la luz parezca más cálida. No cambies la jugabilidad.”
- “Agregá un planeta de prueba con una esfera en `/dev/scene` y explicá posición, geometría y material.”

## Archivos para inspeccionar

- `app/dev/scene/page.tsx`
- `components/game/GameCanvas.tsx`
- `components/game/Scene.tsx`

## Pausa: explicá el diff

Antes de aceptar, pedí: “Explicá el diff separando qué cambia la escena, qué cambia la apariencia y qué podría afectar el rendimiento”. Confirmá que el cambio está dentro de `Canvas`; etiquetas 3D como `<mesh>` no son elementos HTML.

## Verificación de éxito

- `/dev/scene` muestra fondo oscuro, estrellas, luces, cohete y estación.
- Un cambio visual elegido por el grupo aparece al guardar.
- Podés explicar la relación: página → `GameCanvas` → `Canvas` → `Scene`.
