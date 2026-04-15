export const gameRoomKeys = {
  all: ['game-room'] as const,
  list: () => ['game-room', 'list'] as const,
  detail: (roomId: string) => ['game-room', 'detail', roomId] as const,
  portfolio: (roomId: string) => ['game-room', 'portfolio', roomId] as const,
  holdings: (roomId: string) => ['game-room', 'holdings', roomId] as const,
  briefing: (roomId: string) => ['game-room', 'briefing', roomId] as const,
  rankings: (roomId: string) => ['game-room', 'rankings', roomId] as const,
  stockChart: (symbol: string, roomId: string) =>
    ['game-room', 'stockChart', symbol, roomId] as const
}

export const gameTurnKeys = {
  current: (roomId: string) => ['game-turn', 'current', roomId] as const
}
