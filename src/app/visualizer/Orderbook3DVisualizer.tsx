"use client";
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { useMultiVenueOrderbookHistory } from './BinanceOrderbookHook';
import type { OrderbookSnapshot, OrderbookEntry } from './BinanceOrderbookHook';

const BAR_WIDTH = 0.5;
const BAR_DEPTH = 0.5;
const BAR_GAP = 0.1;
const MAX_BAR_HEIGHT = 6;
const SNAPSHOT_GAP = 0.7; // Distance between time steps on Z-axis
const HISTORY_LENGTH = 30;
const TICK_FONT_SIZE = 0.25;
const TICK_COLOR = '#fff';

const PRESSURE_ZONE_COLOR = 'yellow';
const PRESSURE_ZONE_ALPHA = 0.7;

const VENUE_COLORS = {
  Binance: { bid: 'green', ask: 'red', cumBid: 'blue', cumAsk: 'orange' },
  OKX: { bid: '#00ff99', ask: '#ff00cc', cumBid: '#00bfff', cumAsk: '#ffb347' },
} as const;

type VenueName = keyof typeof VENUE_COLORS;

const DEFAULT_PRICE_RANGE: [number, number] = [48000, 52000];
const DEFAULT_QTY_RANGE: [number, number] = [0, 10];

const TIME_RANGES = [
  { label: '1m', value: 1 },
  { label: '5m', value: 5 },
  { label: '15m', value: 15 },
  { label: '1h', value: 60 },
];
const SNAPSHOT_INTERVAL_SEC = 1; // 1 second per snapshot

const Orderbook3DVisualizer: React.FC = () => {
  const [selectedVenues, setSelectedVenues] = useState<string[]>(['Binance', 'OKX']);
  // Visualization mode state
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [freeze, setFreeze] = useState<boolean>(false);
  const [showPressure, setShowPressure] = useState<boolean>(true);
  // Time range state (in minutes)
  const [timeRange, setTimeRange] = useState<number>(1);
  // Calculate number of snapshots to show
  const historyLength = Math.max(1, Math.floor((timeRange * 60) / SNAPSHOT_INTERVAL_SEC));
  const { histories, loading, error, connectionStatus } = useMultiVenueOrderbookHistory(selectedVenues, historyLength, SNAPSHOT_INTERVAL_SEC * 1000);

  // Price and quantity filter state
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [qtyRange, setQtyRange] = useState<[number, number]>(DEFAULT_QTY_RANGE);
  
  // Search functionality
  const [searchPrice, setSearchPrice] = useState<string>('');
  const [highlightedPrice, setHighlightedPrice] = useState<number | null>(null);

  const handleVenueChange = (venue: string) => {
    setSelectedVenues((prev) =>
      prev.includes(venue) ? prev.filter((v) => v !== venue) : [...prev, venue]
    );
  };

  const handleSearch = () => {
    const price = parseFloat(searchPrice);
    if (!isNaN(price)) {
      setHighlightedPrice(price);
    }
  };

  // Filtering logic for Scene
  const filterBar = (price: number, qty: number) => {
    return price >= priceRange[0] && price <= priceRange[1] && qty >= qtyRange[0] && qty <= qtyRange[1];
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#00ff00';
      case 'connecting': return '#ffff00';
      case 'reconnecting': return '#ffaa00';
      case 'disconnected': return '#ff0000';
      default: return '#888';
    }
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading orderbook data...</div>;
  }
  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      {/* Control panel UI */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: '#222', padding: 10, borderRadius: 8, color: '#fff', minWidth: 220 }}>
        {/* Connection Status */}
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Connection Status</div>
        <div style={{ marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: getConnectionStatusColor(connectionStatus) }}>●</span>
          Binance: {connectionStatus}
        </div>
        {error && (
          <div style={{ marginBottom: 8, fontSize: 11, color: '#ff6666' }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Visualization Modes</div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13, marginRight: 8 }}>
            <input type="checkbox" checked={autoRotate} onChange={() => setAutoRotate(v => !v)} /> Auto-Rotate
          </label>
          <label style={{ fontSize: 13, marginRight: 8 }}>
            <input type="checkbox" checked={freeze} onChange={() => setFreeze(v => !v)} /> Freeze (Pause)
          </label>
          <label style={{ fontSize: 13 }}>
            <input type="checkbox" checked={showPressure} onChange={() => setShowPressure(v => !v)} /> Pressure Zones
          </label>
        </div>
        
        {/* Search functionality */}
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Search</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <input 
              type="number" 
              placeholder="Enter price" 
              value={searchPrice}
              onChange={(e) => setSearchPrice(e.target.value)}
              style={{ width: 80 }}
            />
            <button 
              onClick={handleSearch}
              style={{ 
                background: '#444', 
                color: '#fff', 
                border: '1px solid #555', 
                borderRadius: 4, 
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </div>
          {highlightedPrice && (
            <div style={{ fontSize: 11, color: '#00ff00' }}>
              Highlighting: {highlightedPrice.toFixed(2)}
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Filters</div>
        {/* Time range selector */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>Time Range:</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                style={{
                  background: timeRange === tr.value ? '#444' : '#222',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: 4,
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontWeight: timeRange === tr.value ? 'bold' : 'normal',
                }}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>Price Range:</label>
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            <input type="number" value={priceRange[0]} min={0} max={priceRange[1]} step={1}
              onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
              style={{ width: 60 }} />
            <span>-</span>
            <input type="number" value={priceRange[1]} min={priceRange[0]} max={999999} step={1}
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              style={{ width: 60 }} />
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>Quantity Range:</label>
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            <input type="number" value={qtyRange[0]} min={0} max={qtyRange[1]} step={0.1}
              onChange={e => setQtyRange([+e.target.value, qtyRange[1]])}
              style={{ width: 60 }} />
            <span>-</span>
            <input type="number" value={qtyRange[1]} min={qtyRange[0]} max={9999} step={0.1}
              onChange={e => setQtyRange([qtyRange[0], +e.target.value])}
              style={{ width: 60 }} />
          </div>
        </div>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Venue Filter</div>
        {Object.keys(VENUE_COLORS).map((venue) => (
          <label key={venue} style={{ display: 'block', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={selectedVenues.includes(venue)}
              onChange={() => handleVenueChange(venue)}
              style={{ marginRight: 6 }}
            />
            <span style={{ color: VENUE_COLORS[venue as VenueName].bid }}>{venue}</span>
          </label>
        ))}
        <div style={{ marginTop: 10, fontWeight: 'bold' }}>Legend</div>
        {Object.entries(VENUE_COLORS).map(([venue, colors]) => (
          <div key={venue} style={{ fontSize: 12, marginTop: 2 }}>
            <span style={{ color: colors.bid, marginRight: 6 }}>■</span>Bid
            <span style={{ color: colors.ask, margin: '0 6px' }}>■</span>Ask
            <span style={{ color: colors.cumBid, margin: '0 6px' }}>■</span>CumBid
            <span style={{ color: colors.cumAsk, margin: '0 6px' }}>■</span>CumAsk
          </div>
        ))}
        <div style={{ fontSize: 12, marginTop: 6 }}>
          <span style={{ color: PRESSURE_ZONE_COLOR, marginRight: 6 }}>■</span>Pressure Zone (Top 20% Cumulative)
        </div>
      </div>
      <Canvas shadows>
        <Scene 
          histories={histories} 
          filterBar={filterBar} 
          autoRotate={autoRotate && !freeze} 
          freeze={freeze} 
          showPressure={showPressure}
          highlightedPrice={highlightedPrice}
        />
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};

const Scene: React.FC<{
  histories: Record<string, OrderbookSnapshot[]>;
  filterBar: (price: number, qty: number) => boolean;
  autoRotate: boolean;
  freeze: boolean;
  showPressure: boolean;
  highlightedPrice: number | null;
}> = ({ histories, filterBar, autoRotate, freeze, showPressure, highlightedPrice }) => {
  const groupRef = useRef<any>(null);
  // Find all venues
  const venues = Object.keys(histories);
  // Find max quantity for scaling (across all venues)
  const maxBidQty = Math.max(
    ...venues.flatMap((venue) => histories[venue].flatMap((snap: OrderbookSnapshot) => snap.bids.map((b: OrderbookEntry) => b.quantity))),
    1
  );
  const maxAskQty = Math.max(
    ...venues.flatMap((venue) => histories[venue].flatMap((snap: OrderbookSnapshot) => snap.asks.map((a: OrderbookEntry) => a.quantity))),
    1
  );
  // Find max cumulative quantity for scaling
  const maxBidCum = Math.max(
    ...venues.flatMap((venue) => histories[venue].flatMap((snap: OrderbookSnapshot) => {
      let cum = 0;
      return snap.bids.map((b: OrderbookEntry) => (cum += b.quantity));
    })),
    1
  );
  const maxAskCum = Math.max(
    ...venues.flatMap((venue) => histories[venue].flatMap((snap: OrderbookSnapshot) => {
      let cum = 0;
      return snap.asks.map((a: OrderbookEntry) => (cum += a.quantity));
    })),
    1
  );
  // Auto-rotate the group around Z-axis
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3; // Adjust speed as needed
    }
  });
  // If freeze, only show the latest snapshot for each venue
  const venuesToRender = freeze ? [venues[0]] : venues;

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={60} />
      {/* Axes */}
      <axesHelper args={[5]} />
      {/* Grid */}
      <gridHelper args={[20, 20, '#444', '#222']} />
      {/* Orderbook history bars for all venues */}
      <group ref={groupRef}>
        {venuesToRender.map((venue: string, vIdx: number) =>
          (freeze
            ? histories[venue].slice(-1)
            : histories[venue]
          ).map((snapshot: OrderbookSnapshot, t: number) => {
            // Cumulative sums for this snapshot
            let bidCum = 0;
            let askCum = 0;
            const color = VENUE_COLORS[venue as VenueName] || VENUE_COLORS.Binance;
            // Offset each venue on the X axis for clarity
            const xOffset = vIdx * 2.5;

            // --- Pressure zone detection ---
            // Compute cumulative arrays for this snapshot
            const bidCumArr: number[] = [];
            let bidSum = 0;
            snapshot.bids.forEach((b) => { bidSum += b.quantity; bidCumArr.push(bidSum); });
            const askCumArr: number[] = [];
            let askSum = 0;
            snapshot.asks.forEach((a) => { askSum += a.quantity; askCumArr.push(askSum); });
            // Find threshold for top 20% pressure
            const bidThreshold = Math.max(...bidCumArr) * 0.8;
            const askThreshold = Math.max(...askCumArr) * 0.8;

            return (
              <React.Fragment key={venue + '-' + snapshot.timestamp}>
                {/* Bids */}
                {snapshot.bids.map((bid: OrderbookEntry, i: number) => {
                  if (!filterBar(bid.price, bid.quantity)) return null;
                  const height = (bid.quantity / maxBidQty) * MAX_BAR_HEIGHT;
                  bidCum += bid.quantity;
                  const cumHeight = (bidCum / maxBidCum) * MAX_BAR_HEIGHT;
                  const isPressure = bidCumArr[i] >= bidThreshold;
                  const isHighlighted = highlightedPrice && Math.abs(bid.price - highlightedPrice) < 0.1;
                  return (
                    <React.Fragment key={`bid-${venue}-${t}-${i}`}>
                      <mesh position={[-2 + xOffset, height / 2, t * SNAPSHOT_GAP + i * (BAR_WIDTH + BAR_GAP) - 5]}>
                        <boxGeometry args={[BAR_WIDTH, height, BAR_DEPTH]} />
                        <meshStandardMaterial color={isHighlighted ? '#ffff00' : color.bid} />
                        {showPressure && isPressure && (
                          <meshBasicMaterial attach="material" color={PRESSURE_ZONE_COLOR} transparent opacity={PRESSURE_ZONE_ALPHA} wireframe />
                        )}
                      </mesh>
                      {/* Cumulative bar */}
                      <mesh position={[-2.7 + xOffset, cumHeight / 2, t * SNAPSHOT_GAP + i * (BAR_WIDTH + BAR_GAP) - 5]}>
                        <boxGeometry args={[BAR_WIDTH, cumHeight, BAR_DEPTH]} />
                        <meshStandardMaterial color={color.cumBid} />
                      </mesh>
                    </React.Fragment>
                  );
                })}
                {/* Asks */}
                {snapshot.asks.map((ask: OrderbookEntry, i: number) => {
                  if (!filterBar(ask.price, ask.quantity)) return null;
                  const height = (ask.quantity / maxAskQty) * MAX_BAR_HEIGHT;
                  askCum += ask.quantity;
                  const cumHeight = (askCum / maxAskCum) * MAX_BAR_HEIGHT;
                  const isPressure = askCumArr[i] >= askThreshold;
                  const isHighlighted = highlightedPrice && Math.abs(ask.price - highlightedPrice) < 0.1;
                  return (
                    <React.Fragment key={`ask-${venue}-${t}-${i}`}>
                      <mesh position={[2 + xOffset, height / 2, t * SNAPSHOT_GAP + i * (BAR_WIDTH + BAR_GAP) - 5]}>
                        <boxGeometry args={[BAR_WIDTH, height, BAR_DEPTH]} />
                        <meshStandardMaterial color={isHighlighted ? '#ffff00' : color.ask} />
                        {showPressure && isPressure && (
                          <meshBasicMaterial attach="material" color={PRESSURE_ZONE_COLOR} transparent opacity={PRESSURE_ZONE_ALPHA} wireframe />
                        )}
                      </mesh>
                      {/* Cumulative bar */}
                      <mesh position={[2.7 + xOffset, cumHeight / 2, t * SNAPSHOT_GAP + i * (BAR_WIDTH + BAR_GAP) - 5]}>
                        <boxGeometry args={[BAR_WIDTH, cumHeight, BAR_DEPTH]} />
                        <meshStandardMaterial color={color.cumAsk} />
                      </mesh>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })
        )}
      </group>
      {/* Price and quantity ticks for latest snapshot (first venue) */}
      {histories[venues[0]] && (
        <group>
          {/* Bid price ticks */}
          {histories[venues[0]][histories[venues[0]].length - 1]?.bids.map((bid: OrderbookEntry, i: number) => (
            <Text
              key={`bid-price-tick-${i}`}
              position={[-2, -0.5, (histories[venues[0]].length - 1) * SNAPSHOT_GAP + i * (BAR_WIDTH + BAR_GAP) - 5]}
              fontSize={TICK_FONT_SIZE}
              color={TICK_COLOR}
              anchorX="center"
              anchorY="middle"
            >
              {bid.price.toFixed(2)}
            </Text>
          ))}
          {/* Ask price ticks */}
          {histories[venues[0]][histories[venues[0]].length - 1]?.asks.map((ask: OrderbookEntry, i: number) => (
            <Text
              key={`ask-price-tick-${i}`}
              position={[2, -0.5, (histories[venues[0]].length - 1) * SNAPSHOT_GAP + i * (BAR_WIDTH + BAR_GAP) - 5]}
              fontSize={TICK_FONT_SIZE}
              color={TICK_COLOR}
              anchorX="center"
              anchorY="middle"
            >
              {ask.price.toFixed(2)}
            </Text>
          ))}
          {/* Quantity ticks (Y-axis) */}
          {Array.from({ length: 6 }).map((_, i: number) => (
            <Text
              key={`qty-tick-${i}`}
              position={[-3.5, (i / 5) * MAX_BAR_HEIGHT, (histories[venues[0]].length - 1) * SNAPSHOT_GAP - 7]}
              fontSize={TICK_FONT_SIZE}
              color={TICK_COLOR}
              anchorX="center"
              anchorY="middle"
            >
              {(maxBidQty * (i / 5)).toFixed(2)}
            </Text>
          ))}
        </group>
      )}
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
    </>
  );
};

export default Orderbook3DVisualizer; 