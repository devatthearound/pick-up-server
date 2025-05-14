import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

export { redisClient }

let redisClient;

export async function initializeRedis(configService: ConfigService) {
    redisClient = createClient({ 
        socket: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
        },
        password: configService.get('redis.password'),
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    try {
        await redisClient.connect();
        console.log('Redis connected successfully');
    } catch (error) {
        console.error('Redis connection error:', error);
        throw error;
    }
}

// 점검 필요
// await redisClient.connect(); 에서 await 삭제