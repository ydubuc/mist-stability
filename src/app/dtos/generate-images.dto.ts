import {
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

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
    @Max(50)
    steps: number;

    @IsOptional()
    @IsString()
    @IsIn([
        'stable-diffusion-v1',
        'stable-diffusion-v1-5',
        'stable-diffusion-512-v2-0',
        'stable-diffusion-768-v2-0',
        // 'stable-inpainting-v1-0',
        // 'stable-inpainting-512-v2-0',
    ])
    engine: string;
}
