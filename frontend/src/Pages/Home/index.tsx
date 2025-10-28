import Layout from "../../Shared/Components/LayoutBase";
import { XPWindow, StatusDot } from "../../Shared/Components";

export function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <XPWindow title="Minhas Conversas">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Lista de Conversas
          </h2>
          
          <div className="space-y-3">
            {[
              { id: 1, name: "Maria Silva", status: "available" as const, time: "14:30" },
              { id: 2, name: "João Pedro", status: "busy" as const, time: "13:15" },
              { id: 3, name: "Ana Costa", status: "away" as const, time: "12:00" },
            ].map((chat) => (
              <div 
                key={chat.id}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {chat.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Última mensagem...
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">{chat.time}</span>
                  <StatusDot status={chat.status} />
                </div>
              </div>
            ))}
          </div>
        </XPWindow>
      </div>
    </Layout>
  );
}