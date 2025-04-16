import { TEMPLATE_CODES } from '../constants/kakao-talk.constants';
import { KakaoTalkTemplate } from '../types/kakao-talk.types';

export const KAKAO_TALK_TEMPLATES: Record<string, KakaoTalkTemplate> = {
  [TEMPLATE_CODES.SIGN_UP]: {
    templateCode: TEMPLATE_CODES.SIGN_UP,
    templateName: '회원가입 완료',
    templateContent: '{{userName}}님, 픽업해에 가입을 환영합니다!',
    buttons: [
      {
        name: '서비스 이용하기',
        linkType: 'WL',
        linkName: '서비스 이용하기',
        linkMobile: 'https://pickup.com',
        linkPc: 'https://pickup.com',
      },
    ],
  },
  [TEMPLATE_CODES.NEW_SERVICE_REQUEST]: {
    templateCode: TEMPLATE_CODES.NEW_SERVICE_REQUEST,
    templateName: '새로운 서비스 요청',
    templateContent: '{{userName}}님의 새로운 서비스 요청이 접수되었습니다.',
    buttons: [
      {
        name: '요청 확인하기',
        linkType: 'WL',
        linkName: '요청 확인하기',
        linkMobile: 'https://pickup.com/requests/{{requestId}}',
        linkPc: 'https://pickup.com/requests/{{requestId}}',
      },
    ],
  },
  [TEMPLATE_CODES.MATCH_SUCCESS]: {
    templateCode: TEMPLATE_CODES.MATCH_SUCCESS,
    templateName: '서비스 매칭 성공',
    templateContent: '{{userName}}님의 서비스 요청이 매칭되었습니다!',
    buttons: [
      {
        name: '매칭 확인하기',
        linkType: 'WL',
        linkName: '매칭 확인하기',
        linkMobile: 'https://pickup.com/matches/{{matchId}}',
        linkPc: 'https://pickup.com/matches/{{matchId}}',
      },
    ],
  },
  [TEMPLATE_CODES.COMPLETED_SERVICE]: {
    templateCode: TEMPLATE_CODES.COMPLETED_SERVICE,
    templateName: '서비스 완료',
    templateContent: '{{userName}}님의 서비스가 완료되었습니다.',
    buttons: [
      {
        name: '서비스 확인하기',
        linkType: 'WL',
        linkName: '서비스 확인하기',
        linkMobile: 'https://pickup.com/services/{{serviceId}}',
        linkPc: 'https://pickup.com/services/{{serviceId}}',
      },
    ],
  },
  [TEMPLATE_CODES.NEW_MESSAGE]: {
    templateCode: TEMPLATE_CODES.NEW_MESSAGE,
    templateName: '새로운 메시지',
    templateContent: '{{userName}}님에게 새로운 메시지가 도착했습니다.',
    buttons: [
      {
        name: '메시지 확인하기',
        linkType: 'WL',
        linkName: '메시지 확인하기',
        linkMobile: 'https://pickup.com/messages/{{messageId}}',
        linkPc: 'https://pickup.com/messages/{{messageId}}',
      },
    ],
  },
  [TEMPLATE_CODES.AUTO_CLOSED]: {
    templateCode: TEMPLATE_CODES.AUTO_CLOSED,
    templateName: '자동 종료 알림',
    templateContent: '{{userName}}님의 서비스 요청이 자동으로 종료되었습니다.',
    buttons: [
      {
        name: '서비스 확인하기',
        linkType: 'WL',
        linkName: '서비스 확인하기',
        linkMobile: 'https://pickup.com/services/{{serviceId}}',
        linkPc: 'https://pickup.com/services/{{serviceId}}',
      },
    ],
  },
  [TEMPLATE_CODES.CANCELED_SERVICE]: {
    templateCode: TEMPLATE_CODES.CANCELED_SERVICE,
    templateName: '서비스 취소',
    templateContent: '{{userName}}님의 서비스가 취소되었습니다.',
    buttons: [
      {
        name: '서비스 확인하기',
        linkType: 'WL',
        linkName: '서비스 확인하기',
        linkMobile: 'https://pickup.com/services/{{serviceId}}',
        linkPc: 'https://pickup.com/services/{{serviceId}}',
      },
    ],
  },
  [TEMPLATE_CODES.START_SERVICE_MATCHING]: {
    templateCode: TEMPLATE_CODES.START_SERVICE_MATCHING,
    templateName: '서비스 매칭 시작',
    templateContent: '{{userName}}님의 서비스 매칭이 시작되었습니다.',
    buttons: [
      {
        name: '매칭 확인하기',
        linkType: 'WL',
        linkName: '매칭 확인하기',
        linkMobile: 'https://pickup.com/matches/{{matchId}}',
        linkPc: 'https://pickup.com/matches/{{matchId}}',
      },
    ],
  },
  [TEMPLATE_CODES.NEW_APPLICATION]: {
    templateCode: TEMPLATE_CODES.NEW_APPLICATION,
    templateName: '새로운 지원서',
    templateContent: '{{userName}}님에게 새로운 지원서가 도착했습니다.',
    buttons: [
      {
        name: '지원서 확인하기',
        linkType: 'WL',
        linkName: '지원서 확인하기',
        linkMobile: 'https://pickup.com/applications/{{applicationId}}',
        linkPc: 'https://pickup.com/applications/{{applicationId}}',
      },
    ],
  },
  [TEMPLATE_CODES.CLASS_REMINDER]: {
    templateCode: TEMPLATE_CODES.CLASS_REMINDER,
    templateName: '수업 알림',
    templateContent: '{{userName}}님, 오늘 {{className}} 수업이 있습니다.',
    buttons: [
      {
        name: '수업 확인하기',
        linkType: 'WL',
        linkName: '수업 확인하기',
        linkMobile: 'https://pickup.com/classes/{{classId}}',
        linkPc: 'https://pickup.com/classes/{{classId}}',
      },
    ],
  },
  [TEMPLATE_CODES.REQUEST_CLASS_NOTE]: {
    templateCode: TEMPLATE_CODES.REQUEST_CLASS_NOTE,
    templateName: '수업 노트 요청',
    templateContent: '{{userName}}님, 수업 노트를 작성해주세요.',
    buttons: [
      {
        name: '노트 작성하기',
        linkType: 'WL',
        linkName: '노트 작성하기',
        linkMobile: 'https://pickup.com/classes/{{classId}}/notes',
        linkPc: 'https://pickup.com/classes/{{classId}}/notes',
      },
    ],
  },
  [TEMPLATE_CODES.COMPLETE_CLASS_NOTE]: {
    templateCode: TEMPLATE_CODES.COMPLETE_CLASS_NOTE,
    templateName: '수업 노트 완료',
    templateContent: '{{userName}}님의 수업 노트가 작성되었습니다.',
    buttons: [
      {
        name: '노트 확인하기',
        linkType: 'WL',
        linkName: '노트 확인하기',
        linkMobile: 'https://pickup.com/classes/{{classId}}/notes',
        linkPc: 'https://pickup.com/classes/{{classId}}/notes',
      },
    ],
  },
  [TEMPLATE_CODES.REQUEST_REVIEW]: {
    templateCode: TEMPLATE_CODES.REQUEST_REVIEW,
    templateName: '리뷰 요청',
    templateContent: '{{userName}}님, 서비스에 대한 리뷰를 작성해주세요.',
    buttons: [
      {
        name: '리뷰 작성하기',
        linkType: 'WL',
        linkName: '리뷰 작성하기',
        linkMobile: 'https://pickup.com/services/{{serviceId}}/reviews',
        linkPc: 'https://pickup.com/services/{{serviceId}}/reviews',
      },
    ],
  },
}; 