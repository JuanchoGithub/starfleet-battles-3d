
import React, { useState } from 'react';
import { Ship, ManeuverType, ActiveManeuver } from '../../types';

type ManagementTab = 'energy' | 'defense' | 'troops' | 'comms' | 'helm';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2 text-xs uppercase font-bold tracking-wider ${
        isActive
          ? 'bg-cyber-cyan/20 text-cyber-cyan'
          : 'text-cyber-cyan/50 hover:bg-cyber-cyan/10'
      }`}
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(180deg)',
      }}
    >
      {label}
    </button>
  );
};

const AllocationSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}> = ({ label, value, onChange, max = 10 }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1">
        <label className="uppercase truncate">{label}</label>
        <span className="font-bold text-white bg-black/30 px-2 py-0.5 rounded">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1 bg-space-blue-800 rounded-lg appearance-none cursor-pointer range-thumb:bg-cyber-cyan"
        style={{'--thumb-color': '#00f2ff'} as React.CSSProperties}
      />
    </div>
  );
};

const EnergyContent: React.FC<{ 
    ship: Ship;
    onSetAllocation: (componentType: 'engines' | 'shield' | 'weapon', index: number, value: number) => void;
}> = ({ ship, onSetAllocation }) => {
    const totalAllocation = ship.engines.energyAllocation +
        ship.shields.reduce((sum, s) => sum + s.energyAllocation, 0) +
        ship.weapons.reduce((sum, w) => sum + w.energyAllocation, 0);

    // Use the average allocation for the master slider value, or the first if they're all the same
    const avgShieldAllocation = Math.round(ship.shields.reduce((sum, s) => sum + s.energyAllocation, 0) / ship.shields.length);
    const energyWeapons = ship.weapons.filter(w => w.type === 'energy');
    const avgWeaponAllocation = energyWeapons.length > 0 ? Math.round(energyWeapons.reduce((sum, w) => sum + w.energyAllocation, 0) / energyWeapons.length) : 0;

    const handleSetAllShields = (value: number) => {
        ship.shields.forEach((_, i) => {
            onSetAllocation('shield', i, value);
        });
    };
    
    const handleSetAllWeapons = (value: number) => {
        ship.weapons.forEach((weapon, i) => {
            if (weapon.type === 'energy') {
                onSetAllocation('weapon', i, value);
            }
        });
    };

    return (
        <div className="text-sm overflow-y-auto h-full pr-2 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-base font-bold text-plasma-orange">Energy Core</h3>
                    <div className="text-xs text-right">
                        <p>Output: <span className="text-white font-bold">{ship.power.output}/s</span></p>
                        <p>Load: <span className="text-white font-bold">{totalAllocation}</span></p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <AllocationSlider
                        label="Impulse"
                        value={ship.engines.energyAllocation}
                        onChange={(val) => onSetAllocation('engines', 0, val)}
                    />
                    <AllocationSlider
                        label="Shields"
                        value={avgShieldAllocation}
                        onChange={handleSetAllShields}
                    />
                     <AllocationSlider
                        label="Weapons"
                        value={avgWeaponAllocation}
                        onChange={handleSetAllWeapons}
                    />
                </div>
            </div>
            <p className="text-xs text-cyber-cyan/60 mt-4">
                Fine-tune individual shield segments in the Shields/Hull panel below.
            </p>
        </div>
    )
}

const HelmIconButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    title: string;
    children: React.ReactNode;
    gridArea: string;
    isActive?: boolean;
}> = ({ onClick, disabled, title, children, gridArea, isActive = false }) => {
    const baseClass = "w-full h-full flex items-center justify-center rounded-lg transition-colors duration-200 border";
    const disabledClass = "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/20 disabled:hover:border-plasma-orange/20";
    const activeClass = "bg-plasma-orange/30 border-plasma-orange/80 text-white";
    const inactiveClass = "border-plasma-orange/20 text-plasma-orange/70 bg-black/20 hover:bg-plasma-orange/10 hover:border-plasma-orange/50 focus:outline-none focus:ring-1 focus:ring-plasma-orange/50";
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseClass} ${disabledClass} ${isActive ? activeClass : inactiveClass}`}
            style={{ gridArea }}
        >
            <svg
                width="50%"
                height="50%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {children}
            </svg>
        </button>
    );
};

const HelmContent: React.FC<{
    playerShip: Ship;
    targetShip?: Ship;
    onInitiateManeuver: (maneuver: ManeuverType) => void;
    onToggleErraticManeuvers: () => void;
    onCancelManeuver: () => void;
    onToggleIntercept: () => void;
    activeManeuver: ActiveManeuver | null;
}> = ({ playerShip, targetShip, onInitiateManeuver, onToggleErraticManeuvers, onCancelManeuver, onToggleIntercept, activeManeuver }) => {
    const isErratic = playerShip.isErratic;
    const isIntercepting = playerShip.isIntercepting;
    const isManeuverActive = !!activeManeuver;
    const hasTarget = !!targetShip;

    const isExecutingFastTurn = activeManeuver?.status === 'executing' && (
        activeManeuver.type === ManeuverType.FAST_TURN_LEFT ||
        activeManeuver.type === ManeuverType.FAST_TURN_RIGHT ||
        activeManeuver.type === ManeuverType.FAST_180
    );
    
    const isAnyHelmActionActive = isManeuverActive || isErratic || isIntercepting;

    const renderManeuverGrid = () => (
        <div
            className="grid w-full h-full max-w-[240px] max-h-[240px] aspect-square"
            style={{
                gridTemplateAreas: `
                    "erratic stop intercept"
                    "left free right"
                    ". turn180 ."
                `,
                gridTemplateRows: '1fr 1fr 1fr',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px'
            }}
        >
            <HelmIconButton onClick={onToggleErraticManeuvers} disabled={isManeuverActive || isIntercepting} isActive={isErratic} title="Erratic Maneuvers" gridArea="erratic">
               <path d="M4 12h4l4 8 4-16 4 8h4" />
            </HelmIconButton>

            <HelmIconButton onClick={() => onInitiateManeuver(ManeuverType.EMERGENCY_STOP)} disabled={isAnyHelmActionActive} title="Emergency Stop" gridArea="stop">
                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor" stroke="none"></rect>
            </HelmIconButton>

            <HelmIconButton onClick={onToggleIntercept} disabled={!hasTarget || isManeuverActive || isErratic} isActive={isIntercepting} title="Intercept Target" gridArea="intercept">
               <circle cx="12" cy="12" r="8"></circle>
               <line x1="12" y1="2" x2="12" y2="6"></line>
               <line x1="12" y1="18" x2="12" y2="22"></line>
               <line x1="2" y1="12" x2="6" y2="12"></line>
               <line x1="18" y1="12" x2="22" y2="12"></line>
            </HelmIconButton>
            
            <HelmIconButton onClick={() => onInitiateManeuver(ManeuverType.FAST_TURN_LEFT)} disabled={isAnyHelmActionActive} title="Fast Turn 90° Left" gridArea="left">
               <polyline points="1 4 1 10 7 10" />
               <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </HelmIconButton>

            <HelmIconButton onClick={() => onInitiateManeuver(ManeuverType.FAST_TURN_FREE)} disabled={isAnyHelmActionActive} title="Free Burn (4s)" gridArea="free">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
            </HelmIconButton>
            
            <HelmIconButton onClick={() => onInitiateManeuver(ManeuverType.FAST_TURN_RIGHT)} disabled={isAnyHelmActionActive} title="Fast Turn 90° Right" gridArea="right">
               <polyline points="23 4 23 10 17 10" />
               <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </HelmIconButton>

            <HelmIconButton onClick={() => onInitiateManeuver(ManeuverType.FAST_180)} disabled={isAnyHelmActionActive} title="Fast 180° Turn" gridArea="turn180">
               <polyline points="17 1 21 5 17 9"></polyline>
               <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
               <polyline points="7 23 3 19 7 15"></polyline>
               <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </HelmIconButton>
        </div>
    );
    
    const renderCancelButton = () => (
         <div className="w-full flex flex-col items-center justify-center mt-4">
            <button
                onClick={onCancelManeuver}
                className="w-48 h-12 bg-red-600/50 text-white font-bold text-base uppercase border-2 border-red-500/80 rounded-md hover:bg-red-500/70"
            >
                Cancel Maneuver
            </button>
        </div>
    );
    
    return (
        <div className="text-sm overflow-y-auto h-full pr-2 flex flex-col justify-center items-center">
            {renderManeuverGrid()}
            {isExecutingFastTurn ? renderCancelButton() : (
                <p className="text-xs text-cyber-cyan/60 mt-4 text-center">
                    Maneuvers require full power diversion to charge.
                </p>
            )}
        </div>
    );
};

const DefenseContent: React.FC<{
    playerShip: Ship;
    onTogglePointDefense: () => void;
    onSetDefensiveTractors: (count: number) => void;
    onLaunchDecoy: () => void;
}> = ({ playerShip, onTogglePointDefense, onSetDefensiveTractors, onLaunchDecoy }) => {
    return (
        <div className="text-sm overflow-y-auto h-full pr-2 flex flex-col justify-start text-cyber-cyan/80">
            <h3 className="text-base font-bold text-plasma-orange mb-4">Defensive Systems</h3>
            
            <div className="space-y-4">
                {/* Point Defense */}
                <div className="flex items-center gap-4 p-2 rounded-lg bg-black/20">
                    <button 
                        onClick={onTogglePointDefense}
                        title="Toggle Point Defense"
                        className={`w-10 h-10 flex-shrink-0 flex items-center justify-center bg-space-blue-900 rounded transition-all duration-200
                            ${playerShip.pointDefenseActive 
                                ? 'text-cyber-cyan shadow-lg shadow-cyber-cyan/50 ring-1 ring-cyber-cyan/50' 
                                : 'text-plasma-orange hover:bg-space-blue-800'
                            }`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 13c0 4.4-3.6 8-8 8s-8-3.6-8-8V7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v6Z"/>
                            <path d="m13 12-2 4 4 0-2 4"/>
                        </svg>
                    </button>
                    <div className="flex-1 flex items-center justify-between">
                        <span className="font-bold uppercase">Point Defense</span>
                         <span className={`text-xs font-bold uppercase transition-colors ${playerShip.pointDefenseActive ? 'text-cyber-cyan' : 'text-cyber-cyan/50'}`}>
                            {playerShip.pointDefenseActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Defensive Tractors */}
                <div className="flex items-center gap-4 p-2 rounded-lg bg-black/20">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-space-blue-900 rounded text-plasma-orange" title="Defensive Tractors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 12v-5.5a3.5 3.5 0 0 1 7 0v5.5"/>
                            <path d="M12 12v-5.5a3.5 3.5 0 0 0-7 0v5.5"/>
                            <path d="M19 12H5"/>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <AllocationSlider
                            label="Tractors"
                            value={playerShip.tractorBeams.defensiveAllocation}
                            onChange={onSetDefensiveTractors}
                            max={playerShip.tractorBeams.total}
                        />
                    </div>
                </div>
                
                {/* Sensor Decoy */}
                <div className="flex items-center gap-4 p-2 rounded-lg bg-black/20">
                    <div className="flex-1 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold uppercase">Sensor Decoy</h4>
                            <span className="text-xs text-cyber-cyan/60">
                                Avail: {playerShip.decoys.available} / {playerShip.decoys.max}
                            </span>
                        </div>
                        <button 
                            onClick={onLaunchDecoy}
                            disabled={playerShip.decoys.available <= 0}
                            className="px-4 py-2 text-xs uppercase font-bold bg-cyber-cyan/20 border border-cyber-cyan/50 rounded hover:bg-cyber-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyber-cyan/20">
                            Launch
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-xs text-cyber-cyan/60 mt-auto pt-4 text-center">
                Defensive systems automatically draw from core power.
            </p>
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
}> = ({ 
    playerShip, targetShip, onSetEnergyAllocation, onInitiateManeuver, onToggleErraticManeuvers, 
    onCancelManeuver, onToggleIntercept, activeManeuver, onTogglePointDefense, 
    onSetDefensiveTractors, onLaunchDecoy 
}) => {
  const [activeTab, setActiveTab] = useState<ManagementTab>('helm');

  const tabs: { id: ManagementTab; label: string }[] = [
    { id: 'energy', label: 'Energy' },
    { id: 'defense', label: 'Defense' },
    { id: 'troops', label: 'Troops' },
    { id: 'comms', label: 'Comms' },
    { id: 'helm', label: 'Helm' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'energy':
        return <EnergyContent ship={playerShip} onSetAllocation={onSetEnergyAllocation} />;
      case 'defense':
        return <DefenseContent 
                    playerShip={playerShip} 
                    onTogglePointDefense={onTogglePointDefense}
                    onSetDefensiveTractors={onSetDefensiveTractors}
                    onLaunchDecoy={onLaunchDecoy}
                />;
      case 'troops':
        return <p>Troop management systems offline.</p>;
      case 'comms':
        return <p>Communications array is initializing.</p>;
      case 'helm':
        return <HelmContent 
                    playerShip={playerShip}
                    targetShip={targetShip}
                    onInitiateManeuver={onInitiateManeuver} 
                    activeManeuver={activeManeuver}
                    onCancelManeuver={onCancelManeuver}
                    onToggleErraticManeuvers={onToggleErraticManeuvers}
                    onToggleIntercept={onToggleIntercept}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full p-4 bg-black/30 backdrop-blur-sm border-2 border-cyber-cyan/30 flex gap-2">
      <div className="w-8 flex flex-col justify-around bg-black/20">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>
      <div className="flex-1 p-2 overflow-hidden">{renderContent()}</div>
    </div>
  );
};
