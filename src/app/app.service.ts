import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
// import * as sharp from 'sharp';
import { generateAsync } from 'stability-client';
import GenerateImagesDto from './dtos/generate-images.dto';
import GenerateImagesResponse from './interfaces/generate-images.interface';

@Injectable()
export class AppService {
    async ping(): Promise<void> {
        return;
    }

    async generateImages(dto: GenerateImagesDto): Promise<GenerateImagesResponse> {
        console.log('received request for ', dto);

        try {
            const res: any = await generateAsync({
                prompt: dto.prompt,
                width: dto.width,
                height: dto.height,
                samples: dto.number,
                apiKey: process.env.DREAMSTUDIO_API_KEY,
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
                readPromises.push(this.readBase64(image.filePath));
            }

            try {
                console.log('Awaiting read promises.');
                const data = await Promise.all(readPromises);
                console.log(data);

                for (const base64 of data) {
                    if (base64) {
                        base64Data.push(base64);
                    }
                }
            } catch (e) {
                console.error(e);
                throw new InternalServerErrorException(e);
            }

            const deletePromises = [];

            for (const image of res.images) {
                deletePromises.push(fs.unlink(image.filePath));
            }

            try {
                console.log('Awaiting delete promises.');
                await Promise.all(deletePromises);
            } catch (e) {
                console.error(e);
                for (const image of res.images) {
                    console.error(image.filePath);
                }
            }

            return { base64Data };
        } catch (e) {
            console.error(e);
            throw new InternalServerErrorException(e);
        }
    }

    async readBase64(path: string): Promise<string | undefined> {
        try {
            const base64 = await fs.readFile(path, 'base64');
            return base64;
        } catch (e) {
            console.log('Could not read base64 at path', path);
            return undefined;
        }
    }
}
