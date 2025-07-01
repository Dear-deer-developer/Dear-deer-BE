import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  providerId: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  zipCode: number;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<RegisterUserResponseDto>) {
    Object.assign(this, partial);
  }
}
