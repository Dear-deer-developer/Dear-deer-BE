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
import { ApiTags } from '@nestjs/swagger';

@Controller('s3')
@ApiTags('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /** 편지 이미지 업로드용 presigned URL 발급 */
  @Get('letter-presigned-url')
  @UseGuards(FirebaseAuthGuard)
  @ApiS3.getPresignedUrl('letter')
  async getLetterPresignedUrl(
    @Req() req: any,
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const userId = req.user.id;
    const result = await this.s3Service.generateLetterImagePresignedUrl(
      userId,
      filename,
      contentType,
    );

    return result;
  }

  /** 선물 이미지 업로드용 presigned URL 발급 */
  @Get('gift-presigned-url')
  @UseGuards(FirebaseAuthGuard)
  @ApiS3.getPresignedUrl('gift')
  async getGiftPresignedUrl(
    @Req() req: any,
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const result = await this.s3Service.generateGiftImagePresignedUrl(
      filename,
      contentType,
    );

    return result;
  }

  /** 이미지 조회용 Presigned URL 발급 */
  @Get('image-url')
  @ApiS3.getImageUrl()
  async getImagePresignedUrl(
    @Query('key') key: string,
  ): Promise<{ url: string }> {
    const url = await this.s3Service.generateGetObjectPresignedUrl(key);
    return { url };
  }

  /** S3 이미지들 삭제 */
  @Delete('images')
  @HttpCode(204)
  @ApiS3.deleteImages()
  async deleteImages(@Body('keys') keys: string[]): Promise<void> {
    if (!keys || keys.length === 0) {
      throw new Error('삭제할 key 목록이 필요합니다.');
    }

    await this.s3Service.deleteObjects(keys);
  }
}
