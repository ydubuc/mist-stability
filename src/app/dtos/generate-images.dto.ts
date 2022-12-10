import {
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export default class GenerateImagesDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    prompt: string;

    // @IsOptional()
    // @IsString()
    // @MaxLength(1000)
    // negative_prompt: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(20)
    cfg_scale: number;

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
    @Max(8)
    number: number;

    @IsOptional()
    @IsNumber()
    @Min(20)
    @Max(50)
    steps: number;

    @IsOptional()
    @IsUrl()
    input_image_url: string;

    @IsOptional()
    @IsString()
    @IsIn([
        'stable-diffusion-v1',
        'stable-diffusion-v1-5',
        'stable-diffusion-512-v2-0',
        'stable-diffusion-768-v2-0',
        'stable-diffusion-512-v2-1',
        'stable-diffusion-768-v2-1',
        // 'stable-inpainting-v1-0',
        // 'stable-inpainting-512-v2-0',
    ])
    engine: string;
}
