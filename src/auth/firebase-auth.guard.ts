import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException();

    const decoded = await this.firebaseAdmin.verifyToken(token);
    const uid = decoded.uid;
    const user = await this.usersRepository.findByProviderId(uid);
    if (!user) throw new UnauthorizedException();
    const kakaoAccessToken = request.headers['x-kakao-access-token'];
    if (!kakaoAccessToken) throw new UnauthorizedException('카카오토큰 없음');

    request.user = { id: user.id, kakaoAccessToken };
    return true;
  }

  private extractToken(req: any): string | null {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();
    return authHeader.split(' ')[1];
  }
}
