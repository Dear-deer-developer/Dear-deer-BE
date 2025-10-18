import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    // SendGrid API 키 설정
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'SENDGRID_API_KEY is not configured.',
      );
    }
    sgMail.setApiKey(apiKey);

    // 발송자 이메일 설정
    this.fromEmail = this.configService.get<string>('FROM_EMAIL');
  }

  /**
   * 6자리 인증 코드를 사용자 이메일로 발송합니다.
   * @param toEmail 수신자 이메일 주소
   * @param code 발송할 6자리 인증 코드
   */
  async sendAuthCode(toEmail: string, code: string): Promise<void> {
    const expiryMinutes = this.configService.get('CODE_EXPIRY_MINUTES');

    const msg = {
      to: toEmail,
      from: this.fromEmail, // 도메인 인증된 발송자 주소
      subject: '[DearDeer] 이메일 인증 코드입니다.',
      html: `
        <p>요청하신 이메일 인증을 위해 아래 인증 코드를 사용해 주세요:</p>
        <h2 style="color: #4CAF50;">${code}</h2>
        <p>이 코드는 ${expiryMinutes}분 동안 유효합니다.</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      // SendGrid API 오류 시 상세 응답을 콘솔에 출력합니다.
      console.error('SendGrid Error:', error.response.body.errors);
      // 클라이언트에게는 일반적인 서버 오류로 처리합니다.
      throw new InternalServerErrorException(
        '이메일 발송 중 오류가 발생했습니다.',
      );
    }
  }
}
