export type GameStatus = 'WAITING_CHOICES' | 'STARTING' | 'PLAYING' | 'FINISHED';

export interface Player {
    id: string;
    name: string;
    assignedCeleb?: string;
    chosenForId?: string;
}

export interface Group {
    id: string;
    adminId: string;
    status: GameStatus;
    members: Player[];
    currentRound: number;
}