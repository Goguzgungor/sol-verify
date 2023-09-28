import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

import { DbService } from "../core/db/db.service"; // managerWalletDto'yu ekleyin
import { ManagerQueryDto, ManagerWalletDto, NewCompanyManagerDto } from 'src/dto/checkXpDto';
import { stringKeyToKeyPair } from 'src/verifylogic/verifylogic';
import { log } from 'console';
import { Connection, Keypair } from '@solana/web3.js';
import { CustomHttpException } from 'src/core/validations/exception';
import { VoxUserDto } from 'src/dto/voxUserDto';

@Injectable()
export class VoxUserService {
  [x: string]: any;
  constructor(private prisma: DbService,) {}

  async createVoxUser(data: VoxUserDto) {
    return this.prisma.voxuser.create({
      data:{
        publickey:data.publicKey,
        name:data.name,
        password:data.password,
        note:data.note,
        companySymbol:data.companySymbol,
        createdat:new Date()
      }
    });
  }

  async findVoxUserByPublicKey(publickey: string,companySymbol:string) {
    return this.prisma.voxuser.findFirst({
      where: { publickey: publickey ,companySymbol:companySymbol}
    });
  }

  async updateVoxUser(id: number, data: VoxUserDto) {
    return this.prisma.voxuser.update({
      where: { id },
      data:{
        publickey:data.publicKey,
        name:data.name,
        password:data.password,
        note:data.note,
        createdat:new Date()
      }
    });
  }

  async deleteVoxUser(id: number) {
    return this.prisma.voxuser.delete({
      where: { id },
    });
  }
}
