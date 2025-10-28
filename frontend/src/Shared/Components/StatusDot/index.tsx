type Status = "available" | "busy" | "away" | "offline";

interface StatusDotProps {
  status: Status;
}

const statusColors = {
  available: "bg-[#7FFF00]",
  busy: "bg-[#FF4444]",
  away: "bg-[#FFD700]",
  offline: "bg-[#999999]",
};

export function StatusDot({ status }: StatusDotProps) {
  return (
    <span className={`
      w-3 h-3 
      rounded-full 
      border-2 border-white 
      shadow-status
      ${statusColors[status]}
    `} />
  );
}