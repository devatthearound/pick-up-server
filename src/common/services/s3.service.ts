import { Injectable } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3Service {
  private s3: S3;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const originalName = file.originalname || file.filename || 'file';
    const extension = originalName.split('.').pop() || '';
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}-${originalName}`;

    console.log('S3 업로드 정보:', {
      originalName,
      extension,
      timestamp,
      key,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    try {
      // 파일이 디스크에 저장된 경우
      if (file.path) {
        const fileStream = fs.createReadStream(file.path);
        
        await this.s3.putObject({
          Bucket: this.bucket,
          Key: key,
          Body: fileStream,
          ContentType: file.mimetype,
        });

        // 업로드 완료 후 임시 파일 삭제
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error('임시 파일 삭제 실패:', err);
          }
        });
      } else {
        // 메모리에 있는 경우
        await this.s3.putObject({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });
      }

      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 업로드 실패:', error);
      throw error;
    }
  }
} 