import React from 'react';
import { CameraView } from '../../types';

interface TopBarProps {
    cameraView: CameraView;
    setCameraView: (view: CameraView) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ cameraView, setCameraView }) => {
    return (
        <header className="absolute top-0 right-0 p-2">
             <div className="flex gap-2 pointer-events-auto">
                {(Object.values(CameraView) as CameraView[]).map(view => (
                    <button 
                        key={view} 
                        onClick={() => setCameraView(view)}
                        className={`px-3 py-1 border-2 text-xs backdrop-blur-sm ${cameraView === view ? 'bg-cyber-cyan text-space-blue-900 border-cyber-cyan' : 'bg-black/30 border-cyber-cyan/50 hover:bg-cyber-cyan/20'}`}
                    >
                        {view}
                    </button>
                ))}
            </div>
        </header>
    );
};
