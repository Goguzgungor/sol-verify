import {
  bundlrStorage,
  CreateNftBuilderContext,
  FindNftsByOwnerOutput,
  keypairIdentity,
  Metadata,
  Metaplex,
  Nft,
  PublicKey,
  TransactionBuilder,
  UpdateNftOutput,
} from '@metaplex-foundation/js';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection, Keypair, Signer } from '@solana/web3.js';
import { log } from 'console';
import {
  solona_offical_key,
  stringKeyToKeyPair,
} from './verifylogic';
import { CustomHttpException } from 'src/core/validations/exception';
import axios from 'axios';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { CreateNFTDto } from '../dto/createNFTDto';
import { JustUpdateNftSpendDto, UpdateNftDto } from '../dto/updateNftDto';
import { WalletManagerService } from '../walletmanaging/wallet.manager.service';
import { GetCompanyNft, ManagerQueryDto, AttributeModel, CheckXpDto } from '../dto/checkXpDto';
import { get } from 'http';
import { CheckXpHttpException } from '../core/validations/exception';

import { VoxUserService } from '../user/voxuser.service';
import { VoxUserDto } from 'src/dto/voxUserDto';

@Injectable()
export class MetaplexService {

  constructor(private walletManagerService: WalletManagerService,private voxUserService:VoxUserService) {
    this.walletManagerService = walletManagerService;
    this.voxUserService = voxUserService;
  }
  async findNftByPublic(publicKey: string) {
    const connection = new Connection(
      'https://solana-mainnet.rpc.extrnode.com',
    );
    const metaplex = new Metaplex(connection);
    const nft = await metaplex.nfts().findAllByOwner({
      owner: new PublicKey(publicKey),
    });
    const superteamnft = this.nftLogic(nft);
    if (superteamnft == null) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        'Superteam Member NFT not found in specific wallet',
      );
    }
    log();
    return await this.getMetadata(superteamnft.uri);
  }

  nftLogic(nft: FindNftsByOwnerOutput) {
    for (let index = 0; index < nft.length; index++) {
      const element = nft[index];
      if (element.name === 'Superteam Member NFT') {
        if (element.symbol === '$TEAM') {
          if (
            element.updateAuthorityAddress.toBase58() === solona_offical_key
          ) {
            return element;
          }
        }
      }
    }
  }

  async getMetadata(url: string) {
    return (await axios.get(url)).data.attributes[0];
  }
  async getAttributes(url: string): Promise<any[]> {
    return (await axios.get(url)).data;
  }
  
  async getNftUriBody(url: string): Promise<any> {
    return (await axios.get(url)).data;
  }
  async getWalletsVoxvilNfts(publicKey: PublicKey) {
    const connection = new Connection('https://api.devnet.solana.com');
    const metaplex = new Metaplex(connection);
    const tempList = [];

    const nfts = await metaplex.nfts().findAllByOwner({
      owner: publicKey,
    });
    for (let i = 0; i < nfts.length; i++) {
      const nft = nfts[i] as Metadata;;
      console.log(nft);
      
      const checkManager: ManagerQueryDto = {
        public_id: nft.updateAuthorityAddress.toBase58(),
        company_name: nft.symbol,
        companyfull_name:''
      };
      const isValid = await this.walletManagerService.isMyNftReal(checkManager);
      if (
          isValid.isValid || nft.updateAuthorityAddress.toBase58() === solona_offical_key
      ) {
        const getdatas = await this.getAttributes(nft.uri);
        const object = {
          name: nft.name,
          mintAdress: nft.mintAddress,
          companyName: nft.symbol,
          companyFullName:isValid.companyFullName,
          image: getdatas['image'],
          metadata: getdatas['attributes'],
        };
        tempList.push(object);
      }
    }
    return tempList;
  }

  async checkOnChainPayment(checkXpDto: CheckXpDto){
    const companyItem :GetCompanyNft= {
      company_name:checkXpDto.companyName,
      publicKey:checkXpDto.publicKey
    }
    const nft = await this.getCompanysNFT(companyItem);
    const xpStats = this.getTotalAndSpendXp(nft.metadata);
    console.log(xpStats);
    
    const availableXp = Number(xpStats.currentXp) - Number(xpStats.spendXp);

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
        publicKey: checkXpDto.publicKey,
      },
    };
  }
  async fraudCheckOnChainPayment(checkXpDto: CheckXpDto){
    const companyItem :GetCompanyNft= {
      company_name:checkXpDto.companyName,
      publicKey:checkXpDto.publicKey
    }
    const nft = await this.getCompanysNFT(companyItem);
    const xpStats = this.getTotalAndSpendXp(nft.metadata);
    console.log(xpStats);
    
    const availableXp = Number(xpStats.currentXp) - Number(xpStats.spendXp) - Number(checkXpDto.xp);

    if (availableXp < checkXpDto.xp) {
      const message = `Current xp: ${availableXp} is NOT enough for items xp: ${checkXpDto.xp}`;
      throw new CheckXpHttpException(
        HttpStatus.BAD_REQUEST,
        message,
        availableXp,
      );
    }
    const spendData : JustUpdateNftSpendDto = {
      companyName:checkXpDto.companyName,
      publicId:checkXpDto.publicKey,
      spendXp:checkXpDto.xp.toString(),
    }
    const update= await this.justUpdateNftSpend(spendData);

    return {
      status: HttpStatus.OK,
      message: `Transaction succeed. Available xp: ${availableXp}`,
      data: {
        availableXp: availableXp,
        ordersXp: checkXpDto.xp,
        publicKey: checkXpDto.publicKey,
      },
    };
  }

  async getCompanysNFT(getCompanyNft:GetCompanyNft){
    const connection = new Connection('https://api.devnet.solana.com');
    const metaplex = new Metaplex(connection);

    const nfts:FindNftsByOwnerOutput = await metaplex.nfts().findAllByOwner({
      owner: new PublicKey(getCompanyNft.publicKey),
    });
    for (let i = 0; i < nfts.length; i++) {
      const nft= nfts[i] as Metadata;
      
      const checkManager: ManagerQueryDto = {
        public_id: nft.updateAuthorityAddress.toBase58(),
        company_name: nft.symbol,
        companyfull_name:''
      };
      const isValid = await this.walletManagerService.checkCompanyNft(checkManager);
      
      console.log(nft);
      
      if (
        (isValid.isValid || nft.updateAuthorityAddress.toBase58() === solona_offical_key) && (nft.symbol === getCompanyNft.company_name)
        ) {
          const getdatas = await this.getAttributes(nft.uri);
         return {
          name: nft.name,
          mintAdress: nft.mintAddress.toBase58(),
          companyName: nft.symbol,
          companyFullName:isValid.companyFullName,
          image: getdatas['image'],
          metadata: getdatas['attributes']
        };
      }
    }
    throw new CustomHttpException(404,'There is no such NFT');
  }

  getTotalAndSpendXp(attributes:AttributeModel[]){
    let currentXp;
    let spendXp;
    for (let index = 0; index < attributes.length; index++) {
      
      const element = attributes[index];
      console.log(element);
      
      if (element.trait_type === 'XP') {
        currentXp= element.value;
      }
      if (element.trait_type === 'Spend XP') {
        spendXp= element.value;
      }
    }
    return{
      currentXp: currentXp,
      spendXp:spendXp
    }

  }

  
  async createNft(createNFTDto: CreateNFTDto) {
    const manager = await this.walletManagerService.isManagerValid(createNFTDto.password, createNFTDto.companyName);
    if (manager.isValid) {
      const userData : VoxUserDto = {
        password: 'password',
        publicKey: createNFTDto.publicKey,
        name:createNFTDto.name,
        note:createNFTDto.note,
        companySymbol:createNFTDto.companyName
      }
      await this.voxUserService.createVoxUser(userData);

      const connection = new Connection('https://api.devnet.solana.com');
      const WALLET: Keypair = stringKeyToKeyPair(manager.secretId);
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(WALLET))
        .use(
          bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: 'https://api.devnet.solana.com',
            timeout: 60000,
          }),
        );
      const signer: Signer = {
        publicKey: WALLET.publicKey,
        secretKey: WALLET.secretKey,
      };
      const { uri: newUri } = await metaplex.nfts().uploadMetadata({
        collection: {
          name: 'VOXVIL3',
          family: 'VoxVil3',
        },
        name: 'VoxVil3 NFT',
        description: 'VoxVil3 member NFT',
        symbol: createNFTDto.companyName,
        imageName: createNFTDto.companyName,
        external_url: 'https://voxvil3.com',
        image: createNFTDto.imgUrl,
        attributes: [
          {
            trait_type: 'XP',
            value: '0',
          },
          {
            trait_type: 'Writing XP',
            value: '0',
          },
          {
            trait_type: 'Strategy XP',
            value: '0',
          },
          {
            trait_type: 'Ops XP',
            value: '0',
          },
          {
            trait_type: 'Design XP',
            value: '0',
          },
          {
            trait_type: 'Dev XP',
            value: '0',
          },
          {
            trait_type: 'Video XP',
            value: '0',
          },
          {
            trait_type: 'Spend XP',
            value: '0',
          },
        ],
      });

      const CONFIG = {
        sellerFeeBasisPoints: 0, //500 bp = 5%
        creators: [{ address: WALLET.publicKey, share: 100 }],
        metadata: newUri,
      };
      const transactionBuilder: TransactionBuilder<CreateNftBuilderContext> =
        await metaplex
          .nfts()
          .builders()
          .create({
            updateAuthority: signer,
            tokenOwner: new PublicKey(createNFTDto.publicKey),
            symbol: createNFTDto.companyName,
            mintTokens: true,
            uri: CONFIG.metadata,
            name: 'VOXVIL3 NFT',
            sellerFeeBasisPoints: CONFIG.sellerFeeBasisPoints,
            isMutable: true,
            isCollection: false,
            tokenStandard: TokenStandard.NonFungible,
          });
      const { signature, confirmResponse } = await metaplex
        .rpc()
        .sendAndConfirmTransaction(transactionBuilder);
      if (confirmResponse.value.err) {
        throw new Error('failed to confirm transaction');
      }
      const { mintAddress } = transactionBuilder.getContext();
      
      
      
 
      return {
        mintAddress: mintAddress,
        checkMint:
          'https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet',
      };
    } else {
      throw new CustomHttpException(404, 'We cant found the manager');
    }

  }

  async updateNft(updateData: UpdateNftDto) {
    const manager = await this.walletManagerService.isManagerValid(updateData.password, updateData.companyName);
    
    if (manager.isValid) {
      const connection = new Connection('https://api.devnet.solana.com');
      const WALLET: Keypair = stringKeyToKeyPair(manager.secretId);
          const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(WALLET))
            .use(
              bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: 'https://api.devnet.solana.com',
                timeout: 60000,
              }),
            );
          const mintAddress = new PublicKey(updateData.mintAdress);

          let nft = await metaplex.nfts().findByMint({ mintAddress });
          let nftbody =await this.getNftUriBody(nft.uri);
          const { uri: newUri } = await metaplex.nfts().uploadMetadata({
            collection: nftbody.collection,
            name: nftbody.name,
            description: nftbody.description,
            symbol: nftbody.symbol,
            imageName: nftbody.imageName,
            external_url: 'https://voxvil3.com',
            image:nftbody.image,
            attributes: [
              {
                trait_type: 'XP',
                value: updateData.totalXp,
              },
              {
                trait_type: 'Writing XP',
                value: updateData.writingXp,
              },
              {
                trait_type: 'Strategy XP',
                value: updateData.strategyXp,
              },
              {
                trait_type: 'Ops XP',
                value: updateData.opsXp,
              },
              {
                trait_type: 'Design XP',
                value: updateData.designXp,
              },
              {
                trait_type: 'Dev XP',
                value: updateData.devXp,
              },
              {
                trait_type: 'Video XP',
                value: updateData.videoXp,
              },
              {
                trait_type: 'Spend XP',
                value: updateData.spendXp,
              },
            ],
          });
      
          const update: UpdateNftOutput = await metaplex.nfts().update(
            {
              nftOrSft: nft,
              name: 'VoxVil3 NFT',
              uri: newUri,
              sellerFeeBasisPoints: 0,
            },
            { commitment: 'finalized' },
          );
          nft = await metaplex.nfts().findByMint({ mintAddress });
          return nft.json;
    }else {
      throw new CustomHttpException(404, 'We cant found the manager');
    }
  }


  async justUpdateNftSpend(updateData: JustUpdateNftSpendDto) {
      const connection = new Connection('https://api.devnet.solana.com');
      const WALLET: Keypair = stringKeyToKeyPair((await this.walletManagerService.getSelecetedCompanysSecretKey(updateData.companyName)).secret_id);
      const getcompObj: GetCompanyNft = {
        company_name : updateData.companyName,
        publicKey:updateData.publicId
      };
      const getintedNft = await this.getCompanysNFT(getcompObj);
          const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(WALLET))
            .use(
              bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: 'https://api.devnet.solana.com',
                timeout: 60000,
              }),
            );
          const mintAddress = new PublicKey(getintedNft.mintAdress);

          let nft = await metaplex.nfts().findByMint({ mintAddress });
          let nftbody =await this.getNftUriBody(nft.uri);
    
          const { uri: newUri } = await metaplex.nfts().uploadMetadata({
            collection: nftbody.collection,
            name: nftbody.name,
            description: nftbody.description,
            symbol: nftbody.symbol,
            imageName: nftbody.imageName,
            external_url: 'https://voxvil3.com',
            image:nftbody.image,
            attributes: [
              {
                trait_type: 'XP',
                value: nftbody.attributes[0].value,
              },
              {
                trait_type: 'Writing XP',
                value:  nftbody.attributes[1].value,
              },
              {
                trait_type: 'Strategy XP',
                value:  nftbody.attributes[2].value,
              },
              {
                trait_type: 'Ops XP',
                value:  nftbody.attributes[3].value,
              },
              {
                trait_type: 'Design XP',
                value:  nftbody.attributes[4].value,
              },
              {
                trait_type: 'Dev XP',
                value:  nftbody.attributes[5].value,
              },
              {
                trait_type: 'Video XP',
                value:  nftbody.attributes[6].value,
              },
              {
                trait_type: 'Spend XP',
                value:  (Number(updateData.spendXp)+ Number(nftbody.attributes[7].value)).toString(),
              },
            ],
          });
      
          const update: UpdateNftOutput = await metaplex.nfts().update(
            {
              nftOrSft: nft,
              name: 'VoxVil3 NFT',
              uri: newUri,
              sellerFeeBasisPoints: 0,
            },
            { commitment: 'finalized' },
          );
  }

  // async mintNFT() {
  //   const connection = new Connection('https://api.devnet.solana.com');
  //   const WALLET: Keypair = Keypair.fromSecretKey(insidePrivateKey);
  //   const metaplex = Metaplex.make(connection)
  //     .use(keypairIdentity(WALLET))
  //     .use(
  //       bundlrStorage({
  //         address: 'https://devnet.bundlr.network',
  //         providerUrl: 'https://api.devnet.solana.com',
  //         timeout: 60000,
  //       }),
  //     );
  //   const signer: Signer = {
  //     publicKey: WALLET.publicKey,
  //     secretKey: WALLET.secretKey,
  //   };

  //   const transferTransactionBuilder = await metaplex.nfts().mint({
  //     nftOrSft: {
  //       address: new PublicKey('FapbXFj84pMj7yVbn6jhy9uwagwsLxvSX9uRzWP3ez9x'),
  //       tokenStandard: TokenStandard.NonFungible,
  //     },
  //     toOwner: signer.publicKey,
  //   });
  // }
}
