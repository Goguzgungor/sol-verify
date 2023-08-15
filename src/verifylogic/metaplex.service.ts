
import { FindNftsByOwnerOutput, Metaplex, PublicKey, sol } from "@metaplex-foundation/js";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { log } from "console";
import { solona_offical_key } from "./verifylogic";
import { CustomHttpException } from "src/core/validations/exception";
import axios from "axios";

@Injectable()
export class MetaplexService {
  


    async findNftByPublic(publicKey:String){
  const connection = new Connection("https://solana-mainnet.rpc.extrnode.com");
        const metaplex = new Metaplex(connection);
        const nft = await metaplex.nfts().findAllByOwner({
            owner: new PublicKey(publicKey)
        });
        console.log(80);
        let superteamnft = this.nftLogic(nft);
        console.log(80);
        
        if (superteamnft == null) {
            throw new CustomHttpException(HttpStatus.NOT_FOUND,"Superteam Member NFT not found in specific wallet")
        }
        console.log(80);
        log()
        return await this.getMetadata(superteamnft.uri);
    }

    nftLogic(nft:FindNftsByOwnerOutput){
        for (let index = 0; index < nft.length; index++) {
            const element = nft[index];
            if(element.name === "Superteam Member NFT"){
             if(element.symbol === "$TEAM"){
                if(element.updateAuthorityAddress.toBase58() === solona_offical_key){
                    return element;
                }
             }
            }
        }
    }

    async getMetadata(url:string){
        return (await axios.get(url)).data.attributes[0];
    }

}