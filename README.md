# Chat IRL

Aplicação **fullstack** para chat em tempo real, utilizando **SignalR** para comunicação WebSocket.


## Arquitetura

O projeto é dividido em duas partes principais:

```
├── backend/             # API .NET com SignalR
│   └── src/
│       ├── Core/        # Interfaces e Models
│       ├── Impl/        # DTOs e Services
│       ├── infra/       # Repositórios e DbContext
│       └── Web/         # Controllers e Hubs
└── frontend/            # Aplicação React
    └── src/
        ├── Pages/       # Páginas da aplicação
        ├── Routes/      # Configuração de rotas
        └── Shared/      # Componentes e contextos
```

## Tecnologias

### Backend
- .NET 9
- Entity Framework Core
- SignalR (WebSocket)

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS

### Infraestrutura
- Docker & Docker Compose
- Nginx

## Como Executar

### Com Docker (recomendado)

```bash
docker-compose up --build
```

### Manualmente

1. **Backend**
```bash
cd backend/src
dotnet run
```

2. **Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades

- Autenticação de usuários
- Chat privado em tempo real
- Chat em grupo
- Indicador de digitação
- Status online/offline
