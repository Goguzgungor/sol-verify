import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsInt, IsDate } from 'class-validator';
import { example_key_values } from "src/core/test_constant/example_value";

export class CheckXpDto {

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'XP amount', example: 100 })
    xp: number;


    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Public key for checking XP', example: example_key_values.publicKey })
    publicKey: string;


}
;

export class FraudCheckXpDto {
    @ApiProperty({ description: 'ID of the order', example: 1 })
    @IsString()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({ description: 'Solana wallet public key', example: example_key_values.publicKey })
    @IsString()
    @IsNotEmpty()
    publicKey: string;

    @ApiProperty({
        description: 'Merch Dto', example: [{
            xp: 100,
            merchId: 1
        }]
    })
    merch: MerchDto[]

    @ApiProperty({ description: "Total Xp Cost", example: 100 })
    @IsNumber()
    @IsNotEmpty()
    totalXp: number;

}
export class FraudCheckIdXpDto {
    @ApiProperty({ description: 'ID of the order', example: 1 })
    @IsString()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({ description: 'Solana wallet public key', example: example_key_values.publicKey })
    @IsString()
    @IsNotEmpty()
    publicKey: string;

    @ApiProperty({
        description: 'Merch Dto', example: [{
            xp: 100,
            merchId: 1
        }]
    })
    merch: MerchDto[]

    @ApiProperty({ description: "Total Xp Cost", example: 100 })
    @IsNumber()
    @IsNotEmpty()
    totalXp: number;
    
    
    @ApiProperty({ description: "User's ıd", example: 2})
    @IsNumber()
    @IsNotEmpty()
    userId: number;

}

export class MerchDto {

    @ApiProperty({ description: 'Xp amaount of merch', example: 100 })
    @IsNumber()
    @IsNotEmpty()
    xp: number;

    @ApiProperty({ description: "Merch's id", example: 100 })
    @IsNumber()
    @IsNotEmpty()
    merchId: number;
}

export class SolUserDto {
    @IsOptional()
    @IsInt()
    id: number;
  
    @IsOptional()
    @IsInt()
    totalXp: number;
  
    @IsOptional()
    @IsInt()
    spentXp: number;
  
    @IsOptional()
    @IsDate()
    createdAt: Date;
  
    @IsOptional()
    @IsDate()
    lastOperationAt: Date;
  
    @IsOptional()
    @IsString()
    publicId: string;
  }




