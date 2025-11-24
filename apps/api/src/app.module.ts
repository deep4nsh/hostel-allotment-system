import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { StudentsModule } from './students/students.module';
import { HostelsModule } from './hostels/hostels.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { AllotmentModule } from './allotment/allotment.module';
import { LettersModule } from './letters/letters.module';
import { MailModule } from './mail/mail.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
