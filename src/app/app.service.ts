import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as sharp from 'sharp';
import { generateAsync } from 'stability-client';
import GenerateImagesDto from './dtos/generate-images.dto';
import GenerateImagesResponse from './interfaces/generate-images.interface';

@Injectable()
export class AppService {
    async ping(): Promise<void> {
        return;
    }

    async generateImages(dto: GenerateImagesDto): Promise<GenerateImagesResponse> {
        console.log('NEW REQUEST');
        console.log(dto);

        try {
            const res: any = await generateAsync({
                prompt: dto.prompt,
                steps: 40,
                width: dto.width,
                height: dto.height,
                samples: dto.number,
                apiKey: process.env.DREAMSTUDIO_API_KEY,
                noStore: true,
            });

            if (!res.res || !res.res.isOk) {
                console.error('Response was not ok.');
                throw new InternalServerErrorException('Response was not ok.');
            }

            if (!res.images || !res.images.length) {
                console.error('No images were generated.');
                throw new InternalServerErrorException('No images were generated.');
            }

            const base64Data: string[] = [];

            const readPromises = [];

            for (const image of res.images) {
                readPromises.push(this.readBase64(image.buffer));
            }

            try {
                const data = await Promise.all(readPromises);

                for (const base64 of data) {
                    if (base64) {
                        base64Data.push(base64);
                    }
                }
            } catch (e) {
                console.error(e);
                throw new InternalServerErrorException(e);
            }

            return { base64Data };
        } catch (e) {
            console.error(e);
            throw new InternalServerErrorException(e);
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
