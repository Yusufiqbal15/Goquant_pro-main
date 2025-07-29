# Orderbook Depth 3D Visualizer

A Next.js application that displays a rotating 3D graph visualization of cryptocurrency orderbook data with real-time updates, venue filtering, and pressure zone analysis.

## 🚀 Features

### Core Functionality
- **3D Orderbook Visualization**: Interactive 3D graph with X-axis (price), Y-axis (quantity), and Z-axis (time)
- **Real-time Data**: Live orderbook data from Binance WebSocket API
- **Multi-venue Support**: Binance (live) and OKX (mock data)
- **Smooth Auto-rotation**: Automatic rotation around Z-axis to showcase temporal dimension
- **Manual Controls**: Pan, zoom, and rotate for detailed exploration

### Advanced Features
- **Cumulative Depth Visualization**: Shows cumulative order quantities at each price level
- **Pressure Zone Analysis**: Highlights high-pressure zones (top 20% cumulative volume)
- **Venue Filtering**: Show/hide specific trading venues with color coding
- **Time Range Selection**: View 1m, 5m, 15m, or 1h of orderbook history
- **Price/Quantity Filters**: Filter bars by price and quantity ranges
- **Search Functionality**: Search and highlight specific price levels
- **Visualization Modes**: Toggle auto-rotation, freeze, and pressure zone display

### Interactive Controls
- **Real-time Mode**: Live updates with auto-rotation
- **Freeze Mode**: Pause at current snapshot for detailed analysis
- **Pressure Zone Toggle**: Show/hide pressure zone highlights
- **Connection Status**: Real-time WebSocket connection monitoring

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **3D Graphics**: Three.js via @react-three/fiber and @react-three/drei
- **Language**: TypeScript
- **Real-time Data**: WebSocket connections to Binance API
- **State Management**: React Hooks
- **Styling**: Inline CSS with responsive design

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd goquant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000/visualizer`

## 🎮 Usage

### Basic Navigation
- **Mouse/Touch**: Pan, zoom, and rotate the 3D view
- **Auto-rotation**: Toggle on/off in the control panel
- **Freeze**: Pause the visualization at current state

### Filtering & Analysis
- **Venue Selection**: Check/uncheck venues to show/hide
- **Time Range**: Select historical data window (1m to 1h)
- **Price/Quantity Filters**: Set min/max ranges
- **Search**: Enter a price to highlight matching bars
- **Pressure Zones**: Toggle yellow highlights for high-volume areas

### Color Coding
- **Green/Red**: Bid/Ask orders
- **Blue/Orange**: Cumulative bid/ask depth
- **Yellow**: Pressure zones (high volume concentration)
- **Multi-venue**: Different color schemes for each venue

## 🔧 Technical Implementation

### Data Flow
1. **WebSocket Connection**: Real-time orderbook data from Binance
2. **Data Processing**: Parse and structure orderbook snapshots
3. **3D Rendering**: Convert data to 3D bars with Three.js
4. **User Interaction**: Handle filters, controls, and real-time updates

### Key Components
- `Orderbook3DVisualizer.tsx`: Main visualization component
- `BinanceOrderbookHook.ts`: WebSocket data management
- `Scene`: 3D rendering logic
- Control Panel: User interface for filters and settings

### Performance Optimizations
- Efficient data structures for large orderbook datasets
- Real-time updates without disrupting rotation
- Automatic WebSocket reconnection with exponential backoff
- Responsive design for desktop and mobile

## 📊 Assignment Requirements Fulfilled

### ✅ Core Requirements
- [x] 3D orderbook graph with price, quantity, time axes
- [x] Smooth rotation animation around Z-axis
- [x] Manual controls (pan, zoom, rotate)
- [x] Real-time data integration (Binance WebSocket)
- [x] Venue filtering system (Binance, OKX)
- [x] Pressure zone analysis and visualization
- [x] Interactive controls and filters
- [x] Price/quantity labels and tick marks
- [x] Error handling and loading states

### ✅ Advanced Features
- [x] Cumulative depth visualization
- [x] Multiple venue support with color coding
- [x] Time range selectors (1m, 5m, 15m, 1h)
- [x] Search functionality for price levels
- [x] Visualization mode toggles
- [x] Connection status monitoring
- [x] Responsive design

### ✅ Technical Requirements
- [x] TypeScript implementation
- [x] Modern React patterns (hooks, functional components)
- [x] Efficient data structures
- [x] Error handling and edge cases
- [x] Real-time data management

## 🎯 Demo Features

### Real-time Orderbook Visualization
- Live BTCUSDT orderbook data from Binance
- 3D bars representing price levels and quantities
- Temporal dimension showing orderbook evolution

### Multi-venue Analysis
- Compare orderbook depth across venues
- Color-coded visualization for easy identification
- Venue-specific filtering and analysis

### Pressure Zone Detection
- Automatic identification of high-volume areas
- Visual highlighting of pressure zones
- Real-time pressure zone updates

## 🚨 Error Handling

- **WebSocket Reconnection**: Automatic reconnection with exponential backoff
- **Connection Status**: Real-time status indicators
- **Fallback Data**: Mock data when live connection fails
- **Loading States**: Clear feedback during data loading
- **Error Messages**: User-friendly error notifications

## 📱 Responsive Design

- **Desktop**: Full 3D visualization with all controls
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Responsive control panel and 3D view

## 🔮 Future Enhancements

- Additional venues (Bybit, Deribit, etc.)
- Advanced pressure zone algorithms
- Volume profile overlay
- Order flow visualization
- Export functionality
- Machine learning-based predictions

## 📝 Submission Notes

### Project Structure
```
goquant/
├── src/
│   └── app/
│       └── visualizer/
│           ├── Orderbook3DVisualizer.tsx
│           ├── BinanceOrderbookHook.ts
│           └── page.tsx
├── README.md
└── package.json
```

### Key Files
- `Orderbook3DVisualizer.tsx`: Main visualization component
- `BinanceOrderbookHook.ts`: Data fetching and WebSocket management
- `page.tsx`: Next.js page routing

### Demo Instructions
1. Start the development server
2. Navigate to `/visualizer`
3. Observe real-time 3D orderbook visualization
4. Test filters, controls, and search functionality
5. Demonstrate pressure zone analysis

## 🤝 Contributing

This project was developed as an assignment submission. For questions or improvements, please refer to the assignment guidelines.

## 📄 License

This project is developed for educational purposes as part of an academic assignment.

---

**Assignment Title**: Orderbook Depth 3D Visualizer  
**Objective**: Create a Next.js application with real-time 3D cryptocurrency orderbook visualization  
**Status**: ✅ Complete with all core and advanced features implemented
