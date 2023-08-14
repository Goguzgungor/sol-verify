import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CheckXpDto } from './verifylogic/dto/checkXpDto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }



  @Post()
  checkXp(){
    return null;
  }
}
