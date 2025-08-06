import { Module } from '@nestjs/common';
import { ConnectivityController } from './connectivity.controller';
import { ConnectivityService } from './services/connectivity.service';
import { NetworkService } from './services/network.service';

@Module({
  controllers: [ConnectivityController],
  providers: [ConnectivityService, NetworkService],
  exports: [ConnectivityService, NetworkService],
})
export class ConnectivityModule {}
