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
    const serviceName = '디어디어'; // 서비스 이름 변수
    const projectTeamName = 'DearDeer Project Team'; // 프로젝트 팀 이름
    const contactEmail = 'yja208501@gmail.com'; // 문의용 이메일 주소

    const msg = {
      to: toEmail,
      from: {
        name: serviceName, // 발신자 이름 (예: 디어디어)
        email: this.fromEmail, // 실제 발신 이메일 주소
      },
      subject: `[${serviceName}] 인증 코드를 확인해주세요.`,
      html: `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* 이메일 클라이언트 호환성을 위해 대부분 인라인 스타일을 사용합니다. */
        </style>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
      
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="40" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- 1. 헤더: 로고 및 제목 -->
                <tr>
                  <td align="center" style="padding-bottom: 30px; border-bottom: 1px solid #eeeeee;">
                    <h1 style="color: #2c3e50; font-size: 28px; font-weight: 600; margin: 0;">${serviceName} 🦌</h1>
                    <p style="color: #555555; font-size: 16px; margin-top: 10px;">이메일 인증 코드 안내</p>
                  </td>
                </tr>

                <!-- 2. 본문: 인증 코드 및 안내 -->
                <tr>
                  <td style="padding: 40px 20px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                      요청하신 인증 절차를 완료하기 위해<br>
                      아래 6자리 코드를 입력해주세요.
                    </p>
                    
                    <div style="background-color: #f8f9fa; margin: 30px auto; padding: 20px; border-radius: 8px; text-align: center;">
                      <h2 style="color: #20c997; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: 700;">
                        ${code}
                      </h2>
                    </div>

                    <p style="color: #888888; font-size: 14px; text-align: center;">
                      이 코드는 <strong>${expiryMinutes}분</strong> 동안 유효합니다.
                    </p>
                  </td>
                </tr>

                <!-- 3. 푸터: 법적 고지 및 프로젝트 정보 -->
                <tr>
                  <td align="center" style="padding-top: 30px; border-top: 1px solid #eeeeee; font-size: 12px; color: #999999;">
                    <p style="margin: 0 0 5px 0;">본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
                    <p style="margin: 0 0 10px 0;">
                      <a href="#" style="color: #999; text-decoration: none;">이용약관</a> | 
                      <a href="#" style="color: #999; text-decoration: none;">개인정보 처리방침</a>
                    </p>
                    <p style="margin: 0 0 5px 0;"><strong>${projectTeamName}</strong></p>
                    <p style="margin: 0 0 10px 0;">문의: <a href="mailto:${contactEmail}" style="color: #999;">${contactEmail}</a></p>
                    <p style="margin: 0;">© ${new Date().getFullYear()} ${projectTeamName}. All Rights Reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      
      </body>
      </html>
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
