
import React from 'react';
import { Settings } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
      <Settings className="w-16 h-16 opacity-10 animate-spin-slow" />
      <h2 className="text-xl font-black uppercase tracking-tighter">System Config</h2>
      <p className="text-xs font-bold uppercase tracking-widest">Root access parameters...</p>
    </div>
  );
};

export default AdminSettings;
