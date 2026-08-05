# 🚀 Noe al Espacio

Juego 3D en la web inspirado en **Noel de Castro**, ingeniera de Salta y astronauta argentina.  
Esquivás basura espacial, juntás mates, usás escudo, impulso e imán… y llegás a la estación.

**Jugá online:** [noe-al-espacio.vercel.app](https://noe-al-espacio.vercel.app)

Este repo también es material de taller: podés clonarlo, abrirlo en **Cursor** y aprender a construir tu propia misión.

---

## Para quién es

- Chicas y chicos de **~12 a 18 años**
- Docentes, clubs de código y talleres con Cursor
- Cualquiera que quiera remixear el juego y publicarlo

No hace falta ser “experto”. Sí hace falta curiosidad y ganas de probar.

---

## Arrancar en 5 minutos

### 1. Lo que necesitás

- [Cursor](https://cursor.com) (o VS Code)
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- Una cuenta de [GitHub](https://github.com) (gratis)

### 2. Clonar el repo

```bash
git clone https://github.com/artugrande/noe-al-espacio.git
cd noe-al-espacio
```

### 3. Instalar y correr

```bash
npm install
npm run dev
```

Abrí **http://localhost:3000** en el navegador.

### 4. Ranking global (opcional, Upstash Redis)

Sin Redis el juego funciona igual, pero el leaderboard queda solo en ese dispositivo.

1. Creá una base **Upstash Redis** (gratis) en [console.upstash.com](https://console.upstash.com) o desde Vercel → Storage.
2. Copiá `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` a `.env.local` (ver `.env.example`).
3. En Vercel: Project → Settings → Environment Variables → las mismas dos vars → Redeploy.

Al terminar una partida podés escribir tu nombre y publicar el puntaje en el ranking global.

### 5. Abrirlo en Cursor

`File → Open Folder` → elegí la carpeta `noe-al-espacio`.

---

## Cómo se juega (resumen)

1. **Espacio** para despegar  
2. **← →** o **A / D** para moverte  
3. Esquivá asteroides y oleadas  
4. Juntá 🧉 mates y 🥐 medialunas (combo = más puntos)  
5. **🛡️ Escudo** te salva una vez · **⚡ Impulso** acelera todo (¡y el reloj!) · **🧲 Imán** atrae mates y medialunas  
6. Pasá cerca de un asteroide sin tocarlo → near-miss + cartelito  
7. Llegá a la estación espacial → ¡ganaste!

---

## Aprender a construirlo

### Guía interactiva en la web

En el juego: **Construí tu propio juego**  
o entrá directo a: [noe-al-espacio.vercel.app/construir](https://noe-al-espacio.vercel.app/construir)

Ahí hay modo **Presentación** (slides) y modo **Lectura** (scroll).

### Taller paso a paso (archivos del repo)

Carpeta [`docs/workshop/`](./docs/workshop/README.md):

0. Setup  
1. Primera escena 3D  
2. Mover el cohete  
3. Obstáculos y colisiones  
4. Puntaje y HUD  
5. Timer y victoria  
6. Extras (escudo, dificultad, logros)  
7. Deploy en Vercel  

Cada módulo tiene objetivo, prompts para Cursor y una verificación de éxito.

---

## Mapa rápido del proyecto

```
app/                 → páginas (inicio, /construir)
components/game/     → mundo 3D (cohete, asteroides, estación)
components/hud/      → puntaje, tiempo, toasts
lib/game/            → reglas (colisiones, combo, dificultad)
docs/workshop/       → taller para aprender
public/images/       → logo y assets
```

### Regla de oro

> **El estado del juego no es el estado de React.**

React maneja pantallas y HUD.  
La simulación (cada frame) vive en `useFrame` + refs.  
Si no entendés un cambio que propone la IA, pedile que te lo explique antes de aceptarlo.

---

## Prompts para empezar en Cursor

Copiá y pegá en el chat:

```
Recorré este proyecto y explicame para qué sirven app/, components/, lib/ y public/ en cinco viñetas, sin modificar archivos.
```

```
En components/game/Rocket.tsx, explicame cómo se mueve el cohete. No cambies código todavía.
```

```
Quiero cambiar el color del cielo al despegar. ¿En qué archivo se controla y qué prompt me sugerís para hacerlo seguro?
```

Tip: pedí **cambios chicos**. “Hacé todo el juego” suele salir mal. “Hacé solo la llama más visible” suele salir bien.

---

## Scripts útiles

| Comando | Qué hace |
|--------|----------|
| `npm run dev` | Corre el juego en local |
| `npm test` | Corre tests de las reglas del juego |
| `npm run build` | Prepara la versión para publicar |

---

## Publicar tu versión

1. Forkeá o cloná este repo  
2. Cambiá algo tuyo (colores, power-up, historia…)  
3. Subilo a tu GitHub  
4. Conectalo a [Vercel](https://vercel.com) y dale Deploy  
5. Compartí el link 🚀

---

## Créditos e inspiración

- Hecho en **Salta** por [@artugrande](https://x.com/ArtuGrande) · [GitHub](https://github.com/artugrande/noe-al-espacio)  
- Impulsado por [Desafía](https://www.desafia.tech)  
- Inspirado en la trayectoria de **Noel de Castro** y en la próxima generación de astronautas argentinos

El cielo no es el límite: es el nivel 1.

---

## Licencia / uso en talleres

Podés clonar, modificar y usar este proyecto en talleres educativos.  
Si lo remixás, contanos: está bueno ver otras misiones volando.
