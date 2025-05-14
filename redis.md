# SMS 인증 코드 발송 API 사용 가이드

## 1. API 엔드포인트
```
POST /auth/send-sms-code
```

## 2. 요청 형식
```typescript
// Request Body
{
  "phone": string  // 전화번호 (예: "01012345678")
}
```

## 3. 응답 형식
```typescript
// Response
{
  // sendSms 함수의 반환값이 그대로 전달됩니다
}
```

## 4. 사용 예시 (Axios)
```typescript
// 프론트엔드에서의 사용 예시
const sendSmsCode = async (phone: string) => {
  try {
    const response = await axios.post('/auth/send-sms-code', {
      phone: phone
    });
    return response.data;
  } catch (error) {
    console.error('SMS 인증 코드 발송 실패:', error);
    throw error;
  }
};
```

## 5. 주의사항
- 전화번호는 국제 형식(+82)으로 변환되어 서버에서 처리됩니다
- 전화번호는 숫자만 포함되어야 합니다
- API 호출 시 적절한 에러 처리가 필요합니다

## 6. 사용 시나리오
```typescript
// React 컴포넌트 예시
const PhoneVerification = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
      await sendSmsCode(phone);
      alert('인증 코드가 발송되었습니다.');
    } catch (error) {
      alert('인증 코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="tel" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)}
        placeholder="전화번호를 입력하세요"
      />
      <button 
        onClick={handleSendCode}
        disabled={isLoading}
      >
        {isLoading ? '발송 중...' : '인증번호 받기'}
      </button>
    </div>
  );
};
```

## 7. 구현 시 고려사항
1. 전화번호 유효성 검사
   - 숫자만 입력 가능하도록 처리
   - 올바른 전화번호 형식인지 확인

2. 에러 처리
   - 네트워크 오류
   - 서버 오류
   - 잘못된 전화번호 형식

3. 사용자 경험
   - 로딩 상태 표시
   - 성공/실패 메시지 표시
   - 재시도 기능

4. 보안
   - API 호출 제한 (rate limiting)
   - 인증 코드 만료 시간 설정

이 API는 회원가입이나 전화번호 인증이 필요한 경우에 사용할 수 있습니다. 프론트엔드에서는 사용자로부터 전화번호를 입력받아 이 API를 호출하고, 발송된 인증 코드를 사용자에게 입력받아 검증하는 흐름으로 구현하시면 됩니다.
