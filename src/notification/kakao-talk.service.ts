import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { TEMPLATE_CODES } from './constants/kakao-talk.constants';
import { KAKAO_TALK_TEMPLATES } from './templates/kakao-talk.templates';
import { KakaoTalkRequest, KakaoTalkResponse } from './types/kakao-talk.types';

@Injectable()
export class KakaoTalkService {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly serviceId: string;
  private readonly plusFriendId: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accessKey = this.configService.get<string>('KAKAO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('KAKAO_SECRET_KEY');
    const serviceId = this.configService.get<string>('KAKAO_SERVICE_ID');
    const plusFriendId = this.configService.get<string>('KAKAO_PLUS_FRIEND_ID');

    if (!accessKey || !secretKey || !serviceId || !plusFriendId) {
      throw new Error('카카오톡 알림톡 설정이 올바르지 않습니다.');
    }

    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.serviceId = serviceId;
    this.plusFriendId = plusFriendId;
    this.apiUrl = 'https://sens.apigw.ntruss.com/alimtalk/v2/services';
  }

  private generateSignature(timestamp: string): string {
    const message = `POST /alimtalk/v2/services/${this.serviceId}/messages\n${timestamp}\n${this.accessKey}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('base64');
    return signature;
  }

  private replaceTemplateVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  async sendMessage(
    templateCode: string,
    phoneNumber: string,
    variables: Record<string, string>,
  ): Promise<KakaoTalkResponse> {
    const template = KAKAO_TALK_TEMPLATES[templateCode];
    if (!template) {
      throw new Error(`Template not found: ${templateCode}`);
    }

    const timestamp = Date.now().toString();
    const signature = this.generateSignature(timestamp);

    const request: KakaoTalkRequest = {
      countryCode: '+82',
      plusFriendId: this.plusFriendId,
      templateCode: template.templateCode,
      messages: [
        {
          to: phoneNumber,
          content: this.replaceTemplateVariables(template.templateContent, variables),
          buttons: template.buttons?.map(button => ({
            ...button,
            linkMobile: this.replaceTemplateVariables(button.linkMobile, variables),
            linkPc: this.replaceTemplateVariables(button.linkPc, variables),
          })),
        },
      ],
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.serviceId}/messages`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-ncp-apigw-timestamp': timestamp,
            'x-ncp-iam-access-key': this.accessKey,
            'x-ncp-apigw-signature-v2': signature,
          },
        },
      );

      return {
        success: true,
        status: response.status,
        message: '메시지가 성공적으로 전송되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || '메시지 전송에 실패했습니다.',
      };
    }
  }
} 