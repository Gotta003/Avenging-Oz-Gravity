import {GameEngine} from "./engine/engine";
import "./App.css";
import { createDemoGame } from "./engine/board";
import { useState } from "react";
import type { GameState } from "./engine/types";

const players=[
  {id: "p1", name: "Matteo"},
  {id: "p2", name: "Rival"},
];

const engine=new GameEngine(createDemoGame(players));

export default function App() {
  const [state, setState]=useState<GameState>(engine.state);
  const [selected, setSelected]=useState<string | null>(null);
  const [log, setLog]=useState<string[]>([]);

  function handleAreaClick(areaId: string) {
    const area=state.areas[areaId];
    if(!selected) {
      if(area.ownerId==="p1") {
        setSelected(areaId);
        return;
      }
    }
    if(selected===areaId) {
      setSelected(null);
      return;
    }
    const fromArea=state.areas[selected];
    if(!fromArea.neighbors.includes(areaId)) {
      setSelected(null);
      return;
    }

    const action: GameAction=area.ownerId==="p1" ? {type: "MOVE", playerId: "p1", fromAreaId: selected, toAreaId: areaId, units: 1} : {type: "ATTACK", playerId: "p1", fromAreaId: selected, toAreaId: areaId, units: 1};

    try {
      engine.submitAction(action);
      setLog((l)=>[...l, `Queued: ${action.type} ${selected} -> ${areaId}`]);
    } catch(e) {
      setLog((l)=>[...l, `Rejected: ${(e as Error).message}`]);
    }
    setSelected(null);
  }

  function handleResolve() {
    const entries=engine.resolveTurn();
    setState({...engine.state});
    setLog((l)=>[...l, `--- Turn resolved ---`, ...entries.map((e)=>`${e.action.type} by ${e.action.playerId}: ${e.outcome}`),]);
  }

  return (
    <div className="board-screen">
      <h1>Risiko Prototype</h1>
      <p className="hint">
        Tap one of your areas (blue), then tap an adjacent area to queue a
        MOVE (own area) or ATTACK (enemy area). Nothing happens until you
        press "Resolve turn".
      </p>
      <div className="areas-grid">
        {Object.values(state.areas).map((area)=>(
          <button key={area.id} className={"area-tile" + (area.ownerId==="p1" ? " owner-p1" : area.ownerId==="p2" ? " owner-p2" : "") + (selected===area.id ? " selected" : "")} onClick={()=>handleAreaClick(area.id)}>
            <div className="area-name">
              {area.name}
            </div>
            <div className="area-units">
              {area.units}
            </div>
          </button>
        ))}
      </div>
      <button className="resolve-btn" onClick={handleResolve}>
        Resolve turn
      </button>
      <div className="log">
        {log.map((line, i)=>(
          <div key={i}>
            {line}
          </div>
        ))}
      </div>
    </div> 
  )
}