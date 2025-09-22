import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateMusicDto } from './dtos/create-music.dto';
import { UpdateMusicDto } from './dtos/update-music.dto';
import { ResMusicDto } from './dtos/res-music.dto';

export const ApiMusics = {
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: '음악 목록 조회' }),
      ApiResponse({
        status: 200,
        type: ResMusicDto,
        isArray: true,
        description: '등록된 음악 전체 목록을 반환합니다.',
      }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: '음악 단건 조회' }),
      ApiResponse({
        status: 200,
        type: ResMusicDto,
        description: '단일 음악 조회 성공',
      }),
      ApiResponse({
        status: 404,
        description: '해당 ID의 음악이 존재하지 않음',
        content: {
          'application/json': {
            example: {
              statusCode: 404,
              message: 'Music not found',
              error: 'Not Found',
            },
          },
        },
      }),
    ),

  create: () =>
    applyDecorators(
      ApiOperation({
        summary: '음악 생성',
        description: '새로운 정적 음악 메타데이터를 생성합니다.',
      }),
      ApiBody({ type: CreateMusicDto }),
      ApiResponse({
        status: 201,
        type: ResMusicDto,
        description: '음악이 성공적으로 생성되었습니다.',
        content: {
          'application/json': {
            example: {
              id: 3,
              title: '피아노 멜로디',
              artist: '알람 사운드',
              createdAt: '2025-09-10T12:34:56.000Z',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: '유효하지 않은 입력 값',
        content: {
          'application/json': {
            example: {
              statusCode: 400,
              message: ['title should not be empty', 'artist must be a string'],
              error: 'Bad Request',
            },
          },
        },
      }),
      ApiResponse({
        status: 409,
        description: '중복 등으로 인한 생성 실패(정책에 따라)',
        content: {
          'application/json': {
            example: {
              statusCode: 409,
              message: '이미 존재하는 제목입니다.',
              error: 'Conflict',
            },
          },
        },
      }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: '음악 수정' }),
      ApiBody({ type: UpdateMusicDto }),
      ApiResponse({
        status: 200,
        type: ResMusicDto,
        description: '음악 정보가 성공적으로 수정되었습니다.',
      }),
      ApiResponse({
        status: 400,
        description: '유효하지 않은 입력 값',
      }),
      ApiResponse({
        status: 404,
        description: '해당 ID의 음악이 존재하지 않음',
        content: {
          'application/json': {
            example: {
              statusCode: 404,
              message: 'Music not found',
              error: 'Not Found',
            },
          },
        },
      }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({
        summary: '음악 삭제',
        description:
          '음악을 삭제합니다. 알람에서 참조 중인 경우 정책에 따라 실패할 수 있습니다.',
      }),
      ApiResponse({
        status: 204,
        description: '삭제된 음악 정보를 반환합니다.',
      }),
      ApiResponse({
        status: 404,
        description: '해당 ID의 음악이 존재하지 않음',
      }),
      ApiResponse({
        status: 409,
        description:
          'FK 제약 등으로 삭제 불가(예: 알람이 참조 중). 운영 정책에 따라 문구 조정',
        content: {
          'application/json': {
            example: {
              statusCode: 409,
              message:
                'This music is referenced by alarms and cannot be deleted.',
              error: 'Conflict',
            },
          },
        },
      }),
    ),
};
