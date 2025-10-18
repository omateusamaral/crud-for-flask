import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    const validApiKey = this.configService.get<string>('API_KEY');

    if (!apiKeyHeader) {
      throw new UnauthorizedException('x-api-key header ausente.');
    }

    if (apiKeyHeader !== validApiKey) {
      throw new UnauthorizedException('x-api-key inválida.');
    }

    return true;
  }
}
