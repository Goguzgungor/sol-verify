import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetaplexService } from './verifylogic/metaplex.service';
import { DbService } from './core/db/db.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService,MetaplexService,DbService],
})
export class AppModule {}
