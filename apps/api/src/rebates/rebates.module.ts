import { Module } from '@nestjs/common';
import { RebatesService } from './rebates.service';
import { RebatesController } from './rebates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RebatesController],
  providers: [RebatesService],
})
export class RebatesModule {}
