import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  configValidationSchema,
  databaseConfig,
  jwtConfig,
  appConfig,
  emailConfig,
} from './config';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchemaModule } from './modules/schema/schema.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { EmailModule } from './modules/email/email.module';
import { FilesModule } from './modules/files/files.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig, emailConfig],
      validationSchema: configValidationSchema,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('nodeEnv') === 'development', // Auto-sync in dev only
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    SchemaModule,
    ContactsModule,
    LeadsModule,
    OpportunitiesModule,
    TasksModule,
    CalendarModule,
    EmailModule,
    FilesModule,
    ReportsModule,
    DashboardModule,
  ],
})
export class AppModule {}
