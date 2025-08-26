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
      //Firebase 토큰 검증 (revoke 여부까지 확인)
      const decoded = (await this.firebaseAdmin.verifyToken(
        token,
      )) as DecodedIdTokenWithAdmin;
      const uid = decoded.uid;

      const user = await this.usersRepository.findByProviderId(uid);
      if (!user) throw new UnauthorizedException('User not found');

      //req.user 세팅
      request.user = { id: user.id, uid, admin: Boolean(decoded.admin) };
      return true;
    } catch (e: any) {
      const code = e?.errorInfo?.code || e?.code;

      if (code === 'auth/id-token-revoked') {
        throw new UnauthorizedException('Token revoked. Please sign in again.');
      }

      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }

  private extractToken(req: Request): string {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token not found');
    }
    return authHeader.split(' ')[1];
  }
}
