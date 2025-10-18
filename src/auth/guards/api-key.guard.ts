import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly logger = new Logger(ApiKeyGuard.name);
    constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKeyHeader = request.headers['x-api-key'];

        const validApiKey = this.configService.get<string>('API_KEY');
        console.log('API Key Header:', apiKeyHeader, apiKeyHeader);
        if (!apiKeyHeader) {
            this.logger.warn('x-api-key header ausente.');
            throw new UnauthorizedException('x-api-key header ausente.');
        }

        if (apiKeyHeader !== validApiKey) {
            this.logger.warn('x-api-key inválida.');
            throw new UnauthorizedException('x-api-key inválida.');
        }

        return true;
    }
}
