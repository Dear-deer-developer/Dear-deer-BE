import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { ApiS3 } from './s3.swagger';
import { ApiTags } from '@nestjs/swagger';

@Controller('s3')
@ApiTags('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /** 이미지 저장용 url 발급 */
  @Get('presigned-url')
  @UseGuards(FirebaseAuthGuard)
  @ApiS3.getPresignedUrl()
  async getPresignedUrl(
    @Req() req: any,
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    const userId = req.user.id;
    const result = await this.s3Service.generateUploadPresignedUrl(
      userId,
      filename,
      contentType,
    );

    return result;
  }
}
