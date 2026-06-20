import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  initialTime: number; // in seconds
  onExpire?: () => void;
  pulseAt?: number;
}

export function CountdownTimer({ initialTime, onExpire, pulseAt = 3 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime); // Reset when initial time changes
  }, [initialTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onExpire]);

  const isLow = timeLeft <= pulseAt;
  const progress = (timeLeft / initialTime) * 100;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      <motion.div 
        className={`text-4xl font-black font-mono tracking-tighter ${isLow ? 'text-red-500' : 'text-primary'}`}
        animate={isLow ? { scale: [1, 1.2, 1] } : {}}
        transition={isLow ? { repeat: Infinity, duration: 0.5 } : {}}
      >
        00:{timeLeft.toString().padStart(2, '0')}
      </motion.div>
      <div className="w-full h-2 bg-dark-elevated rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${isLow ? 'bg-red-500' : 'bg-primary'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}
