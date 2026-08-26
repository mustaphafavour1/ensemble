import type { LucideIcon } from "lucide-react";
import { Centered } from "@/components/centered";

export function SectionPreview({
  icon: Icon,
  title,
  description,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
}) {
  return (
    <Centered>
      <div className="w-full max-w-md rounded-lg border border-dashed border-border bg-surface/40 px-8 py-10 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-border bg-surface text-brand-500">
          <Icon className="size-4.5" strokeWidth={1.75} />
        </div>
        <span className="mt-4 inline-block rounded-full border border-border px-2 py-0.5 text-[9px] font-medium tracking-[0.1em] text-ink-faint uppercase">
          Section preview
        </span>
        <h2 className="mt-3 font-heading text-lg text-ink-em">{title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          {description}
        </p>
        {bullets && bullets.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1.5 text-left">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-2xs text-ink-faint"
              >
                <span className="mt-1 size-1 shrink-0 rounded-full bg-ink-faint" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Centered>
  );
}
