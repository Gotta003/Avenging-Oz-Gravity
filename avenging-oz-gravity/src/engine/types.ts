export type AreaId=string;
export type PlayerId=string;

export interface Area {
    id: AreaId;
    name: string;
    neighbors: AreaId[];
    ownerId: PlayerId | null;
    units: number;
}

export interface Player {
    id: PlayerId;
    name: string;
    color?: string;
}

export type ActionType="MOVE" | "ATTACK" | "REINFORCE";

export interface BaseAction {
    type: ActionType;
    playerId: PlayerId;
    fromAreaId: AreaId;
}

export interface MoveAction extends BaseAction {
    type: "MOVE";
    toAreaId: AreaId;
    units: number;
}

export interface AttackAction extends BaseAction {
    type: "ATTACK";
    toAreaId: AreaId;
    units: number;
}

export interface ReinforceAction extends BaseAction {
    type: "REINFORCE";
    units: number;
}

export type GameAction = MoveAction | AttackAction | ReinforceAction;

export interface GameState {
    areas: Record<AreaId, Area>;
    players: Record<PlayerId, Player>;
    pendingActions: GameAction[];
    turnNumber: number;
}

export interface CombatResult {
    attackerLosses: number;
    defenderLosses: number;
    areaCaptured: boolean;
}

export interface ActionLogEntry {
    action: GameAction;
    outcome: string;
    combatResult?: CombatResult;
}