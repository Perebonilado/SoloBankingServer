# SoloBankingServer

NestJS 12 (ES modules), MySQL, Sequelize 6 with sequelize-typescript, and Umzug migrations. The layout follows `~/Desktop/main-street/main-street-server`: domain-driven design with ports and adapters, and commands kept separate from queries.

## Layers

- `src/business/`: the domain and its use cases. No framework or ORM imports, except `Injectable` and `Logger` from `@nestjs/common`.
  - `domain/entities`, `domain/values`, and `domain/errors` (errors extend `DomainError`).
  - `ports/`: interfaces for external systems, with Symbol tokens in `ports/tokens.ts`.
  - `repositories/`: persistence interfaces, with Symbol tokens in `repositories/tokens.ts`.
  - `handlers/<area>/`: one handler per write operation, extending `AbstractRequestHandlerTemplate` and returning `CommandResponse`.
- `src/query/`: read-side query classes that use Sequelize models directly.
- `src/web/`: infrastructure. Controllers, Sequelize models (listed in `ALL_MODELS` in `database/models/index.ts`), repository implementations, adapters, security, validation DTOs, filters, and dependency wiring in `providers/`.
- `src/auth/`: authentication services.

## Rules

- Register ports and repositories in `web/providers/infrastructure.providers.ts`, handlers in `handler.providers.ts`, and queries in `query.providers.ts`.
- Every schema change is a migration in `migrations/` named `NNNN-description.migration.ts`. Never use `sync()`.
- Relative imports end in `.js`.
- Use Node 22 (`nvm use 22`). Install packages with `npx npm@11 install`, because npm 10.9.4 crashes on this project.
- No code comments.
