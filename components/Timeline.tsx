import type { TimelineItem } from "@/content/data/timeline";

function label(item: TimelineItem): string {
  const end = item.end ?? "至今";
  return `${item.start} — ${end}`;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-8 border-l border-line pl-6">
      {items.map((item) => (
        <li key={`${item.type}-${item.org}-${item.title}`} className="relative">
          <span
            className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background"
            aria-hidden="true"
          />
          <p className="text-sm text-muted">{label(item)}</p>
          <h3 className="mt-1 font-semibold">
            {item.title}
            <span className="font-normal text-muted"> · {item.org}</span>
          </h3>
          <p className="mt-1 text-sm text-muted">{item.description}</p>
        </li>
      ))}
    </ol>
  );
}
