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

    const raw = process.env.ADMINS || '';
    const scrub = (s: string) =>
      s
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/^kakao:/, '');

    const admins = raw.split(',').map(scrub).filter(Boolean);
    const uidRaw = String(user?.uid ?? '');
    const uid = scrub(uidRaw);

    if (!uid || !admins.includes(uid)) {
      throw new ForbiddenException('❌ 관리자 권한이 필요합니다.');
    }
    return true;
  }
}
