import { IsString, IsNumber, IsOptional, IsBoolean, IsIn, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConnectivityCheckDto {
  @IsString()
  srcIp: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(65535)
  srcPort: number;

  @IsString()
  dstIp: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(65535)
  dstPort: number;

  @IsIn(['tcp', 'udp', 'icmp'])
  protocol: 'tcp' | 'udp' | 'icmp';

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  expectedToFail?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1000)
  @Max(30000)
  timeout?: number = 5000;
}
