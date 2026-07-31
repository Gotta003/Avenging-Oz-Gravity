import type {Area, AreaId, GameState, Player} from "./types"
/*
 *      A --- B --- C
 *      |     |     |
 *      D --- E --- F
 */
export function createDemoBoard(): Record<AreaId, Area> {
    const raw: Omit<Area, "ownerId"  | "units">[]=[
        {id: "A", name: "Area A", neighbors: ["B", "D"]},
        {id: "B", name: "Area B", neighbors: ["A", "C", "E"]},
        {id: "C", name: "Area C", neighbors: ["B", "F"]},
        {id: "D", name: "Area D", neighbors: ["A", "E"]},
        {id: "E", name: "Area E", neighbors: ["B", "D", "F"]},
        {id: "F", name: "Area F", neighbors: ["C", "E"]},
    ];

    const areas: Record<AreaId, Area>={};
    for(const a of raw) {
        areas[a.id]={...a, ownerId: null, units: 0};
    }
    return areas;
}

export function createDemoGame(players: Player[]): GameState {
    const areas=createDemoBoard();
    const areaIds=Object.keys(areas);
    areaIds.forEach((id, i)=>{
        const player=players[i%players.length];
        areas[id].ownerId=player.id;
        areas[id].units=3;
    });
    const playerMap: Record<string, Player>={};
    for(const p of players) {
        playerMap[p.id]=p;
    }
    return {
        areas,
        players: playerMap,
        pendingActions: [],
        turnNumber: 1,
    }
}