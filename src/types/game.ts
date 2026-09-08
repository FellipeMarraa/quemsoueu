export type GameStatus = 'WAITING_CHOICES' | 'STARTING' | 'PLAYING' | 'FINISHED';

export interface Player {
    id: string;
    name: string;
    photo?: string | null;
    assignedCeleb?: string;
    chosenForId?: string;
    guessedAt?: number | null;
}

export interface Group {
    id: string;
    name?: string;
    adminId: string;
    status: GameStatus;
    memberIds: string[];
    members: Player[];
    currentRound?: number;
    startingAt?: number;
    createdAt?: Date;
}

export interface AppUser {
    uid: string;
    name: string;
    email: string | null;
    photo: string | null;
    lastLogin: Date;
    plan?: string;
    planExpiresAt?: string | null;
    activeGroupId?: string | null;
}