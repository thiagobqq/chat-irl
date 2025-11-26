type Status = "available" | "busy" | "away" | "offline";

interface StatusIndicatorProps {
  status: Status | string;
  showLabel?: boolean;
}

const statusConfig = {
  available: { color: "bg-green-500", label: "Disponível" },
  busy: { color: "bg-red-500", label: "Ocupado" },
  away: { color: "bg-yellow-500", label: "Ausente" },
  offline: { color: "bg-gray-400", label: "Offline" }
};

export function StatusIndicator({ status, showLabel = false }: StatusIndicatorProps) {
  
  const normalizedStatus = (status?.toLowerCase() || 'offline') as Status;
  const config = statusConfig[normalizedStatus] || statusConfig.offline;


  if (showLabel) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${config.color} border-2 border-white shadow-sm`} />
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`w-3 h-3 rounded-full ${config.color} border-2 border-white shadow-sm`} />
  );
}