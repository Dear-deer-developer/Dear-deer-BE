import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const admins = (process.env.ADMINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!user || !admins.includes(user.uid)) {
      throw new ForbiddenException('❌ 관리자 권한이 필요합니다.');
    }

    return true;
  }
}
