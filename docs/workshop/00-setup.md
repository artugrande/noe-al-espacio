# Módulo 0 — Preparar el proyecto

## Objetivo

Tener el juego corriendo en la computadora, abrirlo desde Cursor y reconocer dónde vive cada parte.

## Paso a paso

1. Abrí una terminal y cloná el repositorio:

   ```bash
   git clone <URL-DEL-REPOSITORIO>
   cd noe-al-espacio
   ```

2. Abrí esa carpeta en Cursor: **File → Open Folder**.
3. En la terminal integrada instalá las dependencias y arrancá el servidor:

   ```bash
   npm install
   npm run dev
   ```

4. Abrí `http://localhost:3000`. Dejá el servidor activo durante el taller.

## Mapa rápido de carpetas

- `app/`: páginas y estilos globales de Next.js.
- `components/game/`: escena 3D y simulación.
- `components/hud/`: interfaz 2D sobre el juego.
- `lib/game/`: reglas y funciones que se pueden probar sin navegador.
- `public/`: modelos, audio e imágenes.
- `docs/workshop/`: estos módulos.

## Prompts para Cursor

- “Recorré este proyecto y explicame para qué sirven `app`, `components`, `lib` y `public` en cinco viñetas.”
- “Leé `package.json`. ¿Qué hace cada script y cuáles necesito hoy para desarrollar?”
- “Sin cambiar archivos, mostrame el recorrido desde `app/page.tsx` hasta la escena 3D.”

## Archivos para inspeccionar

- `package.json`
- `app/page.tsx`
- `components/game/GameSession.tsx`
- `lib/game/constants.ts`

## Pausa: explicá el diff

Todavía no hace falta modificar código. Si Cursor propone instalar o editar algo, pedile: “Explicá el diff línea por línea y decime por qué es necesario”. No aceptes cambios que no puedas resumir con tus palabras.

## Verificación de éxito

- `npm run dev` termina sin errores.
- La página principal abre en `localhost:3000`.
- Cada participante puede señalar dónde buscar una pantalla, una pieza 3D y una regla del juego.
