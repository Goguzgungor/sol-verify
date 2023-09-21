import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { example_key_values } from '../../core/test_constant/example_value';

export class CreateNFTDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Member publicKey XP',
    example: example_key_values.publicKey,
  })
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Img url for nft creation',
    example:
      'https://utfs.io/f/7a188f16-cd4a-4a98-8bc1-4979cce9c744_v3_kare_logo.png',
  })
  imgUrl: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Company Enum for nft',
    example: 'ALTC',
  })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password of Comminity Manager',
    example: 'password',
  })
  password: string;



}
