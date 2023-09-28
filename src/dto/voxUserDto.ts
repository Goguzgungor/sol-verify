import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class VoxUserDto {
    @ApiProperty({ description: 'Public Key', example: '99Grs8xvqrox8Zgcp2AgBVvWTBdBQp37YNgfzwLmsQ1P' })
    @IsString()
    @IsNotEmpty()
    publicKey: string;
  
    @ApiProperty({ description: 'Name', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({ description: 'Note', example: 'Additional information' })
    @IsString()
    @IsOptional()
    note?: string;

    @ApiProperty({ description: 'Password', example: 'somepassword' })
    @IsString()
    @IsNotEmpty()
    password: string;
  
    @ApiProperty({ description: 'Password', example: 'somepassword' })
    @IsString()
    @IsNotEmpty()
    companySymbol: string;
  }
  