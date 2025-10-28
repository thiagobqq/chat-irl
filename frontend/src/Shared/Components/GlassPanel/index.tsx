interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div className={`
      bg-white/85 backdrop-blur-md
      border border-white/50
      rounded-xl
      shadow-glass
      p-6
      ${className}
    `}>
      {children}
    </div>
  );
}