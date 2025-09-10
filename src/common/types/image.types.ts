// 이건 필요할까봐 만들었었는데 지금 안쓰이네요, 필요없으면 나중에 삭제하겠습니다.

export type WithImageKey = { imageUrl?: string | null };
export type WithSignedUrl<T extends WithImageKey> = T & {
  signedImageUrl?: string;
};
