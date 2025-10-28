type Status = "available" | "busy" | "away" | "offline";

interface StatusIndicatorProps {
  status: Status;
  showLabel?: boolean;
}

const statusConfig = {
  available: { color: "bg-[#7FFF00]", label: "Disponível" },
  busy: { color: "bg-[#FF4444]", label: "Ocupado" },
  away: { color: "bg-[#FFD700]", label: "Ausente" },
  offline: { color: "bg-[#999999]", label: "Offline" }
};

export function StatusIndicator({ status, showLabel = false }: StatusIndicatorProps) {
  const config = statusConfig[status];

  if (showLabel) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full border-2 border-white shadow-status ${config.color}`} />
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
      </div>
    );
  }

  return (
    <span className={`w-3 h-3 rounded-full border-2 border-white shadow-status ${config.color}`} />
  );
}