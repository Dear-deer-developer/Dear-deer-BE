import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';

// keySelector: 행에서 S3 키를 어떻게 뽑을지
// outProp: 주입할 필드명 (기본: "signedImageUrl")
// deriveKey: 원본 key -> 썸네일 key로 바꾸고 싶을 때 사용 // *이건 일단 안쓰는중.
type AttachOpts<T> = {
  keySelector: (row: T) => string | null | undefined;
  outProp?: string; // 기본 "signedImageUrl"
  ttlSec?: number;
  deriveKey?: (key: string, row: T) => string;
};

@Injectable()
export class ImagePresignService {
  constructor(private readonly s3: S3Service) {}

  /**
   * s3 이미지를 여러개 가져올때 사용함
   */
  async attachSignedUrls<T>(
    rows: T[],
    opts: AttachOpts<T>,
  ): Promise<(T & Record<string, string | undefined>)[]> {
    const { keySelector, outProp = 'signedImageUrl', deriveKey, ttlSec } = opts;

    // 1) 각 행 기준으로 effectiveKey(파생키 또는 원본키) 계산
    const effectiveKeysPerRow: Array<string | undefined> = rows.map((row) => {
      const key = keySelector(row);
      if (!key) return undefined;
      return deriveKey ? deriveKey(key, row) : key;
    });

    // 2) 유효한 키만 모아 중복 제거
    const uniqueKeys = Array.from(
      new Set(effectiveKeysPerRow.filter((k): k is string => !!k)),
    );
    if (uniqueKeys.length === 0) return rows as any;

    // 3) 배치 presign (key -> url 맵)
    const map = await this.s3.generateGetObjectPresignedUrls(uniqueKeys, {
      expiresInSec: ttlSec,
    });

    // 4) 각 행에 주입
    return rows.map((row, idx) => {
      const effKey = effectiveKeysPerRow[idx];
      const url = effKey ? map[effKey] : undefined;
      return url ? { ...(row as any), [outProp]: url } : row;
    });
  }
}
