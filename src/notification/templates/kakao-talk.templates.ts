import { TEMPLATE_CODES } from '../constants/kakao-talk.constants';
import { KakaoTalkTemplate } from '../types/kakao-talk.types';

export const KAKAO_TALK_TEMPLATES: Record<string, KakaoTalkTemplate> = {
  [TEMPLATE_CODES.PREPARING]: {
    templateCode: TEMPLATE_CODES.PREPARING,
    templateName: '주문수락',
    templateContent: `[{{storeName}}] 주문수락

주문번호: {{orderNumber}}
{{orderName}} 메뉴가 준비중입니다.
{{time}}분 후 방문해주세요.

※ 매장 운영 사정에 따라 준비시간이 변경될 수 있습니다.`,
    buttons: [
      {
        name: '주문 확인하기',
        linkType: 'WL',
        linkName: '주문 확인하기',
        linkMobile: 'https://www.ezpickup.kr/#{link}',
        linkPc: 'https://www.ezpickup.kr/#{link}',
      },
    ],
  },
  [TEMPLATE_CODES.READY]: {
    templateCode: TEMPLATE_CODES.READY,
    templateName: '주문완료',
    templateContent: `[{{storeName}}] 준비완료

주문번호: {{orderNumber}}
주문하신 메뉴가 준비 완료되었습니다.
매장으로 방문해주세요.

감사합니다.`,
    buttons: [
      {
        name: '주문 확인하기',
        linkType: 'WL',
        linkName: '주문 확인하기',
        linkMobile: 'https://www.ezpickup.kr/#{link}',
        linkPc: 'https://www.ezpickup.kr/#{link}',
      },
    ],
  },
  [TEMPLATE_CODES.ORDER_REJECTED]: {
    templateCode: TEMPLATE_CODES.ORDER_REJECTED,
    templateName: '주문취소',
    templateContent: `[{{storeName}}] 주문취소 안내

{{customerName}}고객님, 죄송합니다.
주문번호 {{orderNumber}}가 아래 사유로 취소되었습니다.

▶ 취소사유: {{reason}}

다음에 더 나은 서비스로 찾아뵙겠습니다.
감사합니다.`,
    buttons: [
      {
        name: '주문 확인하기',
        linkType: 'WL',
        linkName: '주문 확인하기',
        linkMobile: 'https://www.ezpickup.kr/#{link}',
        linkPc: 'https://www.ezpickup.kr/#{link}',
      },
    ],
  },
  [TEMPLATE_CODES.PICKUP_COMPLETED]: {
    templateCode: TEMPLATE_CODES.PICKUP_COMPLETED,
    templateName: '픽업완료',
    templateContent: `[{{storeName}}] 픽업완료

주문번호: {{orderNumber}}
픽업이 완료되었습니다.
이용해주셔서 감사합니다. 맛있게 드세요!`
  },
}; 
