import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}
  private s3Client = new S3Client({
    region: this.configService.get<string>('AWS_REGION'),
    credentials: {
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    },
  });

  /** 이미지 저장용 presigned URL 생성 */
  async generateUploadPresignedUrl(
    userId: number,
    originalFileName: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    // 확장자 추출
    const ext = path.extname(originalFileName);
    if (!ext) {
      throw new Error('Invalid file extension');
    }

    // UUID 생성
    const uuid = uuidv4();

    // S3 image Key 생성
    const key = `letters/${userId}/${uuid}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5분 유효
    return { url, key };
  }

  /** 이미지 열람용 presigned URL 생성 */
  async generateGetObjectPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5분 유효
    return url;
  }

  /** s3 이미지들 삭제 */
  async deleteObjects(keys: string[]): Promise<void> {
    const command = new DeleteObjectsCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    await this.s3Client.send(command);
  }
}
