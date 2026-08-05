export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; label?: string; text: string }
  | { type: "callout"; tone: "sky" | "amber" | "violet" | "emerald"; title: string; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "prompt"; text: string }

export interface GuidePage {
  id: string
  eyebrow: string
  title: string
  subtitle?: string
  blocks: GuideBlock[]
}

/** Guía educativa: cómo se construyó Noe al Espacio (y cómo construir el tuyo). */
export const GUIDE_PAGES: GuidePage[] = [
  {
    id: "portada",
    eyebrow: "Misión educativa",
    title: "Construí tu propio juego",
    subtitle:
      "Una guía para armar un juego 3D en la web con Cursor, inspirada en Noe al Espacio y en la próxima generación de astronautas argentinos.",
    blocks: [
      {
        type: "p",
        text: "Este no es solo un scoreboard. Es una cápsula de aprendizaje: jugás, entendés cómo funciona, y después podés abrir Cursor y construir tu propia misión.",
      },
      {
        type: "callout",
        tone: "sky",
        title: "Dos formas de leer",
        text: "Modo Presentación: una idea por pantalla, como slides. Modo Lectura: todo el recorrido en scroll continuo, estilo Notion. Cambiá cuando quieras.",
      },
      {
        type: "quote",
        text: "El espacio no se llega solo con cohetes: se llega con curiosidad, práctica y gente que se anima a preguntar “¿y si lo hacemos?”.",
        cite: "Espíritu de esta guía",
      },
    ],
  },
  {
    id: "por-que",
    eyebrow: "Por qué existe",
    title: "De Salta al espacio… y al código",
    blocks: [
      {
        type: "p",
        text: "Noe al Espacio es un homenaje jugable a Noel de Castro, ingeniera de Salta seleccionada por Axiom Space. La idea: que chicas y chicos de 12 a 18 años vean que el espacio —y la tecnología— también pueden hablar con acento argentino.",
      },
      {
        type: "ul",
        items: [
          "Entretenimiento: esquivás basura espacial, juntás mates y llegás a la estación.",
          "Pedagogía: detrás hay física simple, sistemas de juego y un stack real de la industria.",
          "Inspiración: si alguien construyó esto con prompts + revisión, vos también podés construir el tuyo.",
        ],
      },
      {
        type: "callout",
        tone: "amber",
        title: "No hace falta ser genio",
        text: "Hace falta curiosidad, paciencia para probar, y la costumbre de pedirle a la IA que te explique el diff antes de aceptar cambios.",
      },
    ],
  },
  {
    id: "jugabilidad",
    eyebrow: "Cómo se juega",
    title: "La misión en una mirada",
    blocks: [
      {
        type: "p",
        text: "Antes de construir, entendé el loop. Si el juego no se siente claro, ningún stack lo salva.",
      },
      {
        type: "ol",
        items: [
          "Despegás con Espacio. El cohete sale de una base verde bajo cielo celeste.",
          "Te movés con ← → o A / D. Esquivás asteroides y oleadas (muros, V, diagonales).",
          "Juntás 🧉 mates y 🥐 medialunas para sumar puntos y armar combo.",
          "Power-ups: 🛡️ Escudo te salva una vez. ⚡ Impulso acelera la basura… y el reloj. 🧲 Imán atrae mates y medialunas.",
          "Near-miss: pasar cerca de un asteroide da puntos y un cartelito “¡Wow! Estuvo cerca”.",
          "Sobrevivís ~3 minutos, aparece la estación 3D, y si llegás: victoria.",
        ],
      },
      {
        type: "callout",
        tone: "emerald",
        title: "Diseño claro = aprendizaje claro",
        text: "Cada sistema del juego (combo, turbulencia, meta de 5 mates) es una “lección” empaquetada. Cuando armes el tuyo, inventá 1 o 2 mecánicas propias y explicá por qué existen.",
      },
    ],
  },
  {
    id: "aprender",
    eyebrow: "Qué vas a aprender",
    title: "Habilidades que te llevás",
    blocks: [
      {
        type: "ul",
        items: [
          "Abrir un proyecto real en Cursor y orientarte en carpetas.",
          "Hablarle a un modelo de IA con prompts chicos y precisos.",
          "Entender la diferencia entre UI (React) y simulación (cada frame).",
          "Publicar en internet con Vercel y compartir el link.",
          "Contar tu misión: no solo “hice un juego”, sino “quise inspirar X”.",
        ],
      },
      {
        type: "p",
        text: "No necesitás memorizar toda la API de Three.js. Necesitás saber qué preguntar, qué probar y qué revisar.",
      },
    ],
  },
  {
    id: "cursor",
    eyebrow: "Herramienta #1",
    title: "Descargá e instalá Cursor",
    blocks: [
      {
        type: "p",
        text: "Cursor es un editor de código con IA integrada. Pensalo como un copiloto que lee tu proyecto, propone cambios y te explica el código… pero vos seguís al mando.",
      },
      {
        type: "ol",
        items: [
          "Entrá a cursor.com y descargá la versión para tu sistema (Mac, Windows o Linux).",
          "Instalálo y abrilo. Creá una cuenta si te lo pide.",
          "File → Open Folder y elegí la carpeta del juego (o creá un proyecto nuevo).",
          "Abrí el Chat / Agent (atajo típico: Cmd+L / Ctrl+L o el ícono de chat).",
          "Activá Composer/Agent cuando quieras que haga cambios en varios archivos; usá Chat para preguntar sin romper nada.",
        ],
      },
      {
        type: "callout",
        tone: "violet",
        title: "Regla de oro con IA",
        text: "Nunca aceptes un cambio que no puedas explicar en una frase. Pedí: “Explicá el diff línea por línea y qué riesgo tiene”.",
      },
      {
        type: "prompt",
        text: "Recorré este proyecto y explicame para qué sirven app/, components/, lib/ y public/ en cinco viñetas, sin modificar archivos.",
      },
    ],
  },
  {
    id: "modelos",
    eyebrow: "Cómo pedirle cosas",
    title: "Modelos, prompts y buen gusto",
    blocks: [
      {
        type: "p",
        text: "En Cursor podés elegir distintos modelos según la tarea. Lo importante no es el nombre de moda: es el contrato que firmás con el prompt.",
      },
      {
        type: "h3",
        text: "Buenas prácticas de prompt",
      },
      {
        type: "ul",
        items: [
          "Contexto: “Estamos en Noe al Espacio, Next.js + R3F, archivo X”.",
          "Objetivo chico: una mecánicá o un bug, no “hacé todo el juego”.",
          "Restricciones: “No toques el HUD” / “Mantené los tests pasando”.",
          "Verificación: “Después corré npm test y contame qué pasó”.",
          "Idioma: pedí explicaciones en español si estás aprendiendo.",
        ],
      },
      {
        type: "h3",
        text: "Ejemplos que funcionan",
      },
      {
        type: "prompt",
        text: "En components/game/Rocket.tsx, hacé la llama del motor más visible al despegar, sin cambiar el hitbox del jugador. Mostrame el diff y cómo lo probaría a mano.",
      },
      {
        type: "prompt",
        text: "Hay un bug: el timer se congela a 0:04. Buscá qué componente desmonta la simulación antes del win y proponer un fix mínimo.",
      },
      {
        type: "callout",
        tone: "amber",
        title: "Modelos",
        text: "Usá un modelo fuerte para diseño/arquitectura y otro más rápido para cambios chicos. Si algo falla dos veces, pedí un plan antes de más código. En este proyecto se iteró mucho con agentes + revisión humana.",
      },
    ],
  },
  {
    id: "stack",
    eyebrow: "Tecnología",
    title: "El stack de Noe al Espacio",
    blocks: [
      {
        type: "ul",
        items: [
          "Next.js (App Router) — páginas, deploy y estructura del sitio.",
          "React + TypeScript — UI, pantallas, tipos que documentan el juego.",
          "React Three Fiber + Drei + Three.js — el mundo 3D (cohete, asteroides, estación).",
          "Vitest — reglas del juego testeables sin abrir el navegador.",
          "Vercel — publicar con un link compartible.",
          "Supabase — base de datos del ranking global (Postgres + API).",
          "Cursor — acelerar lectura, cambios y explicaciones.",
        ],
      },
      {
        type: "callout",
        tone: "sky",
        title: "Por qué este stack",
        text: "Es el mismo tipo de herramientas que se usan en productos reales, pero lo suficientemente amable para un taller de unas pocas horas si avanzás por módulos.",
      },
      {
        type: "code",
        label: "Arrancar en local",
        text: "git clone https://github.com/artugrande/noe-al-espacio.git\ncd noe-al-espacio\nnpm install\nnpm run dev\n# abrí http://localhost:3000",
      },
    ],
  },
  {
    id: "arquitectura",
    eyebrow: "Idea clave",
    title: "React no es el motor del cohete",
    blocks: [
      {
        type: "quote",
        text: "El estado del juego no es el estado de React.",
        cite: "Regla de oro del taller",
      },
      {
        type: "p",
        text: "Si cada frame (60 veces por segundo) hicieras setState, React se ahogaría. Por eso:",
      },
      {
        type: "ul",
        items: [
          "React maneja pantallas y HUD: inicio, victoria, puntaje mostrado, toasts.",
          "La simulación vive en useFrame + refs + módulos (posición, pool de asteroides, reloj de misión).",
          "lib/game/ guarda reglas puras (colisiones, combo, dificultad) que se pueden testear.",
        ],
      },
      {
        type: "prompt",
        text: "Sin cambiar archivos, mostrame el recorrido desde app/page.tsx hasta el useFrame que mueve los asteroides. Señalá qué es React state y qué es simulación.",
      },
    ],
  },
  {
    id: "mapa",
    eyebrow: "Mapa del repo",
    title: "Dónde vive cada pieza",
    blocks: [
      {
        type: "ul",
        items: [
          "app/ — páginas (inicio, /construir), API routes y estilos.",
          "app/api/scores — publica y lee el ranking global.",
          "components/game/ — escena 3D: Rocket, Hazards, SpaceStation, LaunchEnvironment…",
          "components/hud/ — puntaje, tiempo, toasts, controles, formulario del ranking.",
          "lib/game/ — constants, colisiones, combo, formaciones, scores, leaderboard.",
          "supabase/migrations/ — SQL de la tabla leaderboard.",
          "docs/workshop/ — módulos del taller paso a paso (aún más detalle).",
          "public/images/ — assets (logo, ilustración de victoria…).",
        ],
      },
      {
        type: "p",
        text: "Cuando Cursor te proponga un cambio, pedile que nombre la carpeta correcta. Si mezcla HUD con física 3D, algo huele mal.",
      },
    ],
  },
  {
    id: "paso-base",
    eyebrow: "Construcción · 1",
    title: "Base: escena y despegue",
    blocks: [
      {
        type: "ol",
        items: [
          "Creá un Canvas de R3F con cámara y luces.",
          "Pintá un suelo / cielo (en Noe: base verde + cielo celeste que vira a espacio).",
          "Poné un cohete low-poly (cono + cilindro + aletas).",
          "Con Espacio, marcá launched=true y recién ahí dejá mover / spawnear peligros.",
        ],
      },
      {
        type: "prompt",
        text: "Creá una escena R3F mínima con un cohete blanco low-poly centrado y un tip “Presioná Espacio para despegar”. No agregues asteroides todavía.",
      },
      {
        type: "callout",
        tone: "emerald",
        title: "Verificación",
        text: "Si se ve el cohete y el tip, celebrá. Los juegos grandes son muchas victorias chicas.",
      },
    ],
  },
  {
    id: "paso-movimiento",
    eyebrow: "Construcción · 2",
    title: "Movimiento y sensación",
    blocks: [
      {
        type: "p",
        text: "El cohete se mueve en X. Un poco de inclinación (rotation.z) hace que se sienta vivo. La llama del motor aparece al despegar.",
      },
      {
        type: "ul",
        items: [
          "Input por teclado (y botones táctiles en mobile).",
          "clamp a los bordes del carril (PLAY_X_MIN / MAX).",
          "Turbulencia: a veces el eje se “bambolea” solo — eso es diseño de desafío.",
        ],
      },
      {
        type: "prompt",
        text: "Agregá movimiento horizontal con A/D y flechas. Inclíná el cohete según la dirección. No cambies la cámara todavía.",
      },
    ],
  },
  {
    id: "paso-hazards",
    eyebrow: "Construcción · 3",
    title: "Basura espacial y colisiones",
    blocks: [
      {
        type: "p",
        text: "Los asteroides se spawnean arriba y bajan. Usamos un pool (reutilizar objetos) para no crear/destruir meshes todo el tiempo.",
      },
      {
        type: "ul",
        items: [
          "Colisión 2D en el carril (ignoramos Z para que la perspectiva no “mienta”).",
          "Variantes: normal, pesada, splitter (el escudo la parte en dos).",
          "Formaciones: muro con hueco, V, diagonal — patrones legibles.",
          "Near-miss: si pasa cerca sin tocar, sumás puntos + toast.",
        ],
      },
      {
        type: "prompt",
        text: "Implementá un pool de 32 asteroides que caen con velocidad creciente. Si chocan al jugador sin escudo: game over. Explicá cómo testeás la colisión.",
      },
    ],
  },
  {
    id: "paso-sistemas",
    eyebrow: "Construcción · 4",
    title: "Puntaje, poderíos y meta",
    blocks: [
      {
        type: "ul",
        items: [
          "HUD: puntaje, tiempo, escudo, impulso, imán, meta de mates.",
          "Combo: pickups / near-miss seguidos multiplican el score.",
          "Impulso: acelera peligros y el reloj. Imán 🧲: atrae mates y medialunas cercanos.",
          "Escudo: una vida extra con feedback visual en el cohete.",
          "Objetivo secundario: 5 mates → bonus + logro.",
        ],
      },
      {
        type: "callout",
        tone: "amber",
        title: "Diseño de juego = historia",
        text: "El mate no es un orbe azul genérico: es cultura. Cuando armes tu juego, elegí coleccionables que digan algo de tu lugar.",
      },
    ],
  },
  {
    id: "paso-estacion",
    eyebrow: "Construcción · 5",
    title: "La estación y el final",
    blocks: [
      {
        type: "p",
        text: "Al final la basura se limpia, aparece una estación low-poly (hub, módulos, paneles solares) y el reloj llega a cero → victoria con mensaje “¡Llegaste a la estación!”.",
      },
      {
        type: "ul",
        items: [
          "Fade de atmósfera: cielo celeste → espacio profundo + estrellas.",
          "Últimos 4s: dejar de spawnear y barrer peligros (sin desmontar el reloj).",
          "Pantalla de victoria sobre la escena 3D unos segundos — para gozar el momento.",
        ],
      },
      {
        type: "prompt",
        text: "Reemplazá un sprite 2D de estación por un modelo low-poly 3D con paneles solares. Que gire lento y haga fade-in en los últimos 25 segundos.",
      },
    ],
  },
  {
    id: "deploy",
    eyebrow: "Salir al mundo",
    title: "Publicar en Vercel",
    blocks: [
      {
        type: "ol",
        items: [
          "Subí el repo a GitHub (si todavía no está).",
          "Entrá a vercel.com, conectá el repo y dale Deploy.",
          "Cada push a main puede republicar solo.",
          "Compartí el link: eso convierte un taller en una misión pública.",
        ],
      },
      {
        type: "code",
        label: "Checks antes de publicar",
        text: "npm test\nnpm run build",
      },
      {
        type: "p",
        text: "Este juego vive en noe-al-espacio.vercel.app — tu versión puede vivir en tu-nombre.vercel.app.",
      },
    ],
  },
  {
    id: "supabase",
    eyebrow: "Datos en la nube",
    title: "Supabase y el ranking global",
    subtitle:
      "localStorage guarda el score en tu navegador. Supabase lo guarda para todo el mundo.",
    blocks: [
      {
        type: "p",
        text: "Cuando terminás una misión, podés escribir tu nombre y publicarlo. Ese puntaje viaja a una base Postgres en Supabase y aparece en el top 10 de la home — no solo en tu celular o compu.",
      },
      {
        type: "ol",
        items: [
          "El navegador llama a /api/scores (una API Route de Next.js).",
          "El servidor valida nombre y puntaje (nada de nombres raros ni scores imposibles).",
          "Supabase guarda la fila en la tabla leaderboard.",
          "La home pide el ranking ordenado por score y lo muestra a todos.",
        ],
      },
      {
        type: "ul",
        items: [
          "Tabla: leaderboard (id, name, score, created_at).",
          "Clientes: utils/supabase/ (browser, server y middleware).",
          "SQL del proyecto: supabase/migrations/001_leaderboard.sql.",
          "Keepalive: un cron diario en Vercel pingeá la API para que el free tier de Supabase no se pause si nadie juega un rato.",
        ],
      },
      {
        type: "callout",
        tone: "violet",
        title: "Por qué Supabase (y no solo localStorage)",
        text: "localStorage es genial para prototipar: cero setup. Pero cada dispositivo tiene su propia lista. Con Supabase el ranking es compartido, gratis en el plan free, y te enseña el patrón real: front → API → base de datos.",
      },
      {
        type: "code",
        label: "Idea del flujo",
        text: "Juego termina\n  → POST /api/scores { name, score }\n  → Supabase.insert(leaderboard)\n  → GET /api/scores → top 10 global",
      },
      {
        type: "prompt",
        text: "Explicame como a un taller de 15 años: qué diferencia hay entre guardar el puntaje en localStorage y guardarlo en Supabase. Mostrame qué archivo hace el insert y qué SQL crea la tabla.",
      },
    ],
  },
  {
    id: "taller",
    eyebrow: "Para docentes y clubs",
    title: "Cómo usarlo en un taller",
    blocks: [
      {
        type: "p",
        text: "En docs/workshop/ hay ocho módulos pensados para 12–18 años. Dinámica sugerida:",
      },
      {
        type: "ol",
        items: [
          "Leer el objetivo del módulo (5 min).",
          "Abrir los archivos indicados y preguntarle a Cursor qué hacen (10 min).",
          "Correr 1–2 prompts chicos, revisar el diff, probar (20–30 min).",
          "Cierre: cada grupo muestra una cosa que aprendió o rompió y arregló.",
        ],
      },
      {
        type: "callout",
        tone: "sky",
        title: "Inclusión",
        text: "Celebrá preguntas “tontas”: suelen ser las que abren el camino. El objetivo no es velocidad tipográfica; es confianza para experimentar.",
      },
    ],
  },
  {
    id: "tu-version",
    eyebrow: "Tu misión",
    title: "Ideas para tu propio Noe al Espacio",
    blocks: [
      {
        type: "ul",
        items: [
          "Cambiá la estética: desierto salteño, glaciares, noche porteña.",
          "Nuevos power-ups: cámara lenta, faro que revela formaciones (el 🧲 imán ya está en el juego).",
          "Modo historia: mensajes de Noe / de una IA de a bordo entre fases.",
          "Multijugador local: dos cohetes, una sola basura espacial.",
          "Datos reales: una curiosidad BCRA/NASA/CONAE por cada logro.",
        ],
      },
      {
        type: "prompt",
        text: "Proponé tres mecánicas nuevas alineadas a un tema argentino que yo elija. Para cada una: loop de 10 segundos, feedback visual, y un prompt listo para implementar.",
      },
    ],
  },
  {
    id: "astronautas",
    eyebrow: "Más allá del código",
    title: "Despertar astronautas",
    blocks: [
      {
        type: "p",
        text: "Un juego puede ser la puerta de entrada a física orbital, ingeniería, diseño, narrativa o simplemente a la pregunta: “¿qué pasa si…?”. Eso ya es pensamiento científico.",
      },
      {
        type: "ul",
        items: [
          "Jugá y después abrí el código de una sola cosa que te gustó.",
          "Escribí tu propio dato curioso y metelo en el home.",
          "Contale a alguien más chico cómo se mueve el cohete — si lo podés enseñar, lo entendiste.",
          "Seguí a proyectos espaciales argentinos y regionales; el juego es un guiño, la realidad es más grande.",
        ],
      },
      {
        type: "quote",
        text: "No hace falta nacer en un centro espacial. Hace falta una pantalla, una pregunta y alguien que te diga: dale, probá.",
      },
    ],
  },
  {
    id: "cta",
    eyebrow: "Despegue final",
    title: "Construí tu propio juego de Noe al Espacio",
    subtitle: "Abrí Cursor. Cloná el repo. Cambiá una cosa hoy. Publicá mañana.",
    blocks: [
      {
        type: "ol",
        items: [
          "Descargá Cursor e instalalo.",
          "Cloná https://github.com/artugrande/noe-al-espacio",
          "Corré npm install && npm run dev",
          "Pedile a Cursor el primer prompt de esta guía.",
          "Cuando tengas tu twist, deployá en Vercel y compartí el link con la etiqueta #NoeAlEspacio",
        ],
      },
      {
        type: "callout",
        tone: "amber",
        title: "Tu checklist de misión",
        text: "1 mecánica tuya · 1 asset con identidad local · 1 deploy público · (opcional) 1 ranking con Supabase · 1 persona a la que le enseñaste cómo se juega.",
      },
      {
        type: "p",
        text: "Hecho en Salta con ❤️ por @artugrande · impulsado por Desafía. El cielo no es el límite: es el nivel 1.",
      },
    ],
  },
]

export const GUIDE_PAGE_COUNT = GUIDE_PAGES.length
