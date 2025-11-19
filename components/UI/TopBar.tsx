
import React from 'react';
import { CameraView, Screen } from '../../types';

interface TopBarProps {
    cameraView: CameraView;
    setCameraView: (view: CameraView) => void;
    onNavigate: (screen: Screen) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ cameraView, setCameraView, onNavigate }) => {
    return (
        <header className="w-full bg-space-blue-900/80 backdrop-blur border-b border-cyber-cyan/30 p-2 flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <h1 className="font-bold text-lg tracking-widest text-cyber-cyan px-4 border-r border-gray-600">SFB <span className="text-plasma-orange text-xs">TACTICAL</span></h1>
                 <button onClick={() => onNavigate(Screen.MAIN_MENU)} className="text-xs uppercase text-gray-400 hover:text-white">Main Menu</button>
                 <button onClick={() => {}} className="text-xs uppercase text-gray-400 hover:text-white">Hot Keys</button>
             </div>

             <div className="flex gap-1 pointer-events-auto">
                {(Object.values(CameraView) as CameraView[]).map(view => {
                    const isActive = cameraView === view;
                    return (
                        <button 
                            key={view} 
                            onClick={() => setCameraView(view)}
                            className={`px-4 py-1 text-xs font-bold uppercase transition-colors border-t-2 ${
                                isActive 
                                ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan' 
                                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                        >
                            {view}
                        </button>
                    );
                })}
            </div>
        </header>
    );
};
