import { UserPlus, UserMinus, Info } from 'lucide-react';

interface SystemMessageProps {
  type: 'join' | 'leave' | 'info';
  userName: string;
  timestamp?: Date;
}

export function SystemMessage({ type, userName, timestamp }: SystemMessageProps) {
  const icons = {
    join: <UserPlus className="w-3 h-3" />,
    leave: <UserMinus className="w-3 h-3" />,
    info: <Info className="w-3 h-3" />
  };

  const colors = {
    join: 'bg-green-50 text-green-700 border-green-200',
    leave: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const messages = {
    join: `${userName} entrou na conversa`,
    leave: `${userName} saiu da conversa`,
    info: userName
  };

  return (
    <div className="flex justify-center my-2 animate-fadeIn">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border ${colors[type]}`}>
        {icons[type]}
        <span>{messages[type]}</span>
        {timestamp && (
          <span className="opacity-60 ml-1">
            {timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}