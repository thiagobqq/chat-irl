import {StatusIndicator} from "../StatusIndicator";

interface Contact {
  id: string;
  name: string;
  email: string;
  status: "Available" | "Busy" | "Away" | "Offline";
  lastMessage?: string;
  avatar?: string;
}

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export function ContactList({ contacts, selectedContact, onSelectContact }: ContactListProps) {
  const statusToLowercase = (status: string) => {
    return status.toLowerCase() as "available" | "busy" | "away" | "offline";
  };

  return (
    <div className="bg-white/95 rounded-t-lg shadow-xp-window overflow-hidden h-full flex flex-col">
      {/* Title bar */}
      <div className="bg-gradient-to-b from-[#0997FF] to-[#0058B8] px-3 py-2 border-b border-[#003C8C]">
        <span className="text-white font-semibold text-sm">
          Contatos ({contacts.length})
        </span>
      </div>
      
      {/* Lista de contatos */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {contacts.map((contact) => {
          console.log('Contact status:', contact.status); // Debug
          
          return (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg
                transition-all duration-150
                ${selectedContact?.id === contact.id
                  ? 'bg-blue-100 border-2 border-blue-400 shadow-md'
                  : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:shadow-sm'
                }
              `}
            >
              {/* Avatar com status */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                {/* Indicador de status */}
                <div className="absolute -bottom-0 -right-0 bg-white rounded-full p-0.5">
                  <StatusIndicator status={statusToLowercase(contact.status)} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">
                  {contact.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {contact.lastMessage || contact.email}
                </p>
              </div>

              {/* Status text (opcional) */}
              <div className="flex-shrink-0">
                <StatusIndicator status={statusToLowercase(contact.status)} showLabel={false} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}