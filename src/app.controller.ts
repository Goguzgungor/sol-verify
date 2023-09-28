import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  CheckXpDto,
  FraudCheckIdXpDto,
  FraudCheckXpDto,
  GetCompanyNft,
  ManagerWalletDto,
  NewCompanyManagerDto,
  SolUserDto,
} from './dto/checkXpDto';
import { MetaplexService } from './verifylogic/metaplex.service';
import { example_key_values } from './core/test_constant/example_value';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CheckXpHttpException,
  CustomHttpException,
} from './core/validations/exception';
import { HttpAdapterHost } from '@nestjs/core';
import { CreateNFTDto } from './dto/createNFTDto';
import { UpdateNftDto } from './dto/updateNftDto';
import { PublicKey } from '@solana/web3.js';
import { WalletManagerService } from './walletmanaging/wallet.manager.service';
import { toCandyGuard } from '@metaplex-foundation/js';


@Controller()
@ApiTags('solverify') // Define a tag for your controller
export class AppController {
  constructor(
    private readonly appService: AppService,
    private metaplexService: MetaplexService,
    private walletManagerService:WalletManagerService
  ) {
    this.walletManagerService = walletManagerService;
    this.appService = appService;
    this.metaplexService = metaplexService;
  }

  @Post('checkXp') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({ status: 200, description: 'İlk end point' })
  @ApiBody({ type: CheckXpDto }) // Specify the DTO class for the request body
  async checkXp(@Body() checkXpDto: CheckXpDto) {

    if (checkXpDto.companyName === 'TEAM') {
      const xp: any = await this.metaplexService.findNftByPublic(
        checkXpDto.publicKey,
      );
      const numberedXp = Number.parseInt(xp.value);
      const user: SolUserDto = await this.appService.findOrCreateUser(
        checkXpDto.publicKey,
        numberedXp,
      );
      const availableXp = numberedXp - user.spentXp;
      if (availableXp < checkXpDto.xp) {
        const message = `Current xp: ${availableXp} is NOT enough for items xp: ${checkXpDto.xp}`;
        throw new CheckXpHttpException(
          HttpStatus.BAD_REQUEST,
          message,
          availableXp,
        );
      }
      return {
        status: HttpStatus.OK,
        message: `Current xp: ${availableXp} is enough for items xp: ${checkXpDto.xp}`,
        data: {
          availableXp: availableXp,
          ordersXp: checkXpDto.xp,
          userId: user.id,
          publicKey: user.publicId,
        },
      };
    }
    else{
      return this.metaplexService.checkOnChainPayment(checkXpDto);
    }
    
  }

  @Post('/createNFT') // Use a unique route for this endpoint and change to @Post
  @ApiBody({ type: CreateNFTDto }) // Specify the DTO class for the request body
  @ApiResponse({ status: 200, description: 'NFT yaratan end point' })
  async createNFT(@Body() createNFTDto: CreateNFTDto) {
    return this.metaplexService.createNft(createNFTDto);
  }


  @Post('/getCompanyNft') // Use a unique route for this endpoint and change to @Post
  @ApiBody({ type: GetCompanyNft }) // Specify the DTO class for the request body
  @ApiResponse({ status: 200, description: "Belli bir firmanın nftsini getirir." })
  async getSelectedkNft(@Body() getCompanyNft: GetCompanyNft) {
    return this.metaplexService.getCompanysNFT(getCompanyNft);
  }

  
  @Post('/updateNFT') // Use a unique route for this endpoint and change to @Post
  @ApiBody({ type: UpdateNftDto }) // Specify the DTO class for the request body
  @ApiResponse({ status: 200, description: 'NFT güncelleyen end point' })
  async updateNft(@Body() updateNftDto: UpdateNftDto) {
    return this.metaplexService.updateNft(updateNftDto);
  }


  

  @Post('checkOutXp') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({
    status: 200,
    description: '2. check işleminin yapıldığı en point',
  })
  @ApiBody({ type: FraudCheckXpDto }) // Specify the DTO class for the request body
  async createMerchOrder(@Body() fraudcheckXpDto: FraudCheckXpDto) {

    if (fraudcheckXpDto.companyName === 'TEAM') {
      const xp: any = await this.metaplexService.findNftByPublic(
        fraudcheckXpDto.publicKey,
      );
      const numberedXp = Number.parseInt(xp.value);
      const user: SolUserDto = await this.appService.finduser(
        fraudcheckXpDto.publicKey,
      );
      const availableXp = numberedXp - user.spentXp;
      if (availableXp < fraudcheckXpDto.totalXp) {
        const message = `Current xp: ${availableXp} is NOT enough for items xp: ${fraudcheckXpDto.totalXp}`;
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
          publicKey: user.publicId,
        },
      };
    }
    else{
      const checkItem : CheckXpDto={
        xp:fraudcheckXpDto.totalXp,
        publicKey:fraudcheckXpDto.publicKey,
        companyName:fraudcheckXpDto.companyName
      } 
      return this.metaplexService.checkOnChainPayment(checkItem);
    }
  }

  @Get('getWalletsVoxvilNfts/:publicKey')
  @ApiResponse({
    status: 200,
    description: 'Bizim kullanabileceğimiz nftleri getiren end point',
  })
  @ApiParam({
    name: 'publicKey',
    description: 'Kullanıcının publicKeyi.',
    required: true,
    example:'99Grs8xvqrox8Zgcp2AgBVvWTBdBQp37YNgfzwLmsQ1P',
    type: String, // Parametre türü
  })
  async getWalletsVoxvilNfts(@Param('publicKey') publicKey: string) {
    return await this.metaplexService.getWalletsVoxvilNfts(new PublicKey(publicKey));
  }
  @Get('/getAllCompanies')
  @ApiResponse({
    status: 200,
    description: 'Bizim kullanabileceğimiz nftleri getiren end point',
  })
  async getAllCompanies() {
    return await this.walletManagerService.getAllCompanies();
  }


  @Post('fraudcheckXP') // Use a unique route for this endpoint and change to @Post
  @ApiResponse({
    status: 200,
    description:
      'En son konuştuğumuz fraud check enpionti, itemlerin xplerini teker teker almak daha doğru olur diye düşündüm, total xp ise bütün xplerin toplamı olacak',
  })
  @ApiBody({ type: FraudCheckXpDto }) // Specify the DTO class for the request body
  async fraudcheckXP(@Body() fraudcheckXpDto: FraudCheckXpDto) {
    if (fraudcheckXpDto.companyName === 'TEAM') {
      const xp: any = await this.metaplexService.findNftByPublic(
        fraudcheckXpDto.publicKey,
      );
  
      const numberedXp = Number.parseInt(xp.value);
      const user: SolUserDto = await this.appService.finduser(
        fraudcheckXpDto.publicKey,
      );
      const availableXp = numberedXp - user.spentXp;
      if (availableXp < fraudcheckXpDto.totalXp) {
        const message = `Current xp: ${availableXp} is NOT enough for items xp: ${fraudcheckXpDto.totalXp}`;
        throw new CustomHttpException(HttpStatus.BAD_REQUEST, message);
      }
      await this.appService.updateMerchOrder(fraudcheckXpDto, user.id);
      const newSpentXp = user.spentXp + fraudcheckXpDto.totalXp;
      await this.appService.updateUserSpent(user.id, numberedXp, newSpentXp);
      return {
        status: HttpStatus.OK,
        message: `You have spent ${fraudcheckXpDto.totalXp} xp and now you got ${
          numberedXp - newSpentXp
        } xp`,
        data: {
          availableXp: newSpentXp,
          ordersXp: fraudcheckXpDto.totalXp,
          userId: user.id,
          publicKey: user.publicId,
        },
      };
    }
    else{
      const checkItem : CheckXpDto={
        xp:fraudcheckXpDto.totalXp,
        publicKey:fraudcheckXpDto.publicKey,
        companyName:fraudcheckXpDto.companyName
      } 
     return this.metaplexService.fraudCheckOnChainPayment(checkItem);
    }
    
  }
  
  @Post('/createCompanyAndManager')
  @ApiResponse({
    status: 200,
    description:
      'Yeni bir manager ve company kayıt eder.',
  })
  @ApiBody({ type: NewCompanyManagerDto })
  async createManagerWallet(@Body() dto:NewCompanyManagerDto){
    return this.walletManagerService.createNewCompanyManager(dto);
  }



}
