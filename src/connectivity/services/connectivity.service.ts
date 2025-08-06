import { Injectable, Logger } from '@nestjs/common';
import { NetworkService } from './network.service';
import { ConnectivityCheckRequest, ConnectivityCheckResponse, NetworkTestResult } from '../../common/interfaces/agent.interface';

@Injectable()
export class ConnectivityService {
  private readonly logger = new Logger(ConnectivityService.name);

  constructor(private readonly networkService: NetworkService) {}

  async checkConnectivity(request: ConnectivityCheckRequest): Promise<ConnectivityCheckResponse> {
    const { srcIp, srcPort, dstIp, dstPort, protocol, expectedToFail = false, timeout = 5000 } = request;
    
    this.logger.log(`Checking connectivity: ${protocol.toUpperCase()} from ${srcIp}:${srcPort} to ${dstIp}:${dstPort}`);

    let testResult: NetworkTestResult;

    try {
      switch (protocol) {
        case 'tcp':
          testResult = await this.networkService.testTcp(srcIp, srcPort, dstIp, dstPort, timeout);
          break;
        case 'udp':
          testResult = await this.networkService.testUdp(srcIp, srcPort, dstIp, dstPort, timeout);
          break;
        case 'icmp':
          testResult = await this.networkService.testIcmp(srcIp, dstIp, timeout);
          break;
        default:
          throw new Error(`Unsupported protocol: ${protocol}`);
      }
    } catch (error) {
      this.logger.error(`Connectivity check failed: ${error.message}`, error.stack);
      testResult = {
        success: false,
        responseTime: 0,
        error: error.message,
        details: { srcIp, srcPort, dstIp, dstPort, protocol }
      };
    }

    // 예상 결과와 실제 결과 비교
    const actualResult = this.determineActualResult(testResult);
    const policyViolation = this.checkPolicyViolation(testResult.success, expectedToFail);
    
    const response: ConnectivityCheckResponse = {
      result: testResult.success,
      message: this.generateMessage(testResult, expectedToFail, policyViolation),
      latency: testResult.responseTime || 0,
      protocol,
      details: {
        srcIp,
        srcPort,
        dstIp,
        dstPort,
        timestamp: new Date().toISOString(),
        error: testResult.error,
        expectedToFail,
        actualResult,
        policyViolation,
        connectedIp: testResult.connectedIp,
        remoteAddress: testResult.details?.remoteInfo?.address
      }
    };

    this.logger.log(`Connectivity check completed: ${response.result ? 'SUCCESS' : 'FAILED'} - ${response.message}`);
    
    return response;
  }

  private determineActualResult(testResult: NetworkTestResult): 'connected' | 'blocked' | 'timeout' | 'error' {
    if (testResult.success) {
      return 'connected';
    }

    if (testResult.error) {
      if (testResult.error.toLowerCase().includes('timeout')) {
        return 'timeout';
      }
      if (testResult.error.toLowerCase().includes('refused') || 
          testResult.error.toLowerCase().includes('unreachable')) {
        return 'blocked';
      }
      return 'error';
    }

    return 'blocked';
  }

  private checkPolicyViolation(actualSuccess: boolean, expectedToFail: boolean): boolean {
    // 예상 실패였는데 성공한 경우 = 정책 위반
    // 예상 성공이었는데 실패한 경우 = 정책 위반
    return (expectedToFail && actualSuccess) || (!expectedToFail && !actualSuccess);
  }

  private generateMessage(testResult: NetworkTestResult, expectedToFail: boolean, policyViolation: boolean): string {
    if (policyViolation) {
      if (expectedToFail && testResult.success) {
        return `Policy violation: Connection succeeded but was expected to fail`;
      } else if (!expectedToFail && !testResult.success) {
        return `Policy violation: Connection failed but was expected to succeed`;
      }
    }

    if (testResult.success) {
      return `Connection successful${expectedToFail ? ' (unexpected)' : ''}`;
    } else {
      const errorMsg = testResult.error || 'Connection failed';
      return `Connection failed: ${errorMsg}${expectedToFail ? ' (as expected)' : ''}`;
    }
  }

  async getCapabilities(): Promise<any> {
    return {
      supportedProtocols: ['tcp', 'udp', 'icmp'],
      features: [
        'connectivity-check',
        'latency-measurement',
        'policy-violation-detection',
        'timeout-configuration'
      ],
      version: '1.0.0',
      agent: 'transaction-agent'
    };
  }

  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };
  }
}
