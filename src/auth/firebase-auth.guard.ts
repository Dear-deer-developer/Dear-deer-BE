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
    if (!token) throw new UnauthorizedException('Token not found');

    const decoded = await this.firebaseAdmin.verifyToken(token);
    const uid = decoded.uid;
    const user = await this.usersRepository.findByProviderId(uid);
    if (!user) throw new UnauthorizedException('User not found');

    request.user = { id: user.id, uid: uid, admin: decoded.admin || false };
    return true;
  }

  private extractToken(req: any): string | null {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();
    return authHeader.split(' ')[1];
  }
}
