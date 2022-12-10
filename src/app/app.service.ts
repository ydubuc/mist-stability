import { Injectable, InternalServerErrorException } from '@nestjs/common';
import fetch from 'node-fetch';
import { generateAsync } from 'stability-client';
import GenerateImagesDto from './dtos/generate-images.dto';
import GenerateImagesResponse, { GenerateImageData } from './interfaces/generate-images.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

@Injectable()
export class AppService {
    async ping(): Promise<void> {
        return;
    }

    async generateImages(dto: GenerateImagesDto): Promise<GenerateImagesResponse> {
        try {
            let imagePrompt: { mime: string; content: Buffer } | undefined;

            if (dto.input_image_url) {
                const buffer = await this.readBufferFromUrlWithRetry(dto.input_image_url, 3, 0);
                if (!buffer) {
                    throw new InternalServerErrorException('Failed to get buffer.');
                }
                const webpBuffer = await this.convertBufferToWebpBuffer(buffer);
                if (!webpBuffer) {
                    throw new InternalServerErrorException('Failed to get webp buffer.');
                }

                imagePrompt = {
                    mime: 'image/webp',
                    content: webpBuffer,
                };
            }

            const res: any = await generateAsync({
                prompt: dto.prompt,
                steps: dto.steps ?? 50,
                cfgScale: dto.cfg_scale,
                width: dto.width,
                height: dto.height,
                samples: dto.number,
                engine: dto.engine ?? 'stable-diffusion-v1-5',
                apiKey: process.env.DREAMSTUDIO_API_KEY,
                noStore: true,
                imagePrompt: imagePrompt ?? undefined,
            });

            if (!res.res.isOk) {
                throw new InternalServerErrorException({ cause: `not ok: ${res.res.message}` });
            }

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
            const realizedAction = image.classifications.realizedAction;
            const censored = realizedAction === 4;

            if (censored) {
                return undefined;
            }

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
            const webpBuffer = await this.convertBufferToWebpBuffer(buffer);
            return webpBuffer.toString('base64');
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    async convertBufferToWebpBuffer(buffer: Buffer): Promise<Buffer | undefined> {
        try {
            const webpBuffer = await sharp(buffer).webp({ lossless: true }).toBuffer();
            return webpBuffer;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    async readBufferFromUrlWithRetry(
        url: string,
        maxRetries: number,
        iteration: number,
    ): Promise<Buffer | undefined> {
        try {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (e) {
            if (iteration < maxRetries) {
                return this.readBufferFromUrlWithRetry(url, maxRetries, iteration + 1);
            } else {
                console.error(e);
                return undefined;
            }
        }
    }
}
