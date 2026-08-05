import type { GuideBlock } from "@/lib/guide/buildGuideContent"

const calloutStyles = {
  sky: "border-sky-400/40 bg-sky-500/10 text-sky-50",
  amber: "border-amber-400/40 bg-amber-500/10 text-amber-50",
  violet: "border-violet-400/40 bg-violet-500/10 text-violet-50",
  emerald: "border-emerald-400/40 bg-emerald-500/10 text-emerald-50",
} as const

export function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="space-y-5 text-base leading-relaxed text-slate-200 sm:text-lg">
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={index} className="text-pretty">
              {block.text}
            </p>
          )
        }
        if (block.type === "h3") {
          return (
            <h3
              key={index}
              className="pt-2 text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              {block.text}
            </h3>
          )
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5 marker:text-sky-400">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        }
        if (block.type === "ol") {
          return (
            <ol
              key={index}
              className="list-decimal space-y-2 pl-5 marker:font-bold marker:text-amber-300"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          )
        }
        if (block.type === "code") {
          return (
            <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
              {block.label ? (
                <p className="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {block.label}
                </p>
              ) : null}
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-sky-100">
                <code>{block.text}</code>
              </pre>
            </div>
          )
        }
        if (block.type === "callout") {
          return (
            <aside
              key={index}
              className={`rounded-2xl border px-4 py-4 sm:px-5 ${calloutStyles[block.tone]}`}
            >
              <p className="text-sm font-bold uppercase tracking-wider opacity-90">
                {block.title}
              </p>
              <p className="mt-2 text-pretty opacity-95">{block.text}</p>
            </aside>
          )
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-sky-400/70 pl-4 text-pretty italic text-slate-100"
            >
              “{block.text}”
              {block.cite ? (
                <cite className="mt-2 block text-sm not-italic text-slate-400">
                  — {block.cite}
                </cite>
              ) : null}
            </blockquote>
          )
        }
        return (
          <div
            key={index}
            className="rounded-2xl border border-dashed border-fuchsia-300/40 bg-fuchsia-500/10 px-4 py-4"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-200">
              Prompt para Cursor
            </p>
            <p className="mt-2 font-medium text-fuchsia-50">“{block.text}”</p>
          </div>
        )
      })}
    </div>
  )
}
