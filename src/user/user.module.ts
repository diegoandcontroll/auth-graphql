import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { DbModule } from 'src/db/db.module';
import { userProviders } from './user.provider';

@Module({
  imports: [DbModule],
  providers: [UserService, UserResolver, ...userProviders],
  exports: [UserService],
})
export class UserModule {}
