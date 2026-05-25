import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import {
  GardenNotificationSettings,
  GardenNotificationSettingsDocument,
} from './schemas/garden-notification-settings.schema';
import { UserProfile, UserProfileDocument } from './schemas/user-profile.schema';

interface CareEvent {
  gardenId: string;
  type: string;
  title: string;
}

const EVENT_ICONS: Record<string, string> = {
  watering: '💧',
  fertilizing: '🌿',
  harvesting: '🌾',
  care: '✂️',
};

const RECS_URL = 'http://localhost:3006/care-calendar';
const GARDENS_URL = 'http://localhost:3005/gardens';

@Injectable()
export class ReminderService implements OnModuleInit {
  private readonly logger = new Logger(ReminderService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @InjectModel(GardenNotificationSettings.name)
    private settingsModel: Model<GardenNotificationSettingsDocument>,
    @InjectModel(UserProfile.name)
    private profileModel: Model<UserProfileDocument>,
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
      this.logger.log('Email transporter ready (SMTP)');
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(
        `\n[DEV] Ethereal ready: https://ethereal.email/login\n[DEV] user: ${testAccount.user}  pass: ${testAccount.pass}`,
      );
    }
  }

  async sendForGarden(
    userId: string,
    gardenId: string,
  ): Promise<{ sent: boolean; eventsCount: number; previewUrl: string | null; targetDate: string }> {
    const settings = await this.settingsModel.findOne({ userId, gardenId }).lean().exec();
    if (!settings?.notificationEmail) {
      return { sent: false, eventsCount: 0, previewUrl: null, targetDate: '' };
    }

    const isVerified = await this.isEmailVerified(userId, settings.notificationEmail);
    if (!isVerified) {
      return { sent: false, eventsCount: 0, previewUrl: null, targetDate: '' };
    }

    const today = new Date();
    const target = new Date(today);
    target.setDate(today.getDate() + (settings.daysBefore ?? 0));
    const dateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;

    const events = await this.fetchEvents(userId, dateStr, gardenId);
    if (events.length === 0) {
      return { sent: false, eventsCount: 0, previewUrl: null, targetDate: dateStr };
    }

    const gardenName = await this.fetchGardenName(userId, gardenId);
    const previewUrl = await this.sendEmail(settings.notificationEmail, dateStr, gardenName, events);
    return { sent: true, eventsCount: events.length, previewUrl, targetDate: dateStr };
  }

  async sendScheduled(currentTime: string): Promise<void> {
    const allSettings = await this.settingsModel
      .find({ time: currentTime, notificationEmail: { $ne: '' } })
      .lean()
      .exec();

    if (allSettings.length === 0) return;

    const verifiedChecks = await Promise.all(
      allSettings.map((s) => this.isEmailVerified(s.userId, s.notificationEmail)),
    );
    const active = allSettings.filter((_, i) => verifiedChecks[i]);

    this.logger.log(`[${currentTime}] Sending reminders for ${active.length} garden(s)`);

    await Promise.allSettled(
      active.map((s) =>
        this.sendForGarden(s.userId, s.gardenId)
          .then((r) =>
            this.logger.log(`garden=${s.gardenId} sent=${r.sent} events=${r.eventsCount}`),
          )
          .catch((err: Error) =>
            this.logger.error(`garden=${s.gardenId} failed: ${err.message}`),
          ),
      ),
    );
  }

  private async isEmailVerified(userId: string, email: string): Promise<boolean> {
    if (!email) return false;
    const profile = await this.profileModel
      .findOne({ userId })
      .select('verifiedEmails')
      .lean<{ verifiedEmails: string[] }>()
      .exec();
    return (profile?.verifiedEmails ?? []).includes(email);
  }

  private async fetchEvents(userId: string, date: string, gardenId: string): Promise<CareEvent[]> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<CareEvent[]>(
          `${RECS_URL}/upcoming?userId=${userId}&date=${date}&gardenId=${gardenId}`,
        ),
      );
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  private async fetchGardenName(userId: string, gardenId: string): Promise<string> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<{ _id: string; name: string }[]>(GARDENS_URL, {
          headers: { 'x-user-id': userId },
        }),
      );
      return res.data.find((g) => g._id === gardenId)?.name ?? gardenId;
    } catch {
      return gardenId;
    }
  }

  private async sendEmail(
    to: string,
    date: string,
    gardenName: string,
    events: CareEvent[],
  ): Promise<string | null> {
    const d = new Date(date + 'T12:00:00');
    const dateLabel = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const count = events.length;
    const subject = `🌿 ${count} task${count > 1 ? 's' : ''} in "${gardenName}" for ${dateLabel}`;

    const rows = events
      .map(
        (e) =>
          `<tr><td style="padding:6px 0;border-bottom:1px solid rgba(45,74,62,0.08)">${EVENT_ICONS[e.type] ?? '🌱'} <strong>${e.title}</strong></td></tr>`,
      )
      .join('');

    const html = `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;background:#F4F0E8;border-radius:12px;border-top:3px solid #2D4A3E">
<h2 style="color:#2D4A3E;margin-top:0;font-size:1.25em">🌱 Garden Care Reminder</h2>
<p style="color:#1A2E26;margin-bottom:4px">You have <strong>${count} task${count > 1 ? 's' : ''}</strong> scheduled for <strong>${dateLabel}</strong>:</p>
<p style="color:#2D4A3E;font-weight:600;margin:0 0 12px">🪴 ${gardenName}</p>
<table style="width:100%;border-collapse:collapse;color:#1A2E26">${rows}</table>
<p style="color:#7A8A83;font-size:12px;margin-top:24px;margin-bottom:0">Sent by Garden Planner</p>
</div>`;

    const text = `Garden Care Reminder\n\nTasks for ${dateLabel} in "${gardenName}":\n${events.map((e) => `- ${e.title}`).join('\n')}`;

    const info = await this.transporter!.sendMail({
      from: process.env.SMTP_FROM ?? '"Garden Planner" <noreply@garden.app>',
      to,
      subject,
      text,
      html,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) this.logger.log(`[DEV] Preview: ${preview}`);
    return (preview as string) || null;
  }
}
