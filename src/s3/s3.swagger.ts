import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const ApiS3 = {
  getPresignedUrl: () =>
    applyDecorators(
      ApiOperation({
        summary: 'S3 이미지 업로드용 Presigned URL 발급',
        description:
          '요청한 파일명과 Content-Type에 맞게 S3 Presigned URL을 발급합니다.',
      }),
      ApiQuery({
        name: 'filename',
        required: true,
        description: '업로드할 파일명 (확장자 포함)',
        example: 'example.png',
      }),
      ApiQuery({
        name: 'contentType',
        required: true,
        description: '업로드할 파일의 Content-Type',
        example: 'image/png',
      }),
      ApiResponse({
        status: 200,
        description: 'Presigned URL 발급 성공',
        content: {
          'application/json': {
            example: {
              url: 'https://your-s3-bucket.s3.amazonaws.com/uploads/abc123.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...',
              fields: {
                key: 'uploads/abc123.png',
                AWSAccessKeyId: 'AKIA...',
                policy: '...',
                signature: '...',
              },
            },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패 (토큰 없음 또는 잘못됨)',
      }),
    ),
};
