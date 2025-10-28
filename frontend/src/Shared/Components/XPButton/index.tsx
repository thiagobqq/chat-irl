interface XPButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function XPButton({ children, onClick, className = "" }: XPButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2
        px-4 py-1.5
        bg-gradient-to-b from-white to-[#D0E8FF]
        border border-[#003C8C]
        rounded
        text-[#003C8C] font-semibold text-[11px]
        shadow-xp-button
        hover:from-white hover:to-[#B8DAFF] hover:shadow-xp-button-hover
        active:from-[#B8DAFF] active:to-white active:shadow-xp-button-active
        transition-all duration-150
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </button>
  );
}