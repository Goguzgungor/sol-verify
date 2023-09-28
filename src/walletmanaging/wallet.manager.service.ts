import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

import { DbService } from "../core/db/db.service"; // managerWalletDto'yu ekleyin
import { ManagerQueryDto, ManagerWalletDto, NewCompanyManagerDto } from 'src/dto/checkXpDto';
import { stringKeyToKeyPair } from 'src/verifylogic/verifylogic';
import { log } from 'console';
import { Connection, Keypair } from '@solana/web3.js';
import { CustomHttpException } from 'src/core/validations/exception';

@Injectable()
export class WalletManagerService {
  constructor(
    private dbService: DbService,
  ) {}

  // Yeni bir cüzdan oluştur
  async createManagerWallet(walletData: ManagerWalletDto): Promise<ManagerWalletDto> {
    
    const wallet = this.dbService.managerwallets.create({data:{
      password:walletData.password,
      created_at: new Date(),
      company_name:walletData.company_name,
      public_id:walletData.public_id,
      secret_id:walletData.secret_id
    }});
    return wallet;
  }
  async createNewCompanyManager(walletData: NewCompanyManagerDto): Promise<ManagerWalletDto> {
    const keypair: Keypair = Keypair.generate();
    const checkFirm = await this.dbService.managerwallets.findFirst({where:{
      company_name:walletData.company_name
    }})

    if (!checkFirm) {
      const wallet = await this.dbService.managerwallets.create({data:{
        password:walletData.password,
        created_at: new Date(),
        company_name:walletData.company_name,
        companyfull_name: walletData.companyfull_name,
        public_id:keypair.publicKey.toBase58(),
        secret_id:keypair.secretKey.toString(),
      }});
      return wallet;
    }
    else{
      throw new CustomHttpException(404,'There is already a firm with this symbol');
    }
  }

  // Tüm cüzdanları getir
  async getAllWallets(): Promise<ManagerWalletDto[]> {
    return await this.dbService.managerwallets.findMany();
  }

  // Belirli bir cüzdanı ID'ye göre getir
  async getWalletById(walletId: number): Promise<ManagerWalletDto> {
    const wallet = await this.dbService.managerwallets.findUnique({where:{
      id:walletId
    }});
    if (!wallet) {
      throw new NotFoundException(`Cüzdan bulunamadı`);
    }
    return wallet;
  }
  
  async getAllCompanies() {
    const companys = await this.dbService.managerwallets.findMany({select:{
      id:true,
      company_name:true,
      companyfull_name:true,
      public_id:true
    }});
    if (!companys) {
      throw new NotFoundException(`Cüzdan bulunamadı`);
    }
    return companys;
  }
  // Cüzdanı güncelle
  async updateWallet(walletId: number, walletData: ManagerWalletDto): Promise<ManagerWalletDto> {
    return await this.dbService.managerwallets.update({where:{
      id:walletId
    },data:walletData});
  }

  // Cüzdanı sil
  async deleteWallet(walletId: number): Promise<void> {
    await this.dbService.managerwallets.delete({where:{
      id:walletId
    }});
  }

  async isMyNftReal(dto:ManagerQueryDto){
    const managerDatas : ManagerQueryDto[] = await this.getAllCompanyNameAndPublicKey();
    for (let index = 0; index < managerDatas.length; index++) {
      const element = managerDatas[index];
      if (element.public_id === dto.public_id && element.company_name === dto.company_name) {
        return {isValid:true,companyFullName:element.companyfull_name};
      }      
    }
    return {isValid:false,companyFullName:''};
  }
  async checkCompanyNft(dto:ManagerQueryDto){
    const managerData : ManagerQueryDto = await this.getSelecetedCompany(dto.company_name);

      if (managerData.public_id === dto.public_id && managerData.company_name === dto.company_name) {
        return {isValid:true,companyFullName:managerData.companyfull_name};
      }
      
    return {isValid:false,companyFullName:''};
  }

  async isManagerValid(password:string,company_name:string){
    const manager= await this.dbService.managerwallets.findFirst({
      where:{
        password:password,
        company_name:company_name
      }
    });

    if (manager) {
      return {
        isValid: true,
        secretId: manager.secret_id,
        companyfull_name:manager.companyfull_name
      };
    }
    else{
      return {
        isValid: false,
        secretId: null
      };
    }
  }
  async getAllCompanyNameAndPublicKey():Promise<ManagerQueryDto[]>{
    return await this.dbService.managerwallets.findMany(
      {
        select:{
          public_id:true,
          company_name:true,
          companyfull_name:true
        }
      }
    );
  }
  
  
  async getSelecetedCompany(companyName:string):Promise<ManagerQueryDto>{
    return await this.dbService.managerwallets.findFirst(

      {
        select:{
          public_id:true,
          company_name:true,
          companyfull_name:true
        },where:{company_name:companyName}
      }
    );
  }
  async getSelecetedCompanysSecretKey(companyName:string){
    return await this.dbService.managerwallets.findFirst(

      {
        select:{
          secret_id:true
        },where:{company_name:companyName}
      }
    );
  }

}
