import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly usersService: UsersService,
  ) {}

  async authenticate(idToken: string) {
    try {
      const decoded = await this.firebaseAdmin.verifyToken(idToken);

      const providerId = decoded.uid;
      const nickname = decoded.name || '익명';
      const zipCode = 0;

      // Firebase에서 제공하는 uid를 사용하여 사용자 정보를 가져오기(이미 있는 사용자 찾기)
      let user = await this.usersService.findByProviderId(providerId);

      // 사용자가 없는 경우 새 사용자 생성
      if (!user) {
        user = await this.usersService.create({
          provider_id: providerId,
          nickname,
          zip_code: zipCode,
        });
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }
}
