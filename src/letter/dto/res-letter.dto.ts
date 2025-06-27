import { ApiProperty } from '@nestjs/swagger';

export class ResLetterDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 17 })
  senderId: number;

  @ApiProperty({ example: 2, nullable: true })
  receiverId: number | null;

  @ApiProperty({ example: '안녕하세요!' })
  content: string;

  @ApiProperty({ example: 'https://image.url/image.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: 'sent' })
  status: 'writing' | 'sent' | 'received';

  @ApiProperty({ example: '2025-05-26T11:15:00.000Z' })
  sentAt: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
