import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

main();

async function main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors();
    app.set('trust proxy', true);
    app.use(helmet());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    await app.listen(process.env.PORT || 3000);
}
