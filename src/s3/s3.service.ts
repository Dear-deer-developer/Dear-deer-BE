import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { S3Folder } from './constants/s3.constant';

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

  private get bucket() {
    return this.configService.get<string>('AWS_S3_BUCKET');
  }

  private async generatePresignedUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
    return { url, key };
  }

  /** 편지 이미지 업로드 url 생성 함수 */
  async generateLetterImagePresignedUrl(
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
    const key = `${S3Folder.LETTERS}/${userId}/${uuid}${ext}`;

    return this.generatePresignedUrl(key, contentType);
  }

  /** 선물 이미지 업로드 url 생성 함수 */
  async generateGiftImagePresignedUrl(
    originalFileName: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(originalFileName);
    if (!ext) {
      throw new Error('Invalid file extension');
    }

    const uuid = uuidv4();

    const key = `${S3Folder.GIFTS}/${uuid}${ext}`;

    return this.generatePresignedUrl(key, contentType);
  }

  /** 음악 표지 업로드 url 생성 함수 */
  async generateCoverImagePresignedUrl(
    originalFileName: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(originalFileName);
    if (!ext) {
      throw new Error('Invalid file extension');
    }

    const uuid = uuidv4();

    const key = `${S3Folder.COVERS}/${uuid}${ext}`;

    return this.generatePresignedUrl(key, contentType);
  }

  /** 음악(mp3) 업로드 url 생성 함수 */
  async generateMusicPresignedUrl(
    originalFileName: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(originalFileName);
    if (!ext) {
      throw new Error('Invalid file extension');
    }

    const uuid = uuidv4();

    const key = `${S3Folder.MUSICS}/${uuid}${ext}`;

    return this.generatePresignedUrl(key, contentType);
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

  /** Content 이미지 업로드 url 생성 함수 (다중파일용) */
  async generateContentImagePresignedUrls(
    userId: number,
    imageFiles: { originalFileName: string; contentType: string }[],
    contentId: number,
  ): Promise<{ url: string; key: string }[]> {
    const results = [];

    const baseS3Path = `${S3Folder.CONTENTS}/${userId}/${contentId}}`;

    for (const file of imageFiles) {
      //확장자 추출
      const ext = path.extname(file.originalFileName);
      if (!ext) {
        throw new Error('Invalid file extension');
      }

      //UUID 생성
      const fileUuid = uuidv4();

      //S3 image Key 생성 (contents/유저ID/콘텐츠ID/고유파일명.확장자)
      const key = `${baseS3Path}/${fileUuid}${ext}`;

      const result = await this.generatePresignedUrl(key, file.contentType);
      results.push(result);
    }
    return results;
  }

  /** 여러 이미지 열람용 presigned URL 배치 생성 */
  async generateGetObjectPresignedUrls(
    keys: string[],
    opts?: { expiresInSec?: number; concurrency?: number },
  ): Promise<Record<string, string>> {
    const expiresInSec = opts?.expiresInSec ?? 300;

    // 유효한 키만 모아 중복 제거
    const uniqueKeys = Array.from(
      new Set(keys.filter((k): k is string => !!k)),
    );
    if (uniqueKeys.length === 0) return {};

    // presign 병렬 처리
    const entries = await Promise.all(
      uniqueKeys.map(async (key) => {
        try {
          const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
          });
          const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: expiresInSec,
          });
          return [key, url] as const;
        } catch {
          // 실패하면 undefined로 표시해 두고 아래에서 필터
          return [key, undefined] as const;
        }
      }),
    );

    // { [key]: url } 형태로 변환(성공한 것만)
    return Object.fromEntries(entries.filter(([, url]) => !!url)) as Record<
      string,
      string
    >;
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

  /** 콘텐츠 폴더 전체 삭제 */
  async deleteContentFolder(userId: number, contentId: number): Promise<void> {
    const prefix = `${S3Folder.CONTENTS}/${userId}/${contentId}/`;

    // 1. 해당 폴더 내 모든 객체 목록 조회
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const listedObjects = await this.s3Client.send(listCommand);

    // 2. 비어있으면 바로 종료
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

    // 3. 삭제할 키 배열로 변환
    const keysToDelete = listedObjects.Contents.map((obj) => ({
      Key: obj.Key,
    }));

    // 4. 객체 삭제
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: { Objects: keysToDelete },
    });

    await this.s3Client.send(deleteCommand);
  }

  async deleteSingleImage(key: string): Promise<void> {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: [{ Key: key }],
      },
    });

    await this.s3Client.send(command);
  }
}
