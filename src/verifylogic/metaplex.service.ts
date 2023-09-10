
import { FindNftsByOwnerOutput, Metaplex, Nft, PublicKey, UploadMetadataInput, bundlrStorage, keypairIdentity, sol, toMetaplexFile } from "@metaplex-foundation/js";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Connection, Keypair, Signer, clusterApiUrl } from "@solana/web3.js";
import { log } from "console";
import { insidePrivateKey, insidePublicKey, solona_offical_key } from "./verifylogic";
import { CustomHttpException } from "src/core/validations/exception";
import axios from "axios";
import fs from "fs";

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

    async createNft(){
        const connection = new Connection("https://api.devnet.solana.com");
        const metaplex = Metaplex.make(connection).use(keypairIdentity( Keypair.fromSecretKey(insidePrivateKey))).use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            }),
        );
;
        const signer : Signer = {
            publicKey: insidePublicKey,
            secretKey: insidePrivateKey
        }

        const nft  = await metaplex.nfts().create({
            uri: "https://qxwnzgl6liix7cmiomihguzie40lbcfq.lambda-url.us-east-1.on.aws",
            name: "My NFTTT",
            sellerFeeBasisPoints: 0, // Represents 5.00%.
            updateAuthority: signer
        },        { commitment: "finalized" },
        );
        return nft;
    }

    async updateNft(){
        const connection = new Connection("https://api.devnet.solana.com");
        const metaplex = Metaplex.make(connection).use(keypairIdentity( Keypair.fromSecretKey(insidePrivateKey))).use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            }),
        );
        const mintAddress = new PublicKey("5RXEH7ehgQBNoeUuyNQkG3JU3dk9S7NUuHSUdnH6mc1V");
        const nft = await metaplex.nfts().findByMint({ mintAddress });
        const { uri: newUri } = await metaplex.nfts().uploadMetadata({
            ...nft.json,
            "name": "Superteam Member NFT",
            "description": "Superteam member NFT",            
        });
        console.log(newUri);

        return await metaplex.nfts().update(
            {
                nftOrSft: nft,
                name: "Updated Name",
                uri: newUri,
                sellerFeeBasisPoints: 0,
            },
            { commitment: "finalized" },
        );

    }





}