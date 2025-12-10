import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendAllotmentEmail(email: string, attachment: Buffer) {
    console.log(`[MOCK EMAIL] Sending allotment letter to ${email}`);
    console.log(`[MOCK EMAIL] Attachment size: ${attachment.length} bytes`);
    return true;
  }
}
