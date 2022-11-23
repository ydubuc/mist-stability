import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export default class GenerateImagesDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    prompt: string;

    @IsNotEmpty()
    @IsNumber()
    @Max(1024)
    width: number;

    @IsNotEmpty()
    @IsNumber()
    @Max(1024)
    height: number;

    @IsNotEmpty()
    @IsNumber()
    @Max(4)
    number: number;

    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(100)
    steps: number;
}
