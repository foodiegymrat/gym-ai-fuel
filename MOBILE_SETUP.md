# 📱 Advanced AI Step Counter - Mobile Setup Guide

This fitness app features an advanced AI-powered step counter with real-time motion sensor data processing, adaptive detection algorithms, and comprehensive fitness tracking.

## 🎯 Features

### Advanced Step Detection
- **AI-Enhanced Algorithm**: Adaptive threshold detection that learns from your walking patterns
- **Activity Recognition**: Automatically detects walking, jogging, and running
- **High Accuracy**: Advanced filtering and smoothing to minimize false positives
- **Real-time Tracking**: Live step counting with sub-second latency
- **Terrain Adaptation**: Adjusts to different surfaces and walking styles

### Comprehensive Metrics
- **Step Count**: Accurate step counting with peak detection algorithm
- **Distance Tracking**: Personalized distance calculation based on height
- **Calorie Burn**: Activity-specific calorie estimation
- **Pace Monitoring**: Real-time steps per minute calculation
- **Activity History**: 7-day trend visualization and analytics

### Battery Optimization
- **Smart Sampling**: 50ms sensor intervals for smooth tracking without draining battery
- **Efficient Processing**: Optimized algorithms for minimal CPU usage
- **Background Support**: Uses Capacitor's background task support
- **Auto-save**: Periodic cloud sync every 30 seconds

## 🚀 Running on Mobile Devices

### Prerequisites
- Node.js and npm installed
- For iOS: Mac with Xcode installed
- For Android: Android Studio installed
- Git installed

### Step-by-Step Setup

#### 1. Export and Clone Project
```bash
# Export your project to GitHub using the "Export to Github" button in Lovable
# Then clone it locally
git clone <your-repo-url>
cd gym-ai-fuel
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Add Mobile Platforms
```bash
# For iOS (Mac only)
npx cap add ios
npx cap update ios

# For Android
npx cap add android
npx cap update android
```

#### 4. Build the Web App
```bash
npm run build
```

#### 5. Sync to Native Platforms
```bash
# This copies the web build to native projects
npx cap sync
```

#### 6. Run on Device/Emulator

**For iOS:**
```bash
npx cap run ios
```
This will open Xcode. Select your device or simulator and click Run.

**For Android:**
```bash
npx cap run android
```
This will open Android Studio. Select your device or emulator and click Run.

### 🔄 Development Workflow

After making code changes:
```bash
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
npm install

# 3. Rebuild
npm run build

# 4. Sync to native platforms
npx cap sync

# 5. Run on your platform
npx cap run ios  # or android
```

## 🏗️ Technical Architecture

### Motion Sensor Integration
The app uses Capacitor's Motion plugin to access:
- **Accelerometer**: 3-axis motion detection (x, y, z)
- **Gyroscope**: Rotation and orientation data (future enhancement)
- **Sampling Rate**: 50ms intervals (20Hz) for smooth real-time tracking

### Step Detection Algorithm

#### 1. **Data Smoothing**
- Low-pass filter with alpha = 0.8
- 5-point moving average
- Removes sensor noise and jitter

#### 2. **Peak Detection**
- Magnitude calculation: `sqrt(x² + y² + z²)`
- Adaptive threshold based on recent activity
- Minimum 200ms between peaks (prevents double-counting)
- 70% of last peak validation

#### 3. **Activity Classification**
- **Idle**: < 20 steps/min
- **Walking**: 20-80 steps/min
- **Jogging**: 80-120 steps/min
- **Running**: > 120 steps/min

#### 4. **Calorie Calculation**
Uses MET (Metabolic Equivalent of Task) values:
- Walking: 3.5 MET
- Jogging: 7.0 MET
- Running: 10.0 MET

Formula: `Calories = MET × weight(kg) × duration(hours)`

#### 5. **Distance Estimation**
- Stride length: `height(cm) × 0.415 / 100` meters
- Distance: `steps × stride_length`

### Database Integration
Automatically syncs with Supabase:
- **user_activities**: Individual walking/running sessions
- **daily_summaries**: Aggregated daily totals
- **Auto-save**: Every 30 seconds during active tracking

## 🔧 Configuration

### Adjust User Parameters
In `src/pages/Index.tsx` or wherever you use the component:

```tsx
<AdvancedStepCounter 
  userId="user-id-here"
  userWeight={70}  // kg
  userHeight={170} // cm
/>
```

### Modify Detection Sensitivity
In `src/hooks/useStepDetection.ts`:

```typescript
const peakDetectionRef = useRef({
  lastPeak: 0,
  threshold: 1.2,        // Lower = more sensitive
  minPeakDistance: 200,  // Minimum ms between steps
  adaptiveThreshold: true
});
```

### Battery Optimization
In `capacitor.config.ts`:

```typescript
plugins: {
  Motion: {
    accelInterval: 50,  // Increase for better battery (e.g., 100ms)
    gyroInterval: 50
  }
}
```

## 📊 Data Visualization

The app includes:
- **Real-time Progress Bar**: Visual goal tracking
- **Activity Type Badge**: Color-coded current activity
- **Stats Grid**: Distance, calories, and pace
- **7-Day History Chart**: Trend analysis with Recharts
- **Daily Summary**: Total and average calculations

## 🔐 Permissions

The app requires:
- **Motion Sensors**: Accelerometer access for step counting
- **Storage**: Local storage for session persistence

On first use, users will be prompted to grant permissions.

## 🐛 Troubleshooting

### "Permission Required" Error
- **iOS**: Check Settings > Privacy > Motion & Fitness
- **Android**: Check Settings > Apps > Permissions > Physical activity

### No Steps Detected
1. Ensure you're on a physical device (simulator won't have real sensors)
2. Check that tracking is started (green "Stop" button)
3. Try walking with phone in pocket or hand
4. Verify sensor permissions are granted

### Battery Draining Fast
- Increase `accelInterval` in config (e.g., 100ms instead of 50ms)
- Stop tracking when not in use
- Reduce auto-save frequency in code

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules
npm install
npm run build
npx cap sync
```

## 📚 Learn More

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Motion Plugin](https://capacitorjs.com/docs/apis/motion)
- [Lovable Blog: Running Apps on Physical Devices](https://lovable.dev/blogs/mobile-development)

## 🎓 Algorithm References

The step detection algorithm is based on:
- Peak detection in accelerometer signals
- Adaptive thresholding for different walking styles
- Moving average filters for noise reduction
- Activity classification using pace analysis

## 💡 Tips for Best Results

1. **Calibration**: Walk normally for 1-2 minutes to let the algorithm adapt
2. **Phone Placement**: Keep phone in pocket or on arm for consistent readings
3. **Terrain**: Algorithm adapts automatically to stairs, hills, and flat surfaces
4. **Battery**: Monitor battery in Settings if using extended tracking

---

**Need Help?** Check the troubleshooting section or contact support@lovable.dev
