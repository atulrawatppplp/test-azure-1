# Mini Order Management System

Production-style order management system: React + TypeScript + Tailwind frontend, .NET 8 microservices behind a YARP API gateway, Azure SQL / Service Bus ready.

```
React (Vite)  ->  ApiGateway (YARP)  ->  ProductService      -> Azure SQL
                                     ->  OrderService        -> Azure SQL
                                                             -> Azure Service Bus
                                     ->  NotificationService <- Service Bus subscription
```

## Layout

```
frontend/                    React 19 + TypeScript + Tailwind 4 (Vite)
backend/MiniOrderManagement.sln
  src/ApiGateway/            YARP reverse proxy + CORS (http 5000 / https 7000)
  src/ProductService/        /api/products      (http 5166)
  src/OrderService/          /api/orders        (http 5167)
  src/NotificationService/   /api/notifications (http 5168)
database/schema.sql          Products, Orders, OrderItems
database/seed.sql            Sample catalogue rows
```

## Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Demo login: `admin@minioms.com` / `Password@123`.

Mock data is on by default. To run against the .NET gateway, copy `.env.example` to `.env` and set:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://localhost:7000
```

Every page talks only to `src/services/*` (`authService`, `productService`, `orderService`, `notificationService`); each service picks mock storage or `apiClient` HTTP based on that flag, so switching to the real backend needs no page changes.

Pages: Login, Dashboard, Products, Product Details, Cart, Orders, Order Details, Notifications, Profile.
Reusable components: `DataTable`, `Modal`, `Form`, `Button`, `Input`, `Select`, `Badge`, `Card`, `Pagination`, `Toast`, `Loading`, `EmptyState`, `ErrorState`.

## Backend

```bash
cd backend
dotnet build MiniOrderManagement.sln
dotnet run --project src/ProductService
dotnet run --project src/OrderService
dotnet run --project src/NotificationService
dotnet run --project src/ApiGateway
```

Each service falls back to EF Core InMemory (with seed data) when its connection string is empty, so the whole stack runs locally without Azure. Set `ConnectionStrings:ProductsDb` / `ConnectionStrings:OrdersDb` to use Azure SQL, and `ServiceBus:ConnectionString` to publish/consume real `order-events` messages — without it the Order Service logs events and the Notification Service serves its in-memory store.

### Endpoints (through the gateway)

| Service | Endpoints |
| --- | --- |
| Product | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/{id}`, `GET /api/products/categories` |
| Order | `GET/POST /api/orders`, `GET/PUT /api/orders/{id}`, `POST /api/orders/{id}/cancel`, `GET /api/orders/stats` |
| Notification | `GET /api/notifications`, `POST /api/notifications/{id}/read`, `POST /api/notifications/read-all` |

## Azure targets (not yet wired)

Key Vault for secrets, Application Insights for logs, Entra ID on the gateway, Blob Storage for documents, Azure Functions for notification fan-out, Azure DevOps for CI/CD.
