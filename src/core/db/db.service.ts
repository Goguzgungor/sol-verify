import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaUniversal } from 'prisma-decimal/lib/prisma.universal';



@Injectable()
export class DbService
  extends PrismaClient
  implements OnModuleInit {
  async onModuleInit() {
    // optional: this.models = ['table'];
    await this.$connect();
  }
  
  async onModuleDestroy() {
    await this.$disconnect();
  }
}