# Backend Architecture

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts          # Root module, imports all feature modules
│   ├── main.ts                # Application bootstrap, Swagger setup, validation
│   └── modules/
│       └── game/              # Game feature module
│           ├── README.md      # Game-specific documentation
│           ├── game.module.ts # Module definition and DI setup
│           ├── game.controller.ts # REST API endpoints
│           ├── game.service.ts    # Business logic
│           ├── game.repository.ts # Database interface
│           ├── prisma.repository.ts # Prisma implementation
│           ├── game.types.ts      # TypeScript interfaces
│           ├── game.config.ts     # Game constants and formulas
│           └── dto/               # Data Transfer Objects
│               ├── purchase.dto.ts
│               ├── game-state.dto.ts
│               └── collect-result.dto.ts
├── prisma/
│   └── schema.prisma          # Database schema definition
└── generated/
    └── prisma/                # Generated Prisma client
```

## Design Patterns

**Repository Pattern**
- Abstract `GameRepository` interface
- Concrete `PrismaRepository` implementation
- Enables testing with mock repositories

**DTO Pattern**
- Separate request/response objects
- Input validation with `class-validator`
- API documentation with Swagger decorators

**Module Pattern**
- Feature-based organisation
- Dependency injection via NestJS
- Clear separation of concerns



