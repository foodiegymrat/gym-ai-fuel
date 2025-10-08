import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.36a2db93322549aeaa0243e6eebdc0ad',
  appName: 'gym-ai-fuel',
  webDir: 'dist',
  server: {
    url: 'https://36a2db93-3225-49ae-aa02-43e6eebdc0ad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Motion: {
      accelInterval: 50, // 50ms for smooth real-time tracking
      gyroInterval: 50
    }
  }
};

export default config;
