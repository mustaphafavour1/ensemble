export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="4.5" r="2.4" fill="var(--color-agent-500)" />
      <circle cx="4.5" cy="18" r="2.4" fill="currentColor" />
      <circle cx="19.5" cy="18" r="2.4" fill="currentColor" />
      <path
        d="M12 6.6L5.3 16.2M12 6.6l6.7 9.6M6.8 18h10.4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-brand-500 ${className ?? ""}`}>
      <LogoMark className="size-[18px]" />
      <span className="font-mono text-sm font-medium tracking-[0.14em] text-ink-em">
        ENSEMBLE
      </span>
    </div>
  );
}
