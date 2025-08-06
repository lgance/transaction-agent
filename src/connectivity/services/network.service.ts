import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import * as dgram from 'dgram';
import { spawn } from 'child_process';
import { NetworkTestResult } from '../../common/interfaces/agent.interface';

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  async testTcp(srcIp: string, srcPort: number, dstIp: string, dstPort: number, timeout: number = 5000): Promise<NetworkTestResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      // TCP 소켓은 connect 시에 로컬 포트가 자동 할당됩니다
      this.logger.debug(`TCP connecting from ${srcIp}:${srcPort} to ${dstIp}:${dstPort}`);

      const timer = setTimeout(() => {
        socket.destroy();
        resolve({
          success: false,
          responseTime: Date.now() - startTime,
          error: 'Connection timeout',
          details: {
            srcIp,
            srcPort,
            dstIp,
            dstPort,
            protocol: 'tcp'
          }
        });
      }, timeout);

      socket.connect(dstPort, dstIp, () => {
        clearTimeout(timer);
        const responseTime = Date.now() - startTime;
        socket.end();
        
        resolve({
          success: true,
          responseTime,
          details: {
            srcIp,
            srcPort,
            dstIp,
            dstPort,
            protocol: 'tcp'
          }
        });
      });

      socket.on('error', (error) => {
        clearTimeout(timer);
        socket.destroy();
        
        resolve({
          success: false,
          responseTime: Date.now() - startTime,
          error: error.message,
          details: {
            srcIp,
            srcPort,
            dstIp,
            dstPort,
            protocol: 'tcp'
          }
        });
      });
    });
  }

  async testUdp(srcIp: string, srcPort: number, dstIp: string, dstPort: number, timeout: number = 5000): Promise<NetworkTestResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const socket = dgram.createSocket('udp4');
      
      socket.bind(srcPort, srcIp, () => {
        this.logger.debug(`UDP Socket bound to ${srcIp}:${srcPort}`);
      });

      const timer = setTimeout(() => {
        socket.close();
        resolve({
          success: false,
          responseTime: Date.now() - startTime,
          error: 'UDP test timeout',
          details: {
            srcIp,
            srcPort,
            dstIp,
            dstPort,
            protocol: 'udp'
          }
        });
      }, timeout);

      socket.on('error', (error) => {
        clearTimeout(timer);
        socket.close();
        
        resolve({
          success: false,
          responseTime: Date.now() - startTime,
          error: error.message,
          details: {
            srcIp,
            srcPort,
            dstIp,
            dstPort,
            protocol: 'udp'
          }
        });
      });

      socket.on('message', (msg, rinfo) => {
        clearTimeout(timer);
        socket.close();
        
        resolve({
          success: true,
          responseTime: Date.now() - startTime,
          details: {
            srcIp,
            srcPort,
            dstIp,
            dstPort,
            protocol: 'udp',
            message: msg.toString(),
            remoteInfo: rinfo
          }
        });
      });

      // UDP 테스트 메시지 전송
      const testMessage = Buffer.from('connectivity-test');
      socket.send(testMessage, dstPort, dstIp, (error) => {
        if (error) {
          clearTimeout(timer);
          socket.close();
          
          resolve({
            success: false,
            responseTime: Date.now() - startTime,
            error: error.message,
            details: {
              srcIp,
              srcPort,
              dstIp,
              dstPort,
              protocol: 'udp'
            }
          });
        }
      });
    });
  }

  async testIcmp(srcIp: string, dstIp: string, timeout: number = 5000): Promise<NetworkTestResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const isWindows = process.platform === 'win32';
      const pingCommand = isWindows ? 'ping' : 'ping';
      const pingArgs = isWindows 
        ? ['-n', '1', '-w', timeout.toString(), '-S', srcIp, dstIp]
        : ['-c', '1', '-W', (timeout / 1000).toString(), '-I', srcIp, dstIp];

      const pingProcess = spawn(pingCommand, pingArgs);
      let output = '';
      let errorOutput = '';

      pingProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pingProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pingProcess.on('close', (code) => {
        const responseTime = Date.now() - startTime;
        
        if (code === 0) {
          // Ping 성공
          let extractedTime = responseTime;
          
          // Windows에서 시간 추출
          if (isWindows) {
            const timeMatch = output.match(/시간=(\d+)ms|time=(\d+)ms/i);
            if (timeMatch) {
              extractedTime = parseInt(timeMatch[1] || timeMatch[2]);
            }
          } else {
            // Linux/Unix에서 시간 추출
            const timeMatch = output.match(/time=(\d+\.?\d*)/i);
            if (timeMatch) {
              extractedTime = parseFloat(timeMatch[1]);
            }
          }

          resolve({
            success: true,
            responseTime: extractedTime,
            details: {
              srcIp,
              dstIp,
              protocol: 'icmp',
              output: output.trim()
            }
          });
        } else {
          resolve({
            success: false,
            responseTime,
            error: errorOutput || 'Ping failed',
            details: {
              srcIp,
              dstIp,
              protocol: 'icmp',
              output: output.trim(),
              errorOutput: errorOutput.trim()
            }
          });
        }
      });

      pingProcess.on('error', (error) => {
        resolve({
          success: false,
          responseTime: Date.now() - startTime,
          error: error.message,
          details: {
            srcIp,
            dstIp,
            protocol: 'icmp'
          }
        });
      });
    });
  }
}
