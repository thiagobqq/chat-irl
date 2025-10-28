interface XPWindowProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode; 
  className?: string;
}

export function XPWindow({ title, children, icon, className = "" }: XPWindowProps) {
  return (
    <div className={`bg-white/95 rounded-t-lg shadow-xp-window overflow-hidden h-full flex flex-col ${className}`}>
      {/* Title bar */}
      <div className="bg-gradient-to-b from-[#0997FF] to-[#0058B8] px-3 py-2 border-b border-[#003C8C] flex items-center gap-2">
        {icon}
        <span className="text-white font-semibold text-sm">
          {title}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}