import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CheckXpDto, FraudCheckXpDto } from './verifylogic/dto/checkXpDto';
import { MetaplexService } from './verifylogic/metaplex.service';
import { example_key_values } from './core/test_constant/example_value';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('solverify') // Define a tag for your controller
export class AppController {
  constructor(private readonly appService: AppService, private metaplexService:MetaplexService) {
    this.appService= appService;
    this.metaplexService= metaplexService;
  }

  // ...

  @Get()
  @ApiResponse({ status: 200, description: 'Returns a hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('checkXp') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({ status: 200, description: 'İlk end point' })
  @ApiBody({ type: CheckXpDto }) // Specify the DTO class for the request body
  async checkXp(@Body() checkXpDto: CheckXpDto) {
    return await this.metaplexService.findNftByPublic(checkXpDto.publicKey);
  }


  @Post('checkOutXp') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({ status: 200, description: '2. check işleminin yapıldığı en point' })
  @ApiBody({ type: CheckXpDto }) // Specify the DTO class for the request body
  async secondCheck(@Body() checkXpDto: CheckXpDto) {
    return await this.metaplexService.findNftByPublic(checkXpDto.publicKey);
  }


  @Post('fraudcheckXP') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({ status: 200, description: 'En son konuştuğumuz fraud check enpionti, itemlerin xplerini teker teker almak daha doğru olur diye düşündüm, total xp ise bütün xplerin toplamı olacak' })
  @ApiBody({ type: FraudCheckXpDto }) // Specify the DTO class for the request body
  async fraudcheckXP(@Body() checkXpDto: FraudCheckXpDto) {
    return await this.metaplexService.findNftByPublic(checkXpDto.publicKey);
  }




}
