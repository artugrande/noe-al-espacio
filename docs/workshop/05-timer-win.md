# Módulo 5 — Temporizador y victoria

## Objetivo

Cerrar el ciclo del juego: sobrevivir durante la misión, llegar a la ISS y ver la pantalla de victoria.

## Flujo de tiempo

`GAME_DURATION_MS` define la duración total: `180_000` ms, es decir, tres minutos. Mientras la partida está activa, `Hazards` suma `dt * 1000` a un contador mutable. El HUD resta ese tiempo del total y lo presenta como `mm:ss`.

Cuando el contador alcanza la duración:

1. Se fija `gameTimeMs` en el máximo.
2. El snapshot cambia de `playing` a `win`.
3. Se calculan logros y suena el efecto de victoria.
4. `app/page.tsx` desmonta la partida y muestra `EndScreen`.

La ISS se dibuja al fondo en `Scene.tsx`: es la meta visual de la misión.

## Actividad

Para probar sin esperar tres minutos, cambiá **temporalmente** `GAME_DURATION_MS` a `5_000`. Ganá una partida, comprobá la pantalla final y restaurá `180_000` antes de terminar.

## Prompts para Cursor

- “Explicá desde dónde sale el tiempo, cómo llega al HUD y qué condición produce `screen: 'win'`.”
- “Prepará un cambio temporal para probar la victoria en cinco segundos. Recordame qué valor debo restaurar.”
- “Revisá si el temporizador continúa cuando la partida está pausada o todavía no despegó. Citá la condición exacta.”

## Archivos para inspeccionar

- `lib/game/constants.ts`
- `components/game/Hazards.tsx`
- `components/hud/Hud.tsx`
- `components/game/Scene.tsx`
- `app/page.tsx`

## Pausa: explicá el diff

Pedí: “Explicá todas las unidades de tiempo del diff: segundos, milisegundos y `dt`”. Buscá conversiones explícitas y una única fuente para la duración. No dejes el valor corto de prueba en el cambio final.

## Verificación de éxito

- El HUD cuenta hacia cero solo después del despegue.
- Con duración corta aparece “¡Llegaste a la estación!”.
- Volver a jugar reinicia puntaje y tiempo.
- `GAME_DURATION_MS` queda restaurado en `180_000`.
