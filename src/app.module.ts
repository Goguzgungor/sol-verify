import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetaplexService } from './verifylogic/metaplex.service';
import { DbService } from './core/db/db.service';
import { WalletManagerService } from './walletmanaging/wallet.manager.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService,MetaplexService,DbService,WalletManagerService],
})
export class AppModule {}
