export interface KakaoTalkConfig {
  accessKey: string;
  secretKey: string;
  serviceId: string;
  plusFriendId: string;
}

export interface KakaoTalkResponse {
  success: boolean;
  status: number;
  message: string;
}

export interface KakaoTalkMessage {
  to: string;
  content: string;
  title?: string;
  buttons?: KakaoTalkButton[];
}

export interface KakaoTalkButton {
  name: string;
  linkType: string;
  linkName: string;
  linkMobile: string;
  linkPc: string;
}

export interface KakaoTalkRequest {
  countryCode: string;
  plusFriendId: string;
  templateCode: string;
  messages: KakaoTalkMessage[];
}

export interface KakaoTalkTemplate {
  templateCode: string;
  templateName: string;
  templateContent: string;
  buttons?: KakaoTalkButton[];
} 