# Módulo 7 — Publicar y compartir

## Objetivo

Crear una versión pública en Vercel, probarla y compartir un enlace jugable.

## Antes de publicar

Guardá todos los archivos y verificá el proyecto local:

```bash
npm test
npm run build
```

Los tests comprueban reglas puras; el build detecta problemas de TypeScript, imports y páginas. Después jugá una partida corta en computadora y en una ventana angosta.

## Opción A: desde Git

1. Subí el repositorio a GitHub.
2. Entrá en [vercel.com/new](https://vercel.com/new) e importalo.
3. Confirmá que Vercel detecte **Next.js**.
4. Iniciá el deploy y esperá el estado **Ready**.

Los siguientes commits a la rama configurada generarán nuevos despliegues.

## Opción B: con la CLI

Con una cuenta de Vercel iniciada:

```bash
npx vercel
```

Respondé las preguntas para vincular o crear el proyecto. Para publicar la versión final:

```bash
npx vercel --prod
```

No pegues tokens ni secretos en el chat de Cursor, archivos versionados o capturas.

## Prompts para Cursor

- “Revisá este proyecto para desplegar en Vercel. No publiques: listá posibles bloqueos y comandos de verificación.”
- “Explicame el error de `npm run build` y proponé el cambio mínimo. No ignores errores.”
- “Creá una lista de smoke tests para la URL pública: inicio, controles, colisiones, audio, móvil y victoria.”

## Archivos para inspeccionar

- `package.json`
- `next.config.mjs`
- `app/layout.tsx`
- `.gitignore`

## Pausa: explicá el diff

Antes de aceptar una corrección de despliegue, pedí: “Explicá la causa raíz y por qué este diff la resuelve”. No aceptes desactivar TypeScript, ESLint o pruebas solo para obtener un build verde.

## Verificación de éxito

- `npm test` y `npm run build` terminan correctamente.
- La URL pública abre sin depender de `localhost`.
- Otra persona puede iniciar, despegar, moverse y terminar una partida.
- El enlace se comparte junto con una frase breve sobre lo construido.
