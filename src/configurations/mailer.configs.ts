import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EnvVariables } from './configuration.interface';

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
  private logger: Logger;

  constructor(private readonly configService: ConfigService<EnvVariables>) {
    this.logger = new Logger('Mailer Configs');
  }

  createMailerOptions(): MailerOptions {
    const configs: MailerOptions = {
      transport: {
        host: this.configService.get('MAIL_HOST'),
        port: +this.configService.get('MAIL_PORT'),
        auth: {
          user: this.configService.get('MAIL_AUTH_USER'),
          pass: this.configService.get('MAIL_AUTH_PWD'),
        },
        secure: false,
      },
      defaults: {
        from: this.configService.get('MAIL_FROM'),
      },

      template: {
        dir: join(__dirname, '../../emails'),
        adapter: new HandlebarsAdapter({
          nl2br: (value) => {
            const nl2br = value.replace(
              /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
              '$1' + '<br>' + '$2',
            );
            return new Handlebars.SafeString(nl2br);
          },
        }),
        options: {
          strict: true,
        },
      },
    };

    if (this.configService.get('ENV') === 'development') {
      this.logger.verbose('Mailer configs:', JSON.stringify(configs, null, 2));
    }

    return configs;
  }
}
