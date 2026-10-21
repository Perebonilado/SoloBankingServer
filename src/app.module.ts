import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountsController } from './web/controllers/accounts.controller.js';
import { AuthController } from './web/controllers/auth.controller.js';
import { BanksController } from './web/controllers/banks.controller.js';
import { BeneficiariesController } from './web/controllers/beneficiaries.controller.js';
import { TransfersController } from './web/controllers/transfers.controller.js';
import { ALL_MODELS } from './web/database/models/index.js';
import { DomainErrorFilter } from './web/filters/domain-error.filter.js';
import { handlerProviders } from './web/providers/handler.providers.js';
import {
  adapterProviders,
  authProviders,
  repositoryProviders,
} from './web/providers/infrastructure.providers.js';
import { queryProviders } from './web/providers/query.providers.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('DATABASE_URL'),
        dialect: 'mysql' as const,
        models: ALL_MODELS,
        autoLoadModels: false,
        synchronize: false,
        timezone: '+00:00',
        logging: false,
        define: { underscored: true, charset: 'utf8mb4' },
      }),
    }),
    SequelizeModule.forFeature(ALL_MODELS),
  ],
  controllers: [
    AuthController,
    AccountsController,
    BeneficiariesController,
    BanksController,
    TransfersController,
  ],
  providers: [
    ...authProviders,
    ...repositoryProviders,
    ...adapterProviders,
    ...handlerProviders,
    ...queryProviders,
    { provide: APP_FILTER, useClass: DomainErrorFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors) =>
          new BadRequestException(
            errors
              .flatMap((error) => Object.values(error.constraints ?? {}))
              .join('; ') || 'Validation failed',
          ),
      }),
    },
  ],
})
export class AppModule {}
