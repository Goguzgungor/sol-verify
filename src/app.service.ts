import { HttpStatus, Injectable } from '@nestjs/common';
import { DbService } from './core/db/db.service';
import { CustomHttpException } from './core/validations/exception';
import { log } from 'console';
import { CreateSecp256k1InstructionWithPublicKeyParams } from '@solana/web3.js';
import {
  SolUserDto,
  FraudCheckXpDto,
  MerchDto,
} from './dto/checkXpDto';

@Injectable()
export class AppService {
  constructor(private dbService: DbService) {}

  async findOrCreateUser(publicKey: string, totalXp: number) {
    let user;

    try {
      user = await this.dbService.solUser.findFirstOrThrow({
        where: { publicId: publicKey },
      });
      return user;
    } catch (e) {
      const solUser: SolUserDto = new SolUserDto();
      solUser.createdAt = new Date();
      solUser.lastOperationAt = new Date();
      solUser.publicId = publicKey;
      solUser.spentXp = 0;
      solUser.totalXp = totalXp;
      user = await this.dbService.solUser.create({ data: solUser });
      return user;
    }
  }
  async finduser(publicKey: string) {
    let user;
    try {
      user = await this.dbService.solUser.findFirstOrThrow({
        where: { publicId: publicKey },
      });
      return user;
    } catch (e) {
      throw new CustomHttpException(HttpStatus.NOT_FOUND, 'User not found');
    }
  }

  async createMerchOrder(fraudCheckXpDto: FraudCheckXpDto, userId: number) {
    let user: SolUserDto;
    const merchList: MerchDto[] = fraudCheckXpDto.merch;
    const merchData = merchList.map((merch) => {
      return {
        merchId: merch.merchId,
        userId: userId,
        orderStartAt: new Date(),
        merchXpCost: merch.xp,
        orderStatusId: 1,
        orderId: fraudCheckXpDto.orderId,
      };
    });
    await this.dbService.merchOrder.createMany({ data: merchData });
  }
  async updateUserSpent(userId: number, totalXp: number, spentXp: number) {
    return await this.dbService.solUser.update({
      data: { spentXp: spentXp, totalXp: totalXp },
      where: { id: userId },
    });
  }

  async updateMerchOrder(fraudCheckXpDto: FraudCheckXpDto, userId: number) {
    let user: SolUserDto;
    await this.dbService.merchOrder.updateMany({
      where: {
        orderId: fraudCheckXpDto.orderId,
      },
      data: {
        orderConfirmAt: new Date(),
        orderStatusId: 2,
      },
    });
  }
}
