# RESq Architecture Documentation

## Overview

RESq follows **Clean Architecture** (also known as Hexagonal Architecture) principles, ensuring separation of concerns, testability, and scalability.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (API Routes, Pages, Components, Middleware)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  (Use Cases, Application Services)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                          │
│  (Entities, Value Objects, Domain Services)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                     │
│  (Repositories, Database, External Services)            │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── domain/                    # Domain Layer (Business Logic)
│   ├── entities/             # Domain entities
│   │   ├── queue-entry.ts
│   │   └── restaurant.ts
│   └── services/             # Domain services
│       └── wait-time-calculator.ts
│
├── application/              # Application Layer (Use Cases)
│   └── use-cases/
│       ├── create-queue-entry.use-case.ts
│       ├── call-next-customer.use-case.ts
│       ├── update-entry-status.use-case.ts
│       └── get-queue-position.use-case.ts
│
├── infrastructure/           # Infrastructure Layer
│   ├── repositories/         # Repository interfaces
│   │   ├── queue-entry.repository.ts
│   │   ├── restaurant.repository.ts
│   │   └── token-sequence.repository.ts
│   ├── repositories/prisma/  # Prisma implementations
│   │   ├── queue-entry.repository.ts
│   │   ├── restaurant.repository.ts
│   │   └── token-sequence.repository.ts
│   └── di/                   # Dependency Injection
│       └── container.ts
│
├── presentation/             # Presentation Layer
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error-handler.ts
│   └── api/                  # API routes (Next.js)
│
├── shared/                   # Shared Layer
│   ├── types/
│   │   ├── api.ts
│   │   └── result.ts
│   ├── constants/
│   │   └── index.ts
│   └── validation/
│       └── schemas.ts
│
└── lib/                      # Legacy utilities (to be migrated)
    ├── prisma.ts
    ├── auth.ts
    ├── logger.ts
    ├── rate-limit.ts
    └── notifications.ts
```

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)

**Purpose:** Core business logic, independent of frameworks and infrastructure.

**Contains:**
- **Entities**: Business objects with behavior (e.g., `QueueEntry`, `Restaurant`)
- **Domain Services**: Pure business logic (e.g., `WaitTimeCalculator`)
- **Value Objects**: Immutable domain concepts

**Rules:**
- ✅ No dependencies on other layers
- ✅ Pure business logic only
- ✅ No framework-specific code
- ✅ No database access

**Example:**
```typescript
// Domain Entity
export class QueueEntry {
  canTransitionTo(newStatus: QueueEntryStatus): boolean {
    // Business rule: validate status transitions
  }
}
```

### 2. Application Layer (`src/application/`)

**Purpose:** Orchestrates domain objects to fulfill use cases.

**Contains:**
- **Use Cases**: Application-specific business logic
- **Application Services**: Coordinate multiple domain objects

**Rules:**
- ✅ Depends only on Domain layer
- ✅ Orchestrates domain objects
- ✅ No direct database access (uses repositories)
- ✅ Transaction boundaries

**Example:**
```typescript
// Use Case
export class CreateQueueEntryUseCase {
  async execute(restaurantId: string, input: QueueEntryInput) {
    // 1. Validate input
    // 2. Get restaurant
    // 3. Generate token
    // 4. Create entry
    // All in transaction
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose:** Implements technical details (database, external services).

**Contains:**
- **Repositories**: Data access implementations
- **External Services**: Third-party integrations
- **Database Adapters**: Prisma implementations

**Rules:**
- ✅ Implements interfaces from Domain/Application layers
- ✅ Handles technical concerns (DB, HTTP, etc.)
- ✅ No business logic

**Example:**
```typescript
// Repository Implementation
export class PrismaQueueEntryRepository implements IQueueEntryRepository {
  async findById(id: string): Promise<QueueEntry | null> {
    // Database access
  }
}
```

### 4. Presentation Layer (`src/presentation/`)

**Purpose:** Handles HTTP requests, UI, and user interaction.

**Contains:**
- **API Routes**: Next.js route handlers
- **Middleware**: Auth, error handling
- **Pages/Components**: UI (if needed)

**Rules:**
- ✅ Thin layer - delegates to Application layer
- ✅ Handles HTTP concerns (request/response)
- ✅ Input validation
- ✅ Error formatting

**Example:**
```typescript
// API Route
export async function POST(request: NextRequest) {
  // 1. Validate input
  // 2. Call use case
  // 3. Format response
  // 4. Handle errors
}
```

### 5. Shared Layer (`src/shared/`)

**Purpose:** Shared utilities, types, and constants.

**Contains:**
- **Types**: Common TypeScript types
- **Constants**: Application constants
- **Validation**: Zod schemas
- **Utilities**: Helper functions

**Rules:**
- ✅ No dependencies on other layers
- ✅ Pure utilities
- ✅ Reusable across layers

## Dependency Flow

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure → Domain
```

**Key Principle:** Dependencies point inward toward Domain layer.

## Key Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access, enable testing, swap implementations.

```typescript
// Interface (in domain/infrastructure)
interface IQueueEntryRepository {
  findById(id: string): Promise<QueueEntry | null>
}

// Implementation (in infrastructure)
class PrismaQueueEntryRepository implements IQueueEntryRepository {
  // Prisma-specific implementation
}
```

### 2. Use Case Pattern

**Purpose:** Encapsulate application-specific business logic.

```typescript
class CreateQueueEntryUseCase {
  constructor(
    private queueRepo: IQueueEntryRepository,
    private restaurantRepo: IRestaurantRepository
  ) {}
  
  async execute(input: CreateQueueEntryInput) {
    // Orchestrate domain objects
  }
}
```

### 3. Dependency Injection

**Purpose:** Invert dependencies, enable testing, centralize configuration.

```typescript
// Container (infrastructure/di/container.ts)
export const createQueueEntryUseCase = new CreateQueueEntryUseCase(
  queueEntryRepo,
  restaurantRepo,
  tokenSequenceRepo
)
```

### 4. Result Type

**Purpose:** Explicit error handling without exceptions.

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }
```

## Benefits

### 1. Testability
- Domain logic can be tested without database
- Use cases can be tested with mock repositories
- Clear separation of concerns

### 2. Maintainability
- Changes in one layer don't affect others
- Easy to locate code (by responsibility)
- Clear dependencies

### 3. Scalability
- Easy to add new features (new use cases)
- Swap implementations (e.g., different database)
- Horizontal scaling (stateless)

### 4. Flexibility
- Change UI without touching business logic
- Change database without changing domain
- Add new features incrementally

## Migration Strategy

### Phase 1: ✅ Completed
- Created domain entities
- Created repository interfaces
- Created use cases
- Refactored key API routes

### Phase 2: In Progress
- Migrate remaining API routes
- Update components to use new architecture
- Add comprehensive tests

### Phase 3: Future
- Extract remaining business logic from `lib/`
- Add domain events for async operations
- Implement CQRS if needed

## Code Examples

### Creating a Queue Entry (Full Flow)

```typescript
// 1. API Route (Presentation)
POST /api/public/[restaurantSlug]/queue
  ↓
// 2. Use Case (Application)
CreateQueueEntryUseCase.execute()
  ↓
// 3. Domain Entities (Domain)
QueueEntry.create()
  ↓
// 4. Repository (Infrastructure)
PrismaQueueEntryRepository.create()
```

### Error Handling

```typescript
// Use Case returns Result<T, Error>
const result = await useCase.execute(input)

if (!result.success) {
  return handleError(result.error)
}

return NextResponse.json({ data: result.data })
```

## Testing Strategy

### Unit Tests
- **Domain**: Test entities and domain services
- **Use Cases**: Test with mock repositories
- **Repositories**: Test with test database

### Integration Tests
- **API Routes**: Test full request/response flow
- **Use Cases + Repositories**: Test with real database

### E2E Tests
- **Full Flow**: Test complete user journeys

## Best Practices

1. **Keep Domain Pure**: No framework dependencies
2. **Use Interfaces**: Abstract infrastructure details
3. **Result Types**: Explicit error handling
4. **Single Responsibility**: Each class has one job
5. **Dependency Injection**: Invert dependencies
6. **Testability**: Easy to test in isolation

## Future Enhancements

1. **Domain Events**: For async operations
2. **CQRS**: Separate read/write models if needed
3. **Event Sourcing**: For audit trail
4. **Microservices**: Split by domain boundaries

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
