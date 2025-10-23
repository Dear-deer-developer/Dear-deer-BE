import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { ApiS3 } from './s3.swagger';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/auth/decorators/get-user-id.decorator';

@Controller('s3')
@ApiTags('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /** 편지 이미지 업로드용 presigned URL 발급 */
  @Get('letter-presigned-url')
  @UseGuards(AuthGuard('accessToken'))
  @ApiS3.getPresignedUrl('letter')
  async getLetterPresignedUrl(
    @GetUserId() userId: number,
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const result = await this.s3Service.generateLetterImagePresignedUrl(
      userId,
      filename,
      contentType,
    );

    return result;
  }

  /** 선물 이미지 업로드용 presigned URL 발급 (선물 이미지도 앱 자체에 저장)*/
  @Get('gift-presigned-url')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiS3.getPresignedUrl('gift')
  @ApiExcludeEndpoint()
  async getGiftPresignedUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const result = await this.s3Service.generateGiftImagePresignedUrl(
      filename,
      contentType,
    );

    return result;
  }

  // 음악 관련 메서드는 안 쓰일 것 같음.. (음악파일과 표지를 앱자체에 저장시키기로 함-09.14)
  /** 음악 표지 업로드용 presigned URL 발급 */
  @Get('cover-presigned-url')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiS3.getPresignedUrl('cover')
  @ApiExcludeEndpoint()
  async getCoverPresignedUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const result = await this.s3Service.generateCoverImagePresignedUrl(
      filename,
      contentType,
    );

    return result;
  }

  /** 음악(mp3) 업로드용 presigned URL 발급 (음악도 앱 자체에 저장)*/
  @Get('music-presigned-url')
  @UseGuards(AuthGuard('jwtAdmin'))
  @ApiS3.getPresignedUrl('music')
  @ApiExcludeEndpoint()
  async getMusicPresignedUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const result = await this.s3Service.generateMusicPresignedUrl(
      filename,
      contentType,
    );

    return result;
  }

  /** 이미지 조회용 Presigned URL 발급 */
  @Get('image-url')
  @UseGuards(AuthGuard('accessToken'))
  @ApiS3.getImageUrl()
  async getImagePresignedUrl(
    @Query('key') key: string,
  ): Promise<{ url: string }> {
    const url = await this.s3Service.generateGetObjectPresignedUrl(key);
    return { url };
  }

  /** S3 이미지들 삭제 */
  @Delete('images')
  @UseGuards(AuthGuard('jwtAdmin'))
  @HttpCode(204)
  @ApiS3.deleteImages()
  async deleteImages(@Body('keys') keys: string[]): Promise<void> {
    if (!keys || keys.length === 0) {
      throw new Error('삭제할 key 목록이 필요합니다.');
    }

    await this.s3Service.deleteObjects(keys);
  }
}
