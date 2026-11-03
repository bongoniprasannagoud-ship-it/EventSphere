import { useState, useEffect } from 'react';

export default function CountdownTimer({ date }) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(date));
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);

  if (!timeLeft) {
    return (
      <div className="text-center py-3">
        <span className="text-amber-600 font-mono text-sm font-medium">🎉 Event has started / already happened</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <TimeUnit value={days} label="Days" />
      <Separator />
      <TimeUnit value={hours} label="Hours" />
      <Separator />
      <TimeUnit value={minutes} label="Mins" />
      <Separator />
      <TimeUnit value={seconds} label="Secs" highlight />
    </div>
  );
}

function TimeUnit({ value, label, highlight }) {
  return (
    <div className="text-center">
      <div className={`countdown-digit ${highlight ? 'border-primary-300' : ''}`}>
        <span className={`text-2xl font-mono font-bold ${highlight ? 'text-primary-600' : 'text-slate-900'}`}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1 font-mono">{label}</p>
    </div>
  );
}

function Separator() {
  return <div className="text-2xl font-mono text-slate-300 self-start mt-2">:</div>;
}

function calcTimeLeft(date) {
  const diff = new Date(date) - new Date();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
