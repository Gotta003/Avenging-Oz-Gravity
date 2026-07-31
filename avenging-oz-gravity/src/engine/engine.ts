import { resolveCombat } from "./combat";
import type { ActionLogEntry, AttackAction, GameAction, GameState, MoveAction, ReinforceAction } from "./types";

export class GameEngine {
    state: GameState;

    constructor(state: GameState) {
        this.state=state;
    }

    submitAction(action:GameAction): void {
        this.validateAction(action);
        this.state.pendingActions.push(action);
    }

    private validateAction(action: GameAction): void {
        const fromArea=this.state.areas[action.fromAreaId];
        if(!fromArea) {
            throw new Error(`Unknown area: ${action.fromAreaId}`);
        }
        
        if(fromArea.ownerId!==action.playerId) {
            throw new Error(`Player ${action.playerId} does not own area ${action.fromAreaId}`)
        }
        
        if(action.type==="REINFORCE") {
            if(action.units<=0) {
                throw new Error("Reinforce units must be positive");
            }
            return;
        }
        //MOVE + ATTACK with dest checks
        const toArea=this.state.areas[action.toAreaId];
        if(!toArea) {
            throw new Error(`Unknown destination area: ${action.toAreaId}`);
        }
        if(!fromArea.neighbors.includes(action.toAreaId)) {
            throw new Error(`${action.toAreaId} is not adjacent to ${action.fromAreaId}`);
        }
        if(action.units<=0) {
            throw new Error("Units must be positive")
        }
        if(action.type==="MOVE" && toArea.ownerId!==action.playerId) {
            throw new Error("Cannot MOVE into an area you don't own -> CHOOSE ATTACK")
        }
        if(action.type==="ATTACK" && toArea.ownerId===action.playerId) {
            throw new Error("Cannot ATTACK your own area -> CHOOSE MOVE")
        }
    }

    resolveTurn(): ActionLogEntry[] {
        const log: ActionLogEntry[]=[];
        const reinforcements=this.state.pendingActions.filter(
            (a): a is ReinforceAction => a.type==="REINFORCE"
        );
        const attacks=this.state.pendingActions.filter(
            (a): a is AttackAction=>a.type==="ATTACK"
        );
        const moves=this.state.pendingActions.filter(
            (a): a is MoveAction => a .type==="MOVE"
        );

        for(const action of reinforcements) {
            const area=this.state.areas[action.fromAreaId];
            if(area.ownerId!==action.playerId) {
                log.push({action, outcome: "skipped: area no longer owned"});
                continue;
            }
            area.units+=action.units;
            log.push({action, outcome: `reinforced + ${action.units}`});
        }

        for(const action of attacks) {
            const fromArea=this.state.areas[action.fromAreaId];
            const toArea=this.state.areas[action.toAreaId];
            if(fromArea.ownerId!==action.playerId) {
                log.push({action, outcome: "skipped: source area no longer owned"});
                continue;
            }
            const attackingUnits=Math.min(action.units, fromArea.units-1);
            if(attackingUnits<=0) {
                log.push({action, outcome: "skipped: not enough units to attack with"});
                continue;
            }
            const result=resolveCombat(attackingUnits, toArea.units);
            fromArea.units-=result.attackerLosses;
            toArea.units-=result.defenderLosses;
            if(result.areaCaptured) {
                const survivingAttackers=attackingUnits-result.attackerLosses;
                toArea.ownerId=action.playerId;
                toArea.units=survivingAttackers;
                fromArea.units-=survivingAttackers;
            }
            log.push({action, outcome: result.areaCaptured ? `captured ${toArea.id}` : `repelled, losses A:${result.attackerLosses} D:${result.defenderLosses}`, combatResult: result});
        }

        for(const action of moves) {
            const fromArea=this.state.areas[action.fromAreaId];
            const toArea=this.state.areas[action.toAreaId];
            if(fromArea.ownerId!==action.playerId || toArea.ownerId!==action.playerId) {
                log.push({action, outcome: "skipped: ownership changed before move resolved"});
                continue;
            }
            const movingUnits=Math.min(action.units, fromArea.units-1);
            if(movingUnits<=0) {
                log.push({action, outcome: "skipped: not enough units to move"});
                continue;
            }
            fromArea.units-=movingUnits;
            toArea.units+=movingUnits;
            log.push({action, outcome: `moved ${movingUnits} to ${toArea.id}`});
        }
        this.state.pendingActions=[];
        this.state.turnNumber+=1;
        return log;
    }

    activePlayers(): string[] {
        const owners=new Set(
            Object.values(this.state.areas).map((a)=>a.ownerId).filter((id): id is string => id!==null)
        );
        return [...owners];
    }
}