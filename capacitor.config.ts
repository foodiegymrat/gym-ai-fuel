import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.36a2db93322549aeaa0243e6eebdc0ad',
  appName: 'Foodiegymrat',
  webDir: 'dist',
  server: {
    url: 'https://36a2db93-3225-49ae-aa02-43e6eebdc0ad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Motion: {
      accelInterval: 20, // 20ms (50Hz) for highly accurate real-time tracking
      gyroInterval: 100  // Gyro not needed for steps, reduce frequency
    }
  }
};

export default config;
