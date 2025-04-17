export const KAKAO_TALK_API_URL = 'https://sens.apigw.ntruss.com/alimtalk/v2/services';
export const DEFAULT_COUNTRY_CODE = '+82';
export const DEFAULT_PLUS_FRIEND_ID = '@픽업해';

export const TEMPLATE_CODES = {
  // 주문 접수
  ORDER_RECEIVED: 'ORDER1001',

  // 주문 수락
  PREPARING: 'ORDER1002',

  // 주문 완료
  READY: 'ORDER1003',

  // 픽업 완료
  PICKUP_COMPLETED: 'ORDER1004',

  // 주문 취소
  ORDER_REJECTED: 'ORDER1005',
} as const; 