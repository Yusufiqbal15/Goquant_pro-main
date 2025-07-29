import React from 'react';

const Orderbook3DVisualizer = React.lazy(() => import('./visualizer/Orderbook3DVisualizer'));

export default function HomePage() {
  return (
    <main style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <React.Suspense fallback={<div>Loading 3D Visualizer...</div>}>
        <Orderbook3DVisualizer />
      </React.Suspense>
    </main>
  );
}
