import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CheckXpDto, FraudCheckIdXpDto, FraudCheckXpDto, SolUserDto } from './verifylogic/dto/checkXpDto';
import { MetaplexService } from './verifylogic/metaplex.service';
import { example_key_values } from './core/test_constant/example_value';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomHttpException } from './core/validations/exception';
import { HttpAdapterHost } from '@nestjs/core';

@Controller()
@ApiTags('solverify') // Define a tag for your controller
export class AppController {
  constructor(private readonly appService: AppService, private metaplexService: MetaplexService) {
    this.appService = appService;
    this.metaplexService = metaplexService;
  }


  @Post('checkXp') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({ status: 200, description: 'İlk end point' })
  @ApiBody({ type: CheckXpDto }) // Specify the DTO class for the request body
  async checkXp(@Body() checkXpDto: CheckXpDto) {
    let xp: any = await this.metaplexService.findNftByPublic(checkXpDto.publicKey);
    let numberedXp = Number.parseInt(xp.value);
    let user: SolUserDto = await this.appService.findOrCreateUser(checkXpDto.publicKey, numberedXp);
    let availableXp = numberedXp - user.spentXp;
    if (availableXp < checkXpDto.xp) {
      let message: string = `Current xp: ${availableXp} is NOT enough for items xp: ${checkXpDto.xp}`
      throw new CustomHttpException(HttpStatus.BAD_REQUEST, message);
    }
    return {
      status: HttpStatus.OK,
      message: `Current xp: ${availableXp} is enough for items xp: ${checkXpDto.xp}`,
      data: {
        availableXp: availableXp,
        ordersXp: checkXpDto.xp,
        userId: user.id,
        publicKey: user.publicId
      }
    }
  }


  @Post('checkOutXp') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({ status: 200, description: '2. check işleminin yapıldığı en point' })
  @ApiBody({ type: FraudCheckXpDto }) // Specify the DTO class for the request body
  async createMerchOrder(@Body() fraudcheckXpDto: FraudCheckXpDto) {
    let xp: any = await this.metaplexService.findNftByPublic(fraudcheckXpDto.publicKey);
    let numberedXp = Number.parseInt(xp.value);
    let user: SolUserDto = await this.appService.finduser(fraudcheckXpDto.publicKey);
    let availableXp = numberedXp - user.spentXp;
    if (availableXp < fraudcheckXpDto.totalXp) {
      let message: string = `Current xp: ${availableXp} is NOT enough for items xp: ${fraudcheckXpDto.totalXp}`
      throw new CustomHttpException(HttpStatus.BAD_REQUEST, message);
    }
    await this.appService.createMerchOrder(fraudcheckXpDto, user.id);
    return {
      status: HttpStatus.OK,
      message: `Current xp: ${availableXp} is enough for items xp: ${fraudcheckXpDto.totalXp}`,
      data: {
        availableXp: availableXp,
        ordersXp: fraudcheckXpDto.totalXp,
        userId: user.id,
        publicKey: user.publicId
      }
    }
  }


  @Post('fraudcheckXP') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({ status: 200, description: 'En son konuştuğumuz fraud check enpionti, itemlerin xplerini teker teker almak daha doğru olur diye düşündüm, total xp ise bütün xplerin toplamı olacak' })
  @ApiBody({ type: FraudCheckIdXpDto }) // Specify the DTO class for the request body
  async fraudcheckXP(@Body() fraudcheckXpDto: FraudCheckXpDto) {
    let xp: any = await this.metaplexService.findNftByPublic(fraudcheckXpDto.publicKey);

    let numberedXp = Number.parseInt(xp.value);
    let user: SolUserDto = await this.appService.finduser(fraudcheckXpDto.publicKey);
    let availableXp = numberedXp - user.spentXp;
    if (availableXp < fraudcheckXpDto.totalXp) {
      let message: string = `Current xp: ${availableXp} is NOT enough for items xp: ${fraudcheckXpDto.totalXp}`
      throw new CustomHttpException(HttpStatus.BAD_REQUEST, message);
    }
    await this.appService.updateMerchOrder(fraudcheckXpDto, user.id);
    let newSpentXp = user.spentXp+fraudcheckXpDto.totalXp;
    await this.appService.updateUserSpent(user.id,numberedXp,newSpentXp);
    return {
      status: HttpStatus.OK,
      message: `You have spent ${fraudcheckXpDto.totalXp} xp and now you got ${numberedXp-newSpentXp} xp`,
      data: {
        availableXp: newSpentXp,
        ordersXp: fraudcheckXpDto.totalXp,
        userId: user.id,
        publicKey: user.publicId
      }
    }
  }
}
