import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
    providers: [ApiKeyGuard],
})
export class AuthModule {}
