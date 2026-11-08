// web/components/CountdownTimer.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  title: string;
  onCompleteMessage: string;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft | null => {
  const diff = +new Date(targetDate) - +new Date();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const TimeBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center bg-white/10 p-3 sm:p-4 rounded-lg w-20 h-20 sm:w-24 sm:h-24">
    <span className="text-3xl sm:text-4xl font-bold text-white tracking-wider">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs sm:text-sm uppercase text-white/80 tracking-widest">{label}</span>
  </div>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, title, onCompleteMessage }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => {
    // initialize safely for SSR and client
    try {
      return calculateTimeLeft(targetDate);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // immediate sync to avoid 1s stale render
    setTimeLeft(calculateTimeLeft(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="text-center p-4 bg-white/10 rounded-lg">
        <h3 className="text-xl sm:text-2xl font-bold text-white">{onCompleteMessage}</h3>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">{title}</h3>
      <div className="flex justify-center items-center gap-2 sm:gap-4">
        <TimeBox value={timeLeft.days} label="Days" />
        <TimeBox value={timeLeft.hours} label="Hours" />
        <TimeBox value={timeLeft.minutes} label="Mins" />
        <TimeBox value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};

export default CountdownTimer;
