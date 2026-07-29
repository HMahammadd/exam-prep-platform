type UnreadBadgeProps = {
  count: number;
  className?: string;
};

export function UnreadBadge({ count, className = "" }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white ${className}`}
      aria-label={`${count} unread`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
