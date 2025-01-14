import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class APIKeyGuard implements CanActivate {
  private readonly API_KEY: string = this.configService.get('API_KEY');
  constructor(private readonly configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const API_KEY = this.API_KEY;

    const request = context.switchToHttp().getRequest();

    return (
      request?.headers?.api_key === API_KEY ||
      request?.headers['x-api-key'] === API_KEY
    );
  }
}
