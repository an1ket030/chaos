import { useState, useCallback } from 'react';
import { getSocket } from '../lib/socket';

export function useBidding() {
  const [isBidding, setIsBidding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBid = useCallback((amount: number) => {
    setIsBidding(true);
    setError(null);

    getSocket().emit('auction:bid', { amount }, (response: any) => {
      setIsBidding(false);
      if (!response.success) {
        setError(response.error || 'Bid failed');
      }
    });
  }, []);

  return { placeBid, isBidding, error };
}
