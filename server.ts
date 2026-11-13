import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Multiplayer Rooms Store
interface RoomData {
  code: string;
  hostName: string;
  guestName?: string;
  status: 'waiting' | 'drafting' | 'ready_for_match' | 'simulating' | 'completed';
  currentRound: number;
  formation: string;
  hostSquad: Record<string, unknown>;
  guestSquad: Record<string, unknown>;
  hostCurrentPick?: { round: number; picked: boolean };
  guestCurrentPick?: { round: number; picked: boolean };
  updatedAt: number;
}

const rooms = new Map<string, RoomData>();

// Cleanup stale rooms older than 2 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, r] of rooms.entries()) {
    if (now - r.updatedAt > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 15 * 60 * 1000);

// API Endpoints for Real Multiplayer
app.post('/api/multiplayer/create', (req: Request, res: Response) => {
  const { code, hostName, formation } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const newRoom: RoomData = {
    code: code.toUpperCase(),
    hostName: hostName || 'Host Player',
    status: 'waiting',
    currentRound: 1,
    formation: formation || '4-3-3',
    hostSquad: {},
    guestSquad: {},
    updatedAt: Date.now(),
  };

  rooms.set(newRoom.code, newRoom);
  return res.json(newRoom);
});

app.post('/api/multiplayer/join', (req: Request, res: Response) => {
  const { code, guestName } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const room = rooms.get(code.toUpperCase());
  if (!room) {
    // If not found, create it dynamically to allow friend pairing immediately
    const fallbackRoom: RoomData = {
      code: code.toUpperCase(),
      hostName: 'Captain 1',
      guestName: guestName || 'Friend Challenger',
      status: 'drafting',
      currentRound: 1,
      formation: '4-3-3',
      hostSquad: {},
      guestSquad: {},
      updatedAt: Date.now(),
    };
    rooms.set(fallbackRoom.code, fallbackRoom);
    return res.json(fallbackRoom);
  }

  room.guestName = guestName || 'Friend Challenger';
  room.status = 'drafting';
  room.updatedAt = Date.now();
  return res.json(room);
});

app.get('/api/multiplayer/room/:code', (req: Request, res: Response) => {
  const code = req.params.code?.toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  return res.json(room);
});

app.post('/api/multiplayer/action', (req: Request, res: Response) => {
  const { code, isHost, squad, round } = req.body;
  const room = rooms.get(code?.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (isHost) {
    if (squad) room.hostSquad = squad;
    if (round) room.hostCurrentPick = { round, picked: true };
  } else {
    if (squad) room.guestSquad = squad;
    if (round) room.guestCurrentPick = { round, picked: true };
  }

  room.updatedAt = Date.now();
  return res.json(room);
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`eFootball Cards Server listening on port ${PORT}`);
  });
}

startServer();
