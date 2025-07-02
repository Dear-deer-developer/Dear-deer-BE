import { Controller, Get, Query } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /** 이미지 저장용 url 발급 */
  @Get('presigned-url')
  async getPresignedUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const key = `letters/${filename}`;
    const url = await this.s3Service.generatePresignedUrl(key, contentType);
    return { url, key };
  }
}
