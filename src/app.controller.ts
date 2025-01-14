import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiHeaders } from './utils/decorators/header.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiHeaders()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
