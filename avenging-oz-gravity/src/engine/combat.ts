import type { CombatResult } from "./types";

export function resolveCombat(attackerUnits: number, defenderUnits: number): CombatResult {
    let attackers=attackerUnits;
    let defenders=defenderUnits;
    while(attackers>0 && defenders>0) {
        const attackDice=Math.min(attackers, 3);
        const defendDice=Math.min(defenders, 2);
        const clashes=Math.min(attackDice, defendDice);
        for(let i=0; i<clashes; i++) {
            const attackerWinsClash=(attackDice>defendDice);
            if(attackerWinsClash) {
                defenders-=1;
            }
            else {
                attackers-=1;
            }
        }
        if(clashes===0) {
            break;
        }
    }
    const attackerLosses=attackerUnits-attackers;
    const defenderLosses=defenderUnits-defenders;
    const areaCaptured=(defenders<=0) && (attackers>0);
    return {attackerLosses, defenderLosses, areaCaptured};
}