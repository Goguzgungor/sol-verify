import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNftDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Mint adress of the nft',
    example: 'GhtsSryapHsVbVWLJC1NRH5uHRDwXiTkCbEPNU4NF8DG',
  })
  mintAdress: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Company Enum for nft',
    example: 'SPT',
  })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password',
    example: 'somepassword',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  totalXp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  writingXp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  strategyXp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  opsXp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  designXp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  devXp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  videoXp: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  spendXp: string;
}
export class JustUpdateNftSpendDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Mint adress of the nft',
    example: 'GhtsSryapHsVbVWLJC1NRH5uHRDwXiTkCbEPNU4NF8DG',
  })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Xp attribute',
    example: '0',
  })
  spendXp: string;

  publicId:string;
}
