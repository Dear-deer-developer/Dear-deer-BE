import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminGuard],
})
export class AdminModule {}
