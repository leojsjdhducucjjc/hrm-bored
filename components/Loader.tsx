
import React from 'react';

const Loader: React.FC<{ message?: string }> = ({ message = "Processing Group Data..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-24 h-24 mb-6">
        {/* Spinner rings */}
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-4 border-transparent border-b-indigo-500 rounded-full animate-spin-reverse"></div>
        
        {/* Core pulse */}
        <div className="absolute inset-8 bg-blue-500 rounded-full animate-pulse opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
      </div>
      
      <div className="text-center">
        <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-2">{message}</h3>
        <div className="flex gap-1 justify-center">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
      </div>

      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
