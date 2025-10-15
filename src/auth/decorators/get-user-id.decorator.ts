import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 💡 JwtGuard의 validate 메서드가 반환한 { userId: number, isAdmin: boolean } 객체를 사용합니다.
export const GetUserId = createParamDecorator(
  (data: 'userId', ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();

    // data 매개변수에 'userId' 또는 'isAdmin' 같은 문자열을 전달하면 해당 값을 반환하도록 확장할 수도 있습니다.
    return request.user.userId;
  },
);
