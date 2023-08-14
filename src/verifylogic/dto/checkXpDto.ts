import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CheckXpDto {

    @IsNotEmpty()
    @IsNumber()
    xp: number;


    @IsNotEmpty()
    @IsString()
    publicKey:string;


}

