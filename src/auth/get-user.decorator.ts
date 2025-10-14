import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    // data (인자)가 주어지지 않으면 전체 user 객체를 반환합니다.
    if (!data) {
      return user;
    }
    // data (인자)가 주어지면 해당 필드 값만 반환합니다.
    return user[data];
  },
);
