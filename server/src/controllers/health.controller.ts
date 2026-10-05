import type { Request, Response } from 'express';
import { checkDatabase } from '../services/db';

export function health(_req: Request, res: Response): void {
  res.json({ status: 'ok' });
}

export async function healthDatabase(_req: Request, res: Response): Promise<void> {
  const ok = await checkDatabase();
  if (!ok) {
    res.status(503).json({ database: 'unavailable' });
    return;
  }
  res.json({ database: 'ok' });
}
