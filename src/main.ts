import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // string → number 등 자동 변환
      whitelist: true, // DTO에 명시되지 않은 값 제거
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 문서 빌더
  const config = new DocumentBuilder()
    .setTitle('Deardeer API')
    .setDescription('Deardeer 편지 서비스 백엔드 Swagger 문서')
    .setVersion('1.0')
    .addBearerAuth() // JWT 인증 사용할 경우
    .build();

  // 문서 생성
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI 경로 설정
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      operationsSorter: (a: any, b: any) => {
        //메서드 순서
        const order = {
          get: '0',
          post: '1',
          put: '2',
          patch: '3',
          delete: '4',
        };

        return order[a.get('method')].localeCompare(order[b.get('method')]);
      },
    },
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
