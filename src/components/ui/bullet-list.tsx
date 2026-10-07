const markers = {
  dot: <span aria-hidden className="size-1 shrink-0 rounded-full bg-brand" />,
  bullet: <span aria-hidden>•</span>,
  arrow: (
    <span aria-hidden className="absolute left-0 text-brand">
      →
    </span>
  ),
};

export function BulletList({
  items,
  marker = "dot",
  className = "",
  itemClassName = "",
}: {
  items: React.ReactNode[];
  marker?: keyof typeof markers;
  className?: string;
  itemClassName?: string;
}) {
  const layout = { arrow: "relative pl-6", bullet: "flex gap-1", dot: "flex items-center gap-2" }[marker];
  return (
    <ul className={`flex flex-col ${className}`}>
      {items.map((item, i) => (
        <li key={i} className={`${layout} ${itemClassName}`}>
          {markers[marker]}
          {item}
        </li>
      ))}
    </ul>
  );
}
