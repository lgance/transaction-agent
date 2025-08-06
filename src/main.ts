import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 7500; // 환경 변수 우선, 기본값 7500
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(
    new ValidationPipe({    
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => ({
          property: error.property,
          errors: Object.values(error.constraints || {}).join(', '),
          value: error.value
        }));
        return new BadRequestException({
          statusCode: 400, 
          message: '필수 파라미터가 누락되었습니다 [ Transaction - Agent ] ',
          errors: messages
        });
      },
    }), 
  );

  await app.listen(port);
  
  // 서버 시작 로그
  logger.log('\r\n\r\n')
  logger.log(`🚀 Transaction Agent Server is running on http://localhost:${port}`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`⏰ Started at: ${new Date().toLocaleString('ko-KR')}`);
}

bootstrap().catch(err => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start server:', err);
  process.exit(1);
});