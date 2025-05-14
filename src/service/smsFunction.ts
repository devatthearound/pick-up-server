import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as crypto from 'crypto';
import { redisClient } from "./redisClientConfig";
import { FuctionExecutionError } from "./errorClass";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  private makeMessage(authCode: string) {
    return `픽업해 본인 인증 번호는 ${authCode}입니다. 3분 이내에 인증을 해주세요.`;
  }

  async sendSMS(countryCode: string, number: string, smsMessage: string) {
    console.log('sendSMS', number, smsMessage);

    const date = Date.now().toString();
    const serviceID = this.configService.get('sms.ncpServiceId');
    const accessKey = this.configService.get('sms.ncpAccessKeyId');
    const secretKey = this.configService.get('sms.ncpSecret');
    const mynumber = this.configService.get('sms.mynumber');
    const method = "POST";
    const space = " ";
    const newLine = "\n";

    // 전화번호 형식 정리 (숫자만 남기기)
    const cleanNumber = number.replace(/[^0-9]/g, '');
    // 국가 코드에서 + 제거
    const cleanCountryCode = countryCode.replace('+', '');

    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${serviceID}/messages`;
    const url2 = `/sms/v2/services/${serviceID}/messages`;

    // 서명 생성 - Node.js crypto 모듈 사용
    const signMessage = [
      method,
      space,
      url2,
      newLine,
      date,
      newLine,
      accessKey
    ].join('');

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signMessage)
      .digest('base64');

    console.log('Request Data:', {
      type: "SMS",
      countryCode: cleanCountryCode,
      from: mynumber,
      content: smsMessage,
      messages: [{ to: `${cleanCountryCode}${cleanNumber}` }]
    });

    await axios({
      method: method,
      url: url,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-iam-access-key": accessKey,
        "x-ncp-apigw-timestamp": date,
        "x-ncp-apigw-signature-v2": signature,
      },
      data: {
        type: "SMS",
        countryCode: cleanCountryCode,
        from: mynumber,
        content: smsMessage,
        messages: [
          { to: `${cleanCountryCode}${cleanNumber}` },
        ],
      },
    })
      .then(async (res) => {
        console.log('SMS Response:', res.data);
        return res.data;
      })
      .catch((err) => {
        console.error('SMS Error:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        throw new FuctionExecutionError(`Error in ${this.sendSMS.name}: ${err.message}`);
      });
  }

  private getRandomNumber(max: number) {
    return Math.floor(Math.random() * max);
  }

  async sendSms(countryCode: string, number: string) {
    const exception_number = {
      // QA 진행 시에 로그인 절차를 간소화 시키기 위한 개발전용 번호 목록
      "01012345678": true,
      "01012345679": true,
      "00000000001": true,
      "00000000002": true,
      "00000000003": true,
      "00000000004": true,
      "00000000005": true,
      "00000000006": true,
      "00000000007": true,
      "00000000008": true,
      "00000000009": true,
      "00000000010": true,
      "00000000011": true,
      "00000000012": true,
      "00000000013": true,
      "00000000014": true,
      "00000000015": true,
      "00000000016": true,
      "00000000017": true,
      "00000000018": true,
      "00000000019": true,
      "00000000020": true,
      "00000000021": true,
      "00000000022": true,
      "00000000023": true,
      "00000000024": true,
      "00000000025": true,
      "00000000026": true,
      "00000000027": true,
      "00000000028": true,
      "00000000029": true,
      "01022248459": true,
    };
    const user_exception_number = {
      // QA 진행 시에 로그인 절차를 간소화 시키기 위한 개발전용 번호 목록
    };
    if (number in exception_number) {
      // 개발전용 번호일 경우 인증코드 1234 고정
      const verifyCode = "1234";
      await redisClient.set(number, verifyCode, { EX: 180 });
      return;
    } else if (number in user_exception_number) {
      const verifyCode = "0000";
      await redisClient.set(number, verifyCode, { EX: 180 });
      // console.log("redisClient.set" + (await redisClient.get(number)));
      return;
    } else {
      const verifyCode = this.getVerifyCode(4); // 무작위 4자리 숫자 인증번호 생성
      const message = this.makeMessage(verifyCode); // 생성된 인증번호를 바탕으로 메시지 텍스트 생성
      // const result = await sendSMS(number, message).catch(()=> { // 생성된 텍스트를 입력받은 전화번호로 전송
      //     throw new FuctionExecutionError("Error in "+sendSms.name +",")
      // });
      const result = await this.sendSMS(countryCode, number, message).catch(() => {
        // 생성된 텍스트를 입력받은 전화번호로 전송
        console.log("Error in " + this.sendSMS.name + ",");
        throw new FuctionExecutionError("Error in " + this.sendSMS.name + ",");
      });
      await redisClient.set(number, verifyCode, { EX: 180 }); // 만료기간3분으로 number key값에 인증번호 value를 갖도록 redis DB에 저장
      return result;
    }
  }

  async compareAuthCode(key: string, code: string) {
    const result = await redisClient.get(key); // redis DB 로부터 key에 저장된 값을 가져온다.
    // console.log("redisClient.get" + result);
    if (code !== result) {
      // 사용자가 입력한 코드와 일치하는지 확인
      return false;
    }
    await redisClient.del(key); // 일치한다면 저장된 값을 삭제 후 true 리턴
    return true;
  }

  getVerifyCode(range: number) {
    // 무작위 4자리 숫자 생성
    let code = "";
    for (let i = 0; i < range; i++) {
      code += this.getRandomNumber(10).toString();
    }
    return code;
  }
}

