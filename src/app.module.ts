import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetaplexService } from './verifylogic/metaplex.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService,MetaplexService],
})
export class AppModule {}
