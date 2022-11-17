import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import GenerateImagesDto from './dtos/generate-images.dto';
import GenerateImagesResponse from './interfaces/generate-images.interface';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    async ping(): Promise<void> {
        return this.appService.ping();
    }

    @Post('images/generate')
    async generateImages(
        @Headers('Authorization') bearerToken: string,
        @Body() dto: GenerateImagesDto,
    ): Promise<GenerateImagesResponse> {
        if (!bearerToken) {
            throw new UnauthorizedException('Missing authorization token.');
        }

        if (bearerToken !== `Bearer ${process.env.MIST_STABILITY_API_KEY}`) {
            throw new UnauthorizedException('Invalid authorization token.');
        }

        return this.appService.generateImages(dto);
    }
}
