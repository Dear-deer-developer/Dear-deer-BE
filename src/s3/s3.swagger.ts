import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const ApiS3 = {
  getPresignedUrl: (label: 'letter' | 'gift' | 'cover' | 'music') =>
    applyDecorators(
      ApiOperation({
        summary: `${label} 이미지 업로드용 Presigned URL 발급`,
        description: `S3에 ${label} 이미지를 업로드할 수 있는 presigned URL을 발급합니다.`,
      }),
      ApiQuery({
        name: 'filename',
        required: true,
        description: '업로드할 파일명 (확장자 포함)',
        example: 'example.jpg',
      }),
      ApiQuery({
        name: 'contentType',
        required: true,
        description: '업로드할 파일의 Content-Type',
        example: 'image/jpg',
      }),
      ApiResponse({
        status: 200,
        description: 'Presigned URL 발급 성공',
        content: {
          'application/json': {
            example: {
              url: `https://your-bucket.s3.amazonaws.com/${label}/uuid.jpg?...`,
              key: `${label}/uuid.jpg`,
            },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
      }),
    ),
  getImageUrl: () =>
    applyDecorators(
      ApiOperation({
        summary: '이미지 열람용 Presigned URL 발급',
        description:
          'S3에 저장된 이미지를 잠깐 볼 수 있는 presigned URL을 반환합니다.',
      }),
      ApiQuery({
        name: 'key',
        required: true,
        description: '조회할 이미지의 S3 Key',
        example: 'letters/1234/uuid.jpg',
      }),
      ApiResponse({
        status: 200,
        description: '이미지 조회용 presigned URL 반환',
        content: {
          'application/json': {
            example: {
              url: 'https://your-bucket.s3.amazonaws.com/letters/uuid.jpg?...',
            },
          },
        },
      }),
    ),

  deleteImages: () =>
    applyDecorators(
      ApiOperation({
        summary: 'S3 이미지 삭제 (admin만 가능))',
        description: '여러 개의 S3 이미지 파일을 한 번에 삭제합니다.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            keys: {
              type: 'array',
              items: { type: 'string', example: 'gifts/uuid.jpg' },
            },
          },
        },
      }),
      ApiResponse({ status: 204, description: '삭제 성공' }),
      ApiResponse({ status: 400, description: '요청 형식 오류' }),
    ),
};
