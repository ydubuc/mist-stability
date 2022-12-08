import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sharp from 'sharp';
import { generateAsync } from 'stability-client';
import GenerateImagesDto from './dtos/generate-images.dto';
import GenerateImagesResponse, { GenerateImageData } from './interfaces/generate-images.interface';

@Injectable()
export class AppService {
    async ping(): Promise<void> {
        return;
    }

    async generateImages(dto: GenerateImagesDto): Promise<GenerateImagesResponse> {
        try {
            const res: any = await generateAsync({
                prompt: dto.prompt,
                steps: dto.steps ?? 50,
                width: dto.width,
                height: dto.height,
                samples: dto.number,
                engine: dto.engine ?? 'stable-diffusion-v1-5',
                apiKey: process.env.DREAMSTUDIO_API_KEY,
                noStore: true,
                // imagePrompt: {
                //     mime: string;
                //     content: Buffer;
                //     mask?: {
                //         mime: string;
                //         content: Buffer;
                //     },
                // }
            });

            if (!res.images || !res.images.length) {
                console.error('No images were generated.');
                throw new InternalServerErrorException('No images were generated.');
            }

            const promises = [];

            for (const image of res.images) {
                promises.push(this.readImageData(image));
            }

            const data: GenerateImageData[] = [];

            try {
                const generateImagesData = await Promise.all(promises);

                for (const generateImageData of generateImagesData) {
                    if (generateImageData) {
                        data.push(generateImageData);
                    }
                }
            } catch (e) {
                console.error(e);
                throw new InternalServerErrorException({ cause: e.toString() });
            }

            return { data };
        } catch (e) {
            console.error(dto);
            console.error(e);
            throw new InternalServerErrorException({ cause: e.toString() });
        }
    }

    async readImageData(image: any): Promise<GenerateImageData | undefined> {
        try {
            const base64 = await this.readBase64(image.buffer);
            const seed = image.seed.toString();

            return {
                base64,
                seed,
            };
        } catch (e) {
            return undefined;
        }
    }

    async readBase64(buffer: Buffer): Promise<string | undefined> {
        try {
            const webpBuffer = await sharp(buffer).webp({ lossless: true }).toBuffer();
            return webpBuffer.toString('base64');
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }
}
