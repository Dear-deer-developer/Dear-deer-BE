import { Module } from '@nestjs/common';
import { ImagePresignService } from './image-presign.service';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [ImagePresignService],
  exports: [ImagePresignService],
})
export class ImagePresignModule {}
