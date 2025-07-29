import { useEffect, useRef, useState } from 'react';

export interface OrderbookEntry {
  price: number;
  quantity: number;
}

export interface OrderbookSnapshot {
  timestamp: number;
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
}

export interface OrderbookHistoryResult {
  histories: Record<string, OrderbookSnapshot[]>;
  loading: boolean;
  error: string | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
}

const BINANCE_WS_URL =
  'wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms';

// Mock OKX data generator
function useMockOKXOrderbookHistory(historyLength = 30, snapshotInterval = 1000): OrderbookSnapshot[] {
  const [history, setHistory] = useState<OrderbookSnapshot[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random orderbook data
      const bids = Array.from({ length: 20 }).map((_, i) => ({
        price: 50000 - i * 2 + Math.random(),
        quantity: Math.random() * 5 + 1,
      }));
      const asks = Array.from({ length: 20 }).map((_, i) => ({
        price: 50000 + i * 2 + Math.random(),
        quantity: Math.random() * 5 + 1,
      }));
      setHistory((prev) => {
        const newSnapshot: OrderbookSnapshot = {
          timestamp: Date.now(),
          bids,
          asks,
        };
        const updated = [...prev, newSnapshot];
        return updated.length > historyLength ? updated.slice(updated.length - historyLength) : updated;
      });
    }, snapshotInterval);
    return () => clearInterval(interval);
  }, [historyLength, snapshotInterval]);
  return history;
}

export function useMultiVenueOrderbookHistory(
  venues = ['Binance', 'OKX'],
  historyLength = 30,
  snapshotInterval = 1000
): OrderbookHistoryResult {
  const [binanceHistory, setBinanceHistory] = useState<OrderbookSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const latestData = useRef<{ bids: OrderbookEntry[]; asks: OrderbookEntry[] }>({ bids: [], asks: [] });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    if (!venues.includes('Binance')) return;
    
    setConnectionStatus('connecting');
    wsRef.current = new WebSocket(BINANCE_WS_URL);
    
    wsRef.current.onopen = () => {
      setError(null);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
    };
    
    wsRef.current.onerror = (e) => {
      setError('Binance WebSocket connection error');
      setConnectionStatus('disconnected');
      setLoading(false);
    };
    
    wsRef.current.onclose = (event) => {
      setConnectionStatus('disconnected');
      setLoading(false);
      
      // Auto-reconnect logic
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setConnectionStatus('reconnecting');
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff, max 30s
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (venues.includes('Binance')) {
            connectWebSocket();
          }
        }, delay);
      } else {
        setError('Binance WebSocket connection failed after multiple attempts. Using mock data.');
        // Fallback to mock data for demo purposes
        setConnectionStatus('disconnected');
      }
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.bids && data.asks) {
          latestData.current = {
            bids: data.bids.slice(0, 20).map(([price, quantity]: [string, string]) => ({
              price: parseFloat(price),
              quantity: parseFloat(quantity),
            })),
            asks: data.asks.slice(0, 20).map(([price, quantity]: [string, string]) => ({
              price: parseFloat(price),
              quantity: parseFloat(quantity),
            })),
          };
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
  };

  // Binance WebSocket
  useEffect(() => {
    connectWebSocket();
    
    // Take a snapshot every snapshotInterval ms
    intervalRef.current = setInterval(() => {
      setBinanceHistory((prev) => {
        const newSnapshot: OrderbookSnapshot = {
          timestamp: Date.now(),
          bids: latestData.current.bids,
          asks: latestData.current.asks,
        };
        const updated = [...prev, newSnapshot];
        if (updated.length > 0) setLoading(false);
        return updated.length > historyLength ? updated.slice(updated.length - historyLength) : updated;
      });
    }, snapshotInterval);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [historyLength, snapshotInterval, venues]);

  // OKX mock
  const okxHistory = useMockOKXOrderbookHistory(historyLength, snapshotInterval);

  // Compose histories
  const histories: Record<string, OrderbookSnapshot[]> = {};
  if (venues.includes('Binance')) histories['Binance'] = binanceHistory;
  if (venues.includes('OKX')) histories['OKX'] = okxHistory;

  return { histories, loading, error, connectionStatus };
} 