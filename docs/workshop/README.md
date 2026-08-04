# Taller: Noe al Espacio con Cursor

Guía práctica para construir un juego 3D web en ocho módulos. Está pensada para grupos de 12 a 18 años: cada etapa deja algo visible o jugable y usa Cursor como compañero para leer, proponer y explicar código.

## Recorrido

0. [Preparar el proyecto](./00-setup.md)
1. [Primera escena con React Three Fiber](./01-hello-r3f.md)
2. [Mover el cohete](./02-rocket-movement.md)
3. [Obstáculos y colisiones](./03-hazards-collision.md)
4. [Puntaje, HUD y coleccionables](./04-score-hud.md)
5. [Temporizador, estación y victoria](./05-timer-win.md)
6. [Extras: escudo, dificultad y logros](./06-extras.md)
7. [Publicar y compartir en Vercel](./07-deploy.md)

## Por qué este stack

- **Next.js** organiza páginas, estilos y despliegue sin exigir configurar muchas herramientas. El grupo puede concentrarse en el juego.
- **React Three Fiber (R3F)** permite crear una escena Three.js con componentes conocidos: luces, mallas y cámara se leen como una estructura visual.
- **Cursor** ayuda a explorar un proyecto real, generar cambios pequeños y, sobre todo, pedir explicaciones adaptadas al nivel de cada participante. Siempre hay que revisar y probar lo que propone.
- **TypeScript** hace visibles muchos errores antes de abrir el navegador y convierte los tipos en documentación.

## Regla de oro

> **El estado del juego no es el estado de React.**

React controla pantallas y HUD: inicio, victoria, puntaje mostrado. La simulación que cambia cada cuadro —posición, velocidad, objetos activos— vive en `useFrame`, referencias (`useRef`) o módulos mutables. Si llamamos `setState` 60 veces por segundo, React vuelve a renderizar trabajo que Three.js puede actualizar directamente.

## Dinámica sugerida

En cada módulo: leer primero los archivos indicados, usar uno de los prompts como punto de partida, revisar el diff antes de aceptarlo y completar la verificación de éxito. Los prompts son ejemplos; pedir cambios pequeños y específicos produce mejores resultados que solicitar “hacé todo el juego”.
