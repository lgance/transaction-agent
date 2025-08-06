import { Test, TestingModule } from '@nestjs/testing';
import { ConnectivityController } from '../src/connectivity/connectivity.controller';
import { ConnectivityService } from '../src/connectivity/services/connectivity.service';
import { NetworkService } from '../src/connectivity/services/network.service';
import { ConnectivityCheckDto } from '../src/connectivity/dto/connectivity.dto';

describe('ConnectivityController', () => {
  let controller: ConnectivityController;
  let service: ConnectivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectivityController],
      providers: [ConnectivityService, NetworkService],
    }).compile();

    controller = module.get<ConnectivityController>(ConnectivityController);
    service = module.get<ConnectivityService>(ConnectivityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle probe request', async () => {
    const dto: ConnectivityCheckDto = {
      srcIp: '127.0.0.1',
      srcPort: 12345,
      dstIp: '127.0.0.1',
      dstPort: 80,
      protocol: 'tcp',
      timeout: 5000
    };

    // GET 방식으로 변경되었으므로 query 파라미터로 테스트
    const result = await controller.probe(dto);
    expect(result).toBeDefined();
    expect(result.protocol).toBe('tcp');
    expect(typeof result.result).toBe('boolean');
    expect(typeof result.latency).toBe('number');
  });

  it('should return health status', async () => {
    const result = await controller.health();
    expect(result).toBeDefined();
    expect(result.status).toBe('healthy');
    expect(result.timestamp).toBeDefined();
  });

  it('should return capabilities', async () => {
    const result = await controller.capabilities();
    expect(result).toBeDefined();
    expect(result.supportedProtocols).toEqual(['tcp', 'udp', 'icmp']);
    expect(result.features).toBeDefined();
  });
});
