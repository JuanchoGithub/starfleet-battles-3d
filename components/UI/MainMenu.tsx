
import React from 'react';
import { Screen } from '../../types';

interface MainMenuProps {
    currentScreen: Screen;
    onNavigate: (screen: Screen) => void;
}

const MenuButton: React.FC<{ label: string; onClick: () => void; disabled?: boolean }> = ({ label, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left px-6 py-3 bg-space-blue-800/50 border-l-4 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/20 hover:border-plasma-orange transition-all disabled:opacity-30 disabled:cursor-not-allowed font-orbitron uppercase tracking-widest"
    >
        {label}
    </button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ currentScreen, onNavigate }) => {
    
    const renderHome = () => (
        <div className="flex h-full">
            <div className="w-1/3 h-full bg-space-blue-900/90 backdrop-blur-md p-8 flex flex-col gap-8 border-r border-cyber-cyan/30">
                <h1 className="text-4xl font-bold text-cyber-cyan mb-8 tracking-tighter">STARFLEET<br/><span className="text-plasma-orange">BATTLES</span></h1>
                
                <div className="space-y-2">
                    <h2 className="text-xs uppercase text-gray-400 mb-2 font-bold">Game Modes</h2>
                    <MenuButton label="Campaign (Metaverse)" onClick={() => onNavigate(Screen.CAMPAIGN)} />
                    <MenuButton label="Skirmish / Multiplayer" onClick={() => onNavigate(Screen.LOBBY)} />
                    <MenuButton label="Tutorials" onClick={() => {}} disabled />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xs uppercase text-gray-400 mb-2 font-bold">Archives</h2>
                    <MenuButton label="Vessel Library" onClick={() => {}} disabled />
                    <MenuButton label="Film Room" onClick={() => {}} disabled />
                    <MenuButton label="Settings" onClick={() => {}} disabled />
                </div>
                
                <div className="mt-auto text-xs text-gray-500">
                    Version 0.9.2 Alpha
                </div>
            </div>
            <div className="w-2/3 h-full bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop')] bg-cover bg-center opacity-50">
                {/* Background Image Placeholder */}
            </div>
        </div>
    );

    const renderCampaign = () => (
        <div className="w-full h-full bg-space-blue-900 text-cyber-cyan p-8 relative">
            <button onClick={() => onNavigate(Screen.MAIN_MENU)} className="absolute top-8 right-8 text-plasma-orange hover:text-white uppercase font-bold">Back to Menu</button>
            <div className="grid grid-cols-12 gap-4 h-full">
                <div className="col-span-9 bg-black/50 rounded border border-cyber-cyan/30 relative overflow-hidden">
                    {/* Hex Grid Mockup */}
                    <div className="absolute inset-0 opacity-30" 
                         style={{backgroundImage: 'radial-gradient(circle, #1a354d 1px, transparent 1px)', backgroundSize: '30px 30px'}}>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <h2 className="text-2xl font-bold text-plasma-orange">METAVERSE MAP</h2>
                        <p className="text-sm">Sector 7G - Terran Frontier</p>
                    </div>
                </div>
                <div className="col-span-3 flex flex-col gap-4">
                    <div className="bg-space-blue-800/50 p-4 rounded border border-cyber-cyan/20">
                        <h3 className="font-bold text-plasma-orange mb-2">Mission Selector</h3>
                        <div className="space-y-2 text-sm">
                            <div className="p-2 bg-cyber-cyan/10 border border-cyber-cyan/30 cursor-pointer hover:bg-cyber-cyan/20">
                                <p className="font-bold">Patrol Nebula</p>
                                <p className="text-xs text-gray-400">Reward: 500 BPV</p>
                            </div>
                            <div className="p-2 bg-black/20 border border-gray-700 cursor-not-allowed opacity-50">
                                <p className="font-bold">Base Defense</p>
                                <p className="text-xs text-gray-400">Locked</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-space-blue-800/50 p-4 rounded border border-cyber-cyan/20 flex-1">
                        <h3 className="font-bold text-plasma-orange mb-2">Career</h3>
                        <p className="text-sm">Rank: Ensign</p>
                        <p className="text-sm">Prestige: 1200</p>
                        <div className="mt-4 space-y-2">
                            <MenuButton label="Supply Dock" onClick={() => {}} disabled />
                            <MenuButton label="Shipyard" onClick={() => {}} disabled />
                        </div>
                    </div>
                    <button onClick={() => onNavigate(Screen.TACTICAL)} className="w-full py-4 bg-plasma-orange text-black font-bold text-xl uppercase tracking-widest hover:bg-white transition-colors">
                        Launch Mission
                    </button>
                </div>
            </div>
        </div>
    );

    const renderLobby = () => (
        <div className="w-full h-full bg-space-blue-900 p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl bg-space-blue-800/80 border border-cyber-cyan/30 p-8 rounded shadow-2xl">
                <h2 className="text-2xl font-bold text-cyber-cyan mb-6 border-b border-cyber-cyan/30 pb-2">MISSION CONFIGURATION</h2>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">Scenario</label>
                            <select className="w-full bg-black/40 border border-cyber-cyan/30 text-cyber-cyan p-2 rounded">
                                <option>Duel</option>
                                <option>Fleet Action</option>
                                <option>Base Assault</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">Map Type</label>
                            <select className="w-full bg-black/40 border border-cyber-cyan/30 text-cyber-cyan p-2 rounded">
                                <option>Open Space</option>
                                <option>Nebula</option>
                                <option>Asteroid Field</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">BPV Limit</label>
                            <input type="number" defaultValue={500} className="w-full bg-black/40 border border-cyber-cyan/30 text-cyber-cyan p-2 rounded" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">Your Empire</label>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan">Terran</button>
                                <button className="flex-1 py-2 bg-black/20 border border-gray-600 text-gray-500">Xenos</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">Team</label>
                            <div className="flex gap-1">
                                {['A', 'B', 'C', 'D'].map(team => (
                                    <button key={team} className={`w-8 h-8 border ${team === 'A' ? 'bg-plasma-orange text-black border-plasma-orange' : 'bg-black/20 border-gray-600'}`}>{team}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-cyber-cyan/30">
                    <button onClick={() => onNavigate(Screen.MAIN_MENU)} className="text-sm text-gray-400 hover:text-white uppercase">Cancel</button>
                    <button onClick={() => onNavigate(Screen.TACTICAL)} className="px-12 py-3 bg-cyber-cyan text-space-blue-900 font-bold uppercase tracking-widest hover:bg-white hover:shadow-[0_0_15px_rgba(0,242,255,0.5)] transition-all">
                        ENGAGE
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full font-orbitron">
            {currentScreen === Screen.MAIN_MENU && renderHome()}
            {currentScreen === Screen.CAMPAIGN && renderCampaign()}
            {currentScreen === Screen.LOBBY && renderLobby()}
        </div>
    );
};
