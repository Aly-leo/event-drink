import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('SMTP_FROM', 'Eventdrink <no-reply@eventdrink.local>');
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Réinitialise ton mot de passe Eventdrink',
        html: `
          <p>Tu as demandé à réinitialiser ton mot de passe Eventdrink.</p>
          <p><a href="${resetUrl}">Clique ici pour choisir un nouveau mot de passe</a> (lien valable 1 heure).</p>
          <p>Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.</p>
        `,
      });
    } catch (e) {
      this.logger.error(`Echec d'envoi de l'email de reinitialisation a ${to}`, e as Error);
      throw e;
    }
  }
}
