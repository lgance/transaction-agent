import { Controller, Get, Query, ValidationPipe, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ConnectivityService } from './services/connectivity.service';
import { ConnectivityCheckDto } from './dto/connectivity.dto';
import { ConnectivityCheckRequest, ConnectivityCheckResponse } from '../common/interfaces/agent.interface';

@Controller('api')
export class ConnectivityController {
  private readonly logger = new Logger(ConnectivityController.name);

  constructor(private readonly connectivityService: ConnectivityService) {}

  @Get('probe')
  @HttpCode(HttpStatus.OK)
  async probe(
    @Query(new ValidationPipe({ transform: true })) dto: ConnectivityCheckDto
  ): Promise<ConnectivityCheckResponse> {
    this.logger.log(`Probe request: ${dto.protocol.toUpperCase()} ${dto.srcIp}:${dto.srcPort} -> ${dto.dstIp}:${dto.dstPort}`);
    
    const request: ConnectivityCheckRequest = {
      srcIp: dto.srcIp,
      srcPort: dto.srcPort,
      dstIp: dto.dstIp,
      dstPort: dto.dstPort,
      protocol: dto.protocol,
      expectedToFail: dto.expectedToFail,
      timeout: dto.timeout
    };

    try {
      const response = await this.connectivityService.checkConnectivity(request);
      this.logger.log(`Probe completed: ${response.result ? 'SUCCESS' : 'FAILED'}`);
      return response;
    } catch (error) {
      this.logger.error(`Probe failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('health')
  async health() {
    this.logger.log('Health check requested');
    return await this.connectivityService.healthCheck();
  }

  @Get('capabilities')
  async capabilities() {
    this.logger.log('Capabilities requested');
    return await this.connectivityService.getCapabilities();
  }
}
