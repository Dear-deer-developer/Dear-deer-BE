import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import { UsersRepository } from 'src/users/users.repository';
import { Request } from 'express';

type RequestUser = {
  id: number;
  uid: string;
  admin: boolean;
};

interface DecodedIdTokenWithAdmin {
  uid: string;
  email?: string;
  admin?: boolean;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    try {
      const decoded: (await this.firebaseAdmin.verifyToken(token)) as DecodedIdTokenWithAdmin;
      const uid = decoded.uid;

      // DB에서 사용자 찾기
      const user = await this.usersRepository.findByProviderId(uid);
      if (!user) throw new UnauthorizedException('User not found');

      request.user = {
        id: user.id,
        uid,
        admin: Boolean(decoded.admin),
      };

      return true;
    } catch(e: any) {
      // Firebase 토큰 회수/만료 등 세분화
      const code = e?.errorInfo?.code || e?.code;
      if (code === 'auth/id-token-revoked') {
        throw new UnauthorizedException('Token revoked. Please sign in again.');
      }
      if (code === 'auth/argument-error' || code === 'auth/invalid-id-token') {
        throw new UnauthorizedException(e?.message || 'Unauthorized');
      }
    }


    if (!token) throw new UnauthorizedException('Token not found');

    const decoded = await this.firebaseAdmin.verifyToken(token);
    const uid = decoded.uid;
    const user = await this.usersRepository.findByProviderId(uid);
    if (!user) throw new UnauthorizedException('User not found');

    request.user = { id: user.id, uid: uid, admin: decoded.admin || false };
    return true;
  }

  private extractToken(req: request): string | null {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();
    return authHeader.split(' ')[1];
  }
}
