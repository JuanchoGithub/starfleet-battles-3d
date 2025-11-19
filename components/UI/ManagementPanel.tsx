
import React, { useState } from 'react';
import { Ship, ManeuverType, ActiveManeuver } from '../../types';

type ManagementTab = 'helm' | 'power' | 'weapons' | 'defense' | 'fleet' | 'crew';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
        isActive
          ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10'
          : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
};

const PanelHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="mb-3 pb-1 border-b border-gray-700">
        <h3 className="text-xs font-bold text-plasma-orange uppercase tracking-widest">{title}</h3>
    </div>
);

const AllocationSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}> = ({ label, value, onChange, max = 10 }) => {
  return (
    <div className="w-full mb-2">
      <div className="flex justify-between items-center text-[10px] mb-1 text-cyber-cyan">
        <label className="uppercase truncate">{label}</label>
        <span className="font-mono text-white">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1 bg-space-blue-800 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

const ActionButton: React.FC<{ label: string; onClick: () => void; disabled?: boolean; active?: boolean; warning?: boolean }> = ({ label, onClick, disabled, active, warning }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-2 px-2 text-[10px] font-bold uppercase border rounded mb-2 transition-all ${
            active 
            ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]' 
            : warning 
                ? 'bg-red-900/20 border-red-800 text-red-500 hover:bg-red-900/40'
                : 'bg-black/40 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
        } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
        {label}
    </button>
);

// --- PANEL CONTENTS ---

const HelmPanel: React.FC<{
    playerShip: Ship;
    onInitiateManeuver: (maneuver: ManeuverType) => void;
    onToggleErraticManeuvers: () => void;
    onCancelManeuver: () => void;
    onToggleIntercept: () => void;
    activeManeuver: ActiveManeuver | null;
}> = ({ playerShip, onInitiateManeuver, onToggleErraticManeuvers, onCancelManeuver, onToggleIntercept, activeManeuver }) => {
    const isBusy = !!activeManeuver;
    return (
        <div>
            <PanelHeader title="Maneuver Control" />
            <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                    <ActionButton 
                        label={activeManeuver?.type === ManeuverType.EMERGENCY_STOP ? "DECELERATING..." : "Emergency Decel"} 
                        onClick={() => onInitiateManeuver(ManeuverType.EMERGENCY_STOP)} 
                        disabled={isBusy}
                        warning
                    />
                </div>
                <ActionButton 
                    label="Erratic Maneuvers" 
                    onClick={onToggleErraticManeuvers} 
                    active={playerShip.isErratic}
                    disabled={isBusy} 
                />
                <ActionButton 
                    label="High Energy Turn" 
                    onClick={() => onInitiateManeuver(ManeuverType.HET)} 
                    disabled={isBusy}
                    warning
                />
                <ActionButton 
                    label="Turn 90° Port" 
                    onClick={() => onInitiateManeuver(ManeuverType.FAST_TURN_LEFT)} 
                    disabled={isBusy} 
                />
                <ActionButton 
                    label="Turn 90° Stbd" 
                    onClick={() => onInitiateManeuver(ManeuverType.FAST_TURN_RIGHT)} 
                    disabled={isBusy} 
                />
                 <div className="col-span-2 mt-2 border-t border-gray-700 pt-2">
                    <h4 className="text-[10px] text-gray-500 uppercase mb-2">Targeting Computer</h4>
                    <ActionButton 
                        label="Intercept Target" 
                        onClick={onToggleIntercept} 
                        active={playerShip.isIntercepting}
                        disabled={isBusy} 
                    />
                 </div>
            </div>
             {activeManeuver && (
                <div className="mt-4">
                    <ActionButton label="CANCEL MANEUVER" onClick={onCancelManeuver} warning />
                </div>
            )}
        </div>
    );
};

const PowerPanel: React.FC<{ 
    ship: Ship;
    onSetAllocation: (componentType: 'engines' | 'shield' | 'weapon', index: number, value: number) => void;
}> = ({ ship, onSetAllocation }) => {
    return (
        <div>
            <PanelHeader title="Energy Management" />
            
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1 text-gray-400">
                    <span>Total Output</span>
                    <span className="text-white">{ship.power.output}</span>
                </div>
                <div className="flex justify-between text-xs mb-1 text-gray-400">
                    <span>Batteries</span>
                    <span className="text-white">{ship.power.batteries}</span>
                </div>
                <ActionButton label={ship.power.batteryOutput > 0 ? "Discharge Batteries" : "Batteries Ready"} onClick={() => {}} active={ship.power.batteryOutput > 0} />
            </div>

            <PanelHeader title="System Priority" />
            <div className="space-y-2 max-h-48 overflow-y-auto">
                <AllocationSlider label="Impulse Engines" value={ship.engines.energyAllocation} onChange={(v) => onSetAllocation('engines', 0, v)} />
                {/* Simplified global sliders for this demo */}
                <AllocationSlider label="Shield Reinforcement" value={ship.shields[0].energyAllocation} onChange={(v) => ship.shields.forEach((_,i) => onSetAllocation('shield', i, v))} />
                <AllocationSlider label="Weapons" value={ship.weapons[0]?.energyAllocation || 0} onChange={(v) => ship.weapons.forEach((_,i) => onSetAllocation('weapon', i, v))} />
            </div>
        </div>
    );
};

const WeaponsPanel: React.FC<{ ship: Ship }> = ({ ship }) => {
    return (
        <div>
             <PanelHeader title="Fire Control" />
             <div className="space-y-2">
                {ship.weapons.map((w, i) => (
                    <div key={i} className="bg-black/30 p-2 rounded border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-cyber-cyan">{w.name}</span>
                            <span className={`text-[10px] px-1 rounded ${w.currentCharge >= w.minChargeToFire ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                {w.currentCharge >= w.minChargeToFire ? 'READY' : 'CHARGING'}
                            </span>
                        </div>
                        <div className="flex gap-1 mt-2">
                            <button className={`flex-1 text-[8px] uppercase border py-1 ${w.mode === 'NORMAL' ? 'bg-cyber-cyan text-black' : 'border-gray-600 text-gray-500'}`}>Norm</button>
                            <button className={`flex-1 text-[8px] uppercase border py-1 ${w.mode === 'OVERLOAD' ? 'bg-plasma-orange text-black' : 'border-gray-600 text-gray-500'}`}>Ovld</button>
                        </div>
                    </div>
                ))}
             </div>
             <div className="mt-4 pt-2 border-t border-gray-700">
                <PanelHeader title="Ordnance" />
                <div className="grid grid-cols-2 gap-2">
                    <ActionButton label="Drop Mine" onClick={() => {}} />
                    <ActionButton label="T-Bomb" onClick={() => {}} />
                </div>
             </div>
        </div>
    );
};

const DefensePanel: React.FC<{ 
    ship: Ship;
    onTogglePointDefense: () => void;
    onSetDefensiveTractors: (count: number) => void;
    onLaunchDecoy: () => void;
}> = ({ ship, onTogglePointDefense, onSetDefensiveTractors, onLaunchDecoy }) => {
    return (
        <div>
            <PanelHeader title="Active Defense" />
            <ActionButton label="Point Defense" onClick={onTogglePointDefense} active={ship.pointDefenseActive} />
            <AllocationSlider label="Defensive Tractors" value={ship.tractorBeams.defensiveAllocation} max={ship.tractorBeams.total} onChange={onSetDefensiveTractors} />
            
            <div className="mt-4">
                <PanelHeader title="Electronic Warfare" />
                <AllocationSlider label="ECM (Jamming)" value={ship.ew.ecm} onChange={() => {}} />
                <AllocationSlider label="ECCM (Counter)" value={ship.ew.eccm} onChange={() => {}} />
                <div className="text-[10px] text-gray-500 text-center">Rating Used: {ship.ew.ecm + ship.ew.eccm} / {ship.ew.rating}</div>
            </div>

            <div className="mt-4">
                <PanelHeader title="Decoys" />
                <ActionButton label={`Launch Probe (${ship.decoys.available})`} onClick={onLaunchDecoy} disabled={ship.decoys.available === 0} />
            </div>
        </div>
    );
};

const FleetPanel: React.FC<{ ship: Ship }> = ({ ship }) => {
    return (
        <div>
            <PanelHeader title="Fleet Command" />
            <div className="mb-4">
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Formation</label>
                <div className="flex gap-1">
                    {['LINE', 'CHEVRON', 'LOOSE'].map(f => (
                        <button key={f} className={`flex-1 py-1 text-[8px] border ${ship.formation === f ? 'bg-plasma-orange text-black' : 'border-gray-600 text-gray-500'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                 <PanelHeader title="Wingmen" />
                 <div className="p-2 bg-black/20 border border-gray-700 rounded">
                     <div className="flex justify-between text-xs text-gray-300">
                         <span>Alpha 2</span>
                         <span className="text-green-500">OK</span>
                     </div>
                     <div className="flex gap-1 mt-2">
                         <button className="flex-1 text-[8px] bg-cyber-cyan/20 border border-cyber-cyan/50 text-cyber-cyan">Attack</button>
                         <button className="flex-1 text-[8px] border border-gray-600 text-gray-500">Defend</button>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export const ManagementPanel: React.FC<{ 
    playerShip: Ship;
    targetShip?: Ship;
    onSetEnergyAllocation: (componentType: 'engines' | 'shield' | 'weapon', index: number, value: number) => void;
    onInitiateManeuver: (maneuverType: ManeuverType) => void;
    onToggleErraticManeuvers: () => void;
    onCancelManeuver: () => void;
    onToggleIntercept: () => void;
    activeManeuver: ActiveManeuver | null;
    onTogglePointDefense: () => void;
    onSetDefensiveTractors: (count: number) => void;
    onLaunchDecoy: () => void;
}> = (props) => {
  const [activeTab, setActiveTab] = useState<ManagementTab>('helm');

  const renderContent = () => {
    switch (activeTab) {
      case 'helm': return <HelmPanel {...props} />;
      case 'power': return <PowerPanel ship={props.playerShip} onSetAllocation={props.onSetEnergyAllocation} />;
      case 'weapons': return <WeaponsPanel ship={props.playerShip} />;
      case 'defense': return <DefensePanel ship={props.playerShip} onTogglePointDefense={props.onTogglePointDefense} onSetDefensiveTractors={props.onSetDefensiveTractors} onLaunchDecoy={props.onLaunchDecoy} />;
      case 'fleet': return <FleetPanel ship={props.playerShip} />;
      default: return <div className="p-4 text-gray-500 text-xs text-center">System Offline</div>;
    }
  };

  return (
    <div className="h-full bg-space-blue-900/90 backdrop-blur border border-cyber-cyan/30 flex flex-col shadow-lg">
        <div className="flex bg-black/40 p-1 gap-1 overflow-x-auto">
            <TabButton label="Helm" isActive={activeTab === 'helm'} onClick={() => setActiveTab('helm')} />
            <TabButton label="Pwr" isActive={activeTab === 'power'} onClick={() => setActiveTab('power')} />
            <TabButton label="Wpn" isActive={activeTab === 'weapons'} onClick={() => setActiveTab('weapons')} />
            <TabButton label="Def" isActive={activeTab === 'defense'} onClick={() => setActiveTab('defense')} />
            <TabButton label="Flt" isActive={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} />
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
            {renderContent()}
        </div>
    </div>
  );
};
