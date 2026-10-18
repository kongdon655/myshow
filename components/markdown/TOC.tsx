import type { TocItem } from "@/lib/markdown";

export function TOC({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="目录" className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm font-semibold">目录</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              className="block text-sm text-muted transition-colors hover:text-accent"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
