import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import {
  UserProfile,
  UserProfileDocument,
} from './schemas/user-profile.schema';
import {
  EmailVerification,
  EmailVerificationDocument,
} from './schemas/email-verification.schema';
import {
  GardenNotificationSettings,
  GardenNotificationSettingsDocument,
} from './schemas/garden-notification-settings.schema';

export interface GardenSettingsResponse {
  gardenId: string;
  notificationEmail: string;
  isEmailVerified: boolean;
  daysBefore: number;
  time: string;
}

const NOTIFICATION_SVC = 'http://localhost:3007/reminders';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @InjectModel(UserProfile.name)
    private profileModel: Model<UserProfileDocument>,
    @InjectModel(EmailVerification.name)
    private verificationModel: Model<EmailVerificationDocument>,
    @InjectModel(GardenNotificationSettings.name)
    private gardenSettingsModel: Model<GardenNotificationSettingsDocument>,
    private readonly httpService: HttpService,
  ) {}

  async onModuleInit() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      console.log(
        '\n[DEV] Ethereal email ready — view sent emails at: https://ethereal.email/login',
      );
      console.log(
        `[DEV] Ethereal user: ${testAccount.user}  pass: ${testAccount.pass}\n`,
      );
    }
  }

  // ─── Email verification ───────────────────────────────────────────────────

  async sendVerification(userId: string, email: string): Promise<void> {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    await this.verificationModel.deleteMany({ userId });
    await this.verificationModel.create({ userId, email, code });

    const info = await this.transporter!.sendMail({
      from: process.env.SMTP_FROM ?? '"Garden Planner" <noreply@garden.app>',
      to: email,
      subject: 'Garden Planner — your verification code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `<div style="font-family:sans-serif;max-width:400px;padding:24px;background:#F4F0E8;border-radius:12px"><p style="color:#1A2E26;margin-top:0">Your verification code:</p><p style="font-size:2.2em;font-weight:700;letter-spacing:0.15em;color:#2D4A3E;margin:0">${code}</p><p style="color:#7A8A83;font-size:13px;margin-top:16px">Expires in 10 minutes</p></div>`,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`[DEV] Verification email: ${preview}`);
  }

  async verifyCode(userId: string, email: string, code: string): Promise<void> {
    const record = await this.verificationModel.findOne({
      userId,
      email,
      code,
    });
    if (!record)
      throw new BadRequestException('Invalid or expired verification code.');
    await this.verificationModel.deleteMany({ userId });
    await this.profileModel.findOneAndUpdate(
      { userId },
      { $addToSet: { verifiedEmails: email } },
      { upsert: true },
    );
  }

  // ─── Per-garden settings ──────────────────────────────────────────────────

  async getAllGardenSettings(userId: string): Promise<GardenSettingsResponse[]> {
    const [settings, profile] = await Promise.all([
      this.gardenSettingsModel.find({ userId }).lean().exec(),
      this.profileModel
        .findOne({ userId })
        .select('verifiedEmails')
        .lean<{ verifiedEmails: string[] }>()
        .exec(),
    ]);
    const verified = new Set<string>(profile?.verifiedEmails ?? []);
    return settings.map((s) => ({
      gardenId: s.gardenId,
      notificationEmail: s.notificationEmail,
      isEmailVerified: !!s.notificationEmail && verified.has(s.notificationEmail),
      daysBefore: s.daysBefore,
      time: s.time,
    }));
  }

  async getGardenSettings(
    userId: string,
    gardenId: string,
  ): Promise<GardenSettingsResponse> {
    const [settings, profile] = await Promise.all([
      this.gardenSettingsModel.findOne({ userId, gardenId }).lean().exec(),
      this.profileModel
        .findOne({ userId })
        .select('verifiedEmails')
        .lean<{ verifiedEmails: string[] }>()
        .exec(),
    ]);
    const verified = new Set<string>(profile?.verifiedEmails ?? []);
    const email = settings?.notificationEmail ?? '';
    return {
      gardenId,
      notificationEmail: email,
      isEmailVerified: !!email && verified.has(email),
      daysBefore: settings?.daysBefore ?? 0,
      time: settings?.time ?? '09:00',
    };
  }

  async upsertGardenSettings(
    userId: string,
    gardenId: string,
    notificationEmail: string,
    daysBefore: number,
    time: string,
  ): Promise<GardenSettingsResponse> {
    await this.gardenSettingsModel.findOneAndUpdate(
      { userId, gardenId },
      { $set: { notificationEmail, daysBefore, time } },
      { upsert: true },
    );
    return this.getGardenSettings(userId, gardenId);
  }

  // ─── Delegate sending to notification-service ────────────────────────────

  async triggerReminderForGarden(
    userId: string,
    gardenId: string,
  ): Promise<{
    sent: boolean;
    eventsCount: number;
    previewUrl: string | null;
    targetDate: string;
  }> {
    const res = await firstValueFrom(
      this.httpService.post(`${NOTIFICATION_SVC}/${userId}/${gardenId}`, {}),
    );
    return res.data as {
      sent: boolean;
      eventsCount: number;
      previewUrl: string | null;
      targetDate: string;
    };
  }
}
