export interface ConnectivityCheckRequest {
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: 'tcp' | 'udp' | 'icmp';
  expectedToFail?: boolean;
  timeout?: number;
}

export interface ConnectivityCheckResponse {
  result: boolean;
  message: string;
  latency: number;
  protocol: 'tcp' | 'udp' | 'icmp';
  details: {
    srcIp: string;
    srcPort: number;
    dstIp: string;
    dstPort: number;
    timestamp: string;
    error?: string;
    expectedToFail?: boolean;
    actualResult?: 'connected' | 'blocked' | 'timeout' | 'error';
    policyViolation?: boolean;
    connectedIp?: string;
    remoteAddress?: string;
  };
}

export interface NetworkTestResult {
  success: boolean;
  responseTime: number;
  latency?: number;
  error?: string;
  connectedIp?: string;
  details?: any;
}
