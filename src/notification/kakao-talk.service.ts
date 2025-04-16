import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import crypto from 'crypto';
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
          buttons: template.buttons.map(button => ({
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

  // 템플릿 메시지 생성 함수들
  signUpComplete(userName: string): string {
    return `환영합니다 ${userName}님, 회원가입이 완료되었어요! 지금바로 [느린걸음플러스]의 서비스를 이용해보세요!`;
  }

  newServiceRequestMessage(userName: string, className: string, classDate: string, classTime: string): string {
    return `수업요청${userName} 선생님, 새로운 수업요청이 등록되었어요. 지금 바로 확인해보세요!

수업요청 : ${className}
날짜 : ${classDate}
시간 : ${classTime}`;
  }

  matchSuccess(className: string, classDate: string, classTime: string, address: string): string {
    return `<서비스예약 안내>
안녕하세요. 느린걸음플러스입니다. 예약된 서비스 안내드립니다.

예약내역 : ${className}
날짜 : ${classDate}
시간 : ${classTime}
장소 : ${address}`;
  }

  completedServiceMessage(
    name: string,
    teacherName: string,
    className: string,
    classDate: string,
    classTime: string,
    totalClassNumber: number
  ): string {
    return `[수업 완료 안내]

안녕하세요, ${name}님
신청하신 수업이 완료되어 안내 드립니다.

■ 수업 정보
강사명: ${teacherName}
수업명: ${className}
예약일시: ${classDate} ${classTime} 외 ${totalClassNumber}건

■ 안내사항
- 새로운 일정으로 수업을 원하시면 앱에서 예약 가능합니다
- 관련 문의사항은 언제든 고객센터로 연락 주세요`;
  }

  newMessageNotification(name: string): string {
    return `[새로운 메세지]

${name}님, 신청하신 프로그램 일정 관련 선생님의 메시지가 도착했습니다.

﹣
답변을 확인하시려면 아래 버튼을 눌러주세요.`;
  }

  autoClosedServiceMessage(
    name: string,
    className: string,
    classDate: string,
    classTime: string,
    totalClassNumber: number
  ): string {
    return `[수업 자동 마감]

${name}님, 요청하신 수업 매칭이 완료되지 않아 자동 마감되었습니다.

■ 수업 정보
수업명: ${className}
예약일시: ${classDate} ${classTime} 외 ${totalClassNumber}건

■ 마감 사유
요청하신 시간 내 매칭 가능한 강사님을 찾지 못했습니다.

다음 번 더 나은 서비스를 제공하겠습니다. 불편을 끼쳐드려 죄송합니다.`;
  }

  canceledServiceMessage(
    name: string,
    teacherName: string,
    className: string,
    classDate: string,
    classTime: string,
    cancelReason: string
  ): string {
    return `[수업 미진행 안내]

안녕하세요, ${name}님
수업이 미진행되어 안내 드립니다.

■ 수업 정보
강사명: ${teacherName}
수업명: ${className}
예약일시: ${classDate} ${classTime}

■ 미진행 사유
${cancelReason}

■ 안내사항
- 새로운 일정으로 수업을 원하시면 앱에서 예약 가능합니다
- 관련 문의사항은 언제든 고객센터로 연락 주세요`;
  }

  startServiceMatchingMessage(
    name: string,
    serviceName: string,
    serviceDates: string,
    serviceTimes: string,
    endTime: string
  ): string {
    return `${name}보호자님, 요청하신 서비스가 등록되었어요. 파트너가 지원하면 알려드릴께요.

내용 : ${serviceName}
날짜 : ${serviceDates}
시간 : ${serviceTimes}

*${endTime} 까지 매칭이 이루어지지 않으면 자동으로 취소됩니다.`;
  }

  startServiceMatchingMessageV3(
    name: string,
    serviceName: string,
    firstServiceDate: string,
    startTime: string,
    endTime: string,
    totalClassNumber: number,
    scheduledAt: string
  ): string {
    return `[느린걸음] 서비스 등록

안녕하세요, ${name}님,
요청하신 서비스가 등록되었습니다. 파트너가 지원하면 알려드릴께요.

■ 신청정보
﹒서비스: ${serviceName}
﹒예약날짜: ${firstServiceDate} 외 ${totalClassNumber}건
﹒예약시간: ${startTime} - ${endTime}

*${scheduledAt} 까지 매칭된 파트너가 없으면 자동으로 취소됩니다.`;
  }

  newApplicationMessage(serviceName: string, partnerName: string, endTime: string): string {
    return `요청하신 ${serviceName} 서비스에 ${partnerName} 파트너가 지원했습니다. 지금 바로 확인해주세요!

예약을 확정하지 않으면 ${endTime} 자동으로 취소됩니다. 서둘러 예약을 확정해주세요!`;
  }

  newServiceRequestMessageV2(
    name: string,
    serviceName: string,
    serviceDates: string,
    serviceTimes: string,
    totalClassNumber: number
  ): string {
    return `[수업 신청 안내]

안녕하세요, ${name} 강사님
새로운 수업이 등록되었습니다. 지금 바로 확인해보세요!

■ 수업 정보
수업명: ${serviceName}
일시: ${serviceDates} ${serviceTimes} 외 ${totalClassNumber}건

아래 버튼 클릭 후 수업 상세 내용을 확인하실 수 있습니다.`;
  }

  classReminder(
    className: string,
    remainingMinutes: string,
    classDate: string,
    classTime: string,
    address: string
  ): string {
    return `안녕하세요! ${className}이 ${remainingMinutes} 후에 시작됩니다.

예약내역 : ${className}
날짜 : ${classDate}
시간 : ${classTime}
장소 : ${address}`;
  }

  requestClassNote(userName: string, className: string, classDate: string): string {
    return `안녕하세요 선생님! 보호자가 수업일지를 요청했습니다.

${classDate}일 ${userName}님의 언어재활 수업일지를 작성해주세요!
    
* 수업일지를 완료하지 않으면 서비스완료가 불가합니다.
*서비스 미완료시 정산금 지급이 어렵습니다.`;
  }

  completeClassNote(): string {
    return '안녕하세요! 새로운 수업일지가 등록되었습니다. 확인부탁드립니다.';
  }

  requestReview(userName: string): string {
    return `후기를 기다리고 있어요!
안녕하세요! ${userName} 선생님 수업은 어떠셨나요? 많은 분들께 도움이 될 수 있도록 후기를 공유해주세요!`;
  }
} 