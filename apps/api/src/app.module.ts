import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { StudentsModule } from './students/students.module';
import { HostelsModule } from './hostels/hostels.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { AllotmentModule } from './allotment/allotment.module';
import { LettersModule } from './letters/letters.module';
import { MailModule } from './mail/mail.module';
import { ImportsModule } from './imports/imports.module';
import { RefundsModule } from './refunds/refunds.module';
import { DocumentsModule } from './documents/documents.module';
import { OpsModule } from './ops/ops.module';
import { RebatesModule } from './rebates/rebates.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PaymentsModule,
    StudentsModule,
    HostelsModule,
    WaitlistModule,
    AllotmentModule,
    LettersModule,
    MailModule,
    ImportsModule,
    RefundsModule,
    DocumentsModule,
    OpsModule,
    RebatesModule,
    ComplaintsModule,
    RequestsModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
