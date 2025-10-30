type Status = "available" | "busy" | "away" | "offline";

interface StatusDotProps {
  status: Status | string;
}

const statusColors = {
  available: "bg-green-500",
  busy: "bg-red-500",
  away: "bg-yellow-500",
  offline: "bg-gray-400",
};

export function StatusDot({ status }: StatusDotProps) {
  // Converte para lowercase e garante fallback
  const normalizedStatus = (status?.toLowerCase() || 'offline') as Status;
  const color = statusColors[normalizedStatus] || statusColors.offline;
  
  
  return (
    <div className={`w-3 h-3 rounded-full ${color} border-2 border-white shadow-sm`} />
  );
}