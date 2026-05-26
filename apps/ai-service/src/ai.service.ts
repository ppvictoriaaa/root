import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Groq from 'groq-sdk';

interface PlacedPlant {
  name: string;
  slug: string;
  count: number;
  variety?: string;
  x: number;
  y: number;
  plantsPerRow: number;
  spacing: number;
}

interface Garden {
  _id: string;
  name: string;
  placedPlants: PlacedPlant[];
  plotWidthM: number;
  plotHeightM: number;
  metersPerCell: number;
}

interface CalendarEvent {
  title: string;
  type: string;
  date: string;
  status: string;
}

interface CalendarResponse {
  events: CalendarEvent[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GARDEN_SVC = 'http://localhost:3005/gardens';
const RECS_SVC = 'http://localhost:3006/care-calendar';

const EVENT_ICONS: Record<string, string> = {
  watering: '💧',
  fertilizing: '🌿',
  harvesting: '🌾',
  care: '✂️',
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  constructor(private readonly httpService: HttpService) {}

  async chat(
    userId: string,
    message: string,
    history: ChatMessage[],
    gardenId?: string,
  ): Promise<string> {
    const systemPrompt = await this.buildSystemPrompt(userId, gardenId);

    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ],
    });

    return response.choices[0]?.message?.content ?? '';
  }

  private async buildSystemPrompt(userId: string, gardenId?: string): Promise<string> {
    const all = await this.fetchGardens(userId);
    const gardens = gardenId ? all.filter((g) => g._id === gardenId) : all;

    if (gardens.length === 0) {
      return `You are a helpful garden assistant. The user has no gardens yet.
Encourage them to create a garden and offer general gardening advice.
Always respond in the same language as the user's message.`;
    }

    const today = new Date();
    const in14Days = new Date(today);
    in14Days.setDate(today.getDate() + 14);
    const todayStr = today.toISOString().slice(0, 10);
    const in14Str = in14Days.toISOString().slice(0, 10);

    const gardenSections = await Promise.all(
      gardens.map((g) => this.buildGardenSection(g, todayStr, in14Str)),
    );

    return `You are a helpful garden assistant built into a garden planning app.
You have access to the user's real garden data shown below.

Today's date: ${todayStr}

${gardenSections.join('\n\n')}

Guidelines:
- Answer questions about the user's specific gardens, plants, and care schedule
- When asked where to plant something, use the grid info (size, free cells, existing plant positions) to suggest a specific area — e.g. "you have ~N free cells, try placing it at col X row Y"
- Give practical, actionable advice
- Be concise — 2-4 sentences unless more detail is needed
- Always respond in the same language as the user's message`;
  }

  private async buildGardenSection(
    garden: Garden,
    todayStr: string,
    in14Str: string,
  ): Promise<string> {
    const cellSize = garden.metersPerCell;
    const gridW = Math.round(garden.plotWidthM / cellSize);
    const gridH = Math.round(garden.plotHeightM / cellSize);
    const totalCells = gridW * gridH;

    const occupied = new Set<string>();
    const plantLines = garden.placedPlants.map((p) => {
      const rows = Math.ceil(p.count / p.plantsPerRow);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < p.plantsPerRow; col++) {
          occupied.add(`${p.x + col},${p.y + row}`);
        }
      }
      const label = p.variety ? `${p.name} (${p.variety})` : p.name;
      return `  • ${label} × ${p.count} — grid position (col ${p.x}, row ${p.y})`;
    });

    const freeCells = totalCells - occupied.size;

    const events = await this.fetchUpcomingEvents(garden._id, todayStr, in14Str);
    const taskLines =
      events.length > 0
        ? events
            .slice(0, 10)
            .map((e) => `  • ${e.date} — ${EVENT_ICONS[e.type] ?? '🌱'} ${e.title}`)
            .join('\n')
        : '  No upcoming tasks';

    return `🌿 Garden: "${garden.name}"
Grid: ${gridW} cols × ${gridH} rows (each cell = ${cellSize}m), total ${totalCells} cells, ~${freeCells} free
Plants:
${plantLines.join('\n') || '  none'}
Upcoming tasks (next 14 days):
${taskLines}`;
  }

  private async fetchGardens(userId: string): Promise<Garden[]> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<Garden[]>(GARDEN_SVC, {
          headers: { 'x-user-id': userId },
        }),
      );
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  private async fetchUpcomingEvents(
    gardenId: string,
    from: string,
    to: string,
  ): Promise<CalendarEvent[]> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<CalendarResponse>(`${RECS_SVC}/${gardenId}`),
      );
      return (res.data?.events ?? []).filter(
        (e) => e.status === 'planned' && e.date >= from && e.date <= to,
      );
    } catch {
      return [];
    }
  }
}
