export function Progress({ value }: { value: number }) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className="bg-muted h-2 w-full overflow-hidden rounded-full"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
    >
      <div
        className="bg-accent h-full rounded-full transition-all"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
