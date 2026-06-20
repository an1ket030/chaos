import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuctionStore } from '../../store/auctionStore';

export function CommentaryFeed() {
  const { events } = useAuctionStore();
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const getColor = (type: string) => {
    switch(type) {
      case 'info': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
      case 'chaos': return 'text-purple-400 border-purple-500/20 bg-purple-500/10';
      case 'sold': return 'text-primary border-primary/20 bg-primary/10';
      case 'warning': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
      case 'bankruptcy': return 'text-red-500 border-red-500/20 bg-red-500/10';
      default: return 'text-gray-300 border-gray-600/20 bg-gray-600/10';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'info': return 'ℹ️';
      case 'chaos': return '🃏';
      case 'sold': return '🔨';
      case 'warning': return '⚠️';
      case 'bankruptcy': return '💀';
      default: return '💬';
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark border border-white/5 rounded-xl overflow-hidden shadow-xl">
      <div className="p-3 bg-dark-elevated border-b border-white/5 font-mono text-xs text-gray-400 tracking-widest uppercase flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        Live Events
      </div>
      
      <div 
        ref={feedRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="text-gray-500 italic text-sm text-center mt-10">Waiting for auction to begin...</div>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`p-3 rounded-lg border text-sm flex gap-3 items-start shadow-md ${getColor(event.type)}`}
              >
                <div className="text-lg">{getIcon(event.type)}</div>
                <div className="flex-1">
                  <div className="font-semibold">{event.message}</div>
                  <div className="text-[10px] opacity-60 mt-1 uppercase tracking-wider">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
