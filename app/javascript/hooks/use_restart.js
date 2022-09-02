import { useEffect, useState } from 'react';

export function useRestartCountdown(channel) {
  const [secondsLeft, setSecondsLeft] = useState(undefined);
  const [countdownInterval, setCountdownInterval] = useState(undefined);

  useEffect(() => {
    if (secondsLeft === 0) {
      setSecondsLeft(undefined);
      clearInterval(countdownInterval);
      channel.perform('restart');
    }
  }, [secondsLeft]);

  function startCountdown() {
    setSecondsLeft(2);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    setCountdownInterval(interval);
  }

  return { secondsLeft, startCountdown };
}
