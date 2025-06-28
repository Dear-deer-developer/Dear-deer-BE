import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';
import { UserRepository } from 'src/users/users.repository';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException();

    const decoded = await this.firebaseAdmin.verifyToken(token);
    const uid = decoded.uid;
    const user = await this.userRepository.findByProviderId(uid);
    if (!user) throw new UnauthorizedException();

    request.user = { id: user.id };
    return true;
  }

  private extractToken(req: any): string | null {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();
    return authHeader.split(' ')[1];
  }
}
