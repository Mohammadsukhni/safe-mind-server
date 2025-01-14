/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class SendEmailHelper {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    email: string,
    fileName: string,
    subject: string,
    data?: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      if (email) {
        const sanitizedEmail = email.toLocaleLowerCase().trim();

        this.mailerService
          .sendMail({
            to: sanitizedEmail,
            subject: `Safe Mind - ${subject}`,
            template: `${join(__dirname, '../../../emails')}/${fileName}`,
            context: {
              data,
            },
          })
          .then((res) => {
            Logger.log('Email has been sent', res);
          })
          .catch((error) => {
            Logger.log(error);
          });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.error(error);

      throw new BadRequestException(error);
    }
  }
}
