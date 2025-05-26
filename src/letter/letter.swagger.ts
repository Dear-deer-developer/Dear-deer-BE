import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendLetterDto } from './dto/send-letter.dto';
import { SaveWritingDto } from './dto/save-writing.dto';
import { ResLetterDto } from './dto/res-letter.dto';

export const ApiLetters = {
  send: () =>
    applyDecorators(
      ApiOperation({
        summary: '편지 전송',
        description: '편지를 실제로 전송하며, 상태는 `sent`로 설정됩니다.',
      }),
      ApiBody({
        description: '편지 전송에 필요한 정보',
        type: SendLetterDto,
      }),
      ApiResponse({
        status: 201,
        description: '편지가 성공적으로 전송되었습니다.',
        content: {
          'application/json': {
            example: {
              id: 42,
              senderId: 17,
              receiverId: 2,
              content: '안녕하세요!',
              imageUrl: 'https://image.url/image.jpg',
              status: 'sent',
              sentAt: '2025-05-26T11:15:00.000Z',
              createdAt: '2025-05-26T11:15:00.000Z',
              updatedAt: '2025-05-26T11:15:00.000Z',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: '요청이 잘못되었거나, 유효하지 않은 값이 포함됨',
        content: {
          'application/json': {
            example: {
              message: [
                'content must be a string',
                'senderId must be an integer',
              ],
              error: 'Bad Request',
              statusCode: 400,
            },
          },
        },
      }),
      ApiResponse({
        status: 409,
        description: '중복되거나 유효하지 않은 요청',
        content: {
          'application/json': {
            example: {
              message: '이미 전송된 편지입니다.',
              error: 'Conflict',
              statusCode: 409,
            },
          },
        },
      }),
    ),

  saveWriting: () =>
    applyDecorators(
      ApiOperation({ summary: '편지 임시 저장' }),
      ApiBody({ type: SaveWritingDto }),
      ApiResponse({ status: 201, description: '임시 저장 완료' }),
      ApiResponse({
        status: 400,
        description: '잘못된 입력 값',
      }),
    ),
  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: '단일 편지 조회' }),
      ApiResponse({
        status: 200,
        type: ResLetterDto,
        description: '편지 조회 성공',
      }),
      ApiResponse({
        status: 404,
        description: '해당 ID의 편지가 존재하지 않음',
      }),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: '전체 편지 조회' }),
      ApiResponse({
        status: 200,
        type: ResLetterDto,
        isArray: true,
        description: '모든 편지 목록 반환',
      }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({ summary: '편지 삭제' }),
      ApiResponse({ status: 204, description: '삭제 성공' }),
      ApiResponse({
        status: 404,
        description: '존재하지 않는 편지 ID',
      }),
    ),
};
