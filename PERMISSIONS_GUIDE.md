# 🔐 Motion Sensor Permissions Guide

Complete guide for setting up and troubleshooting motion sensor permissions for the AI Step Tracker.

## 📱 Overview

The step tracking feature requires access to your device's motion sensors (accelerometer) to count steps accurately. This guide covers:
- Platform-specific permission setup (iOS & Android)
- How to configure native app permissions
- Troubleshooting common permission issues
- Testing permissions during development

---

## 🍎 iOS Setup

### 1. Configure Info.plist

When you add the iOS platform (`npx cap add ios`), you need to configure the `Info.plist` file with motion usage descriptions.

**Location:** `ios/App/App/Info.plist`

Add the following entry:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Your existing keys... -->
    
    <!-- Motion Sensor Permission -->
    <key>NSMotionUsageDescription</key>
    <string>This app needs access to your motion sensors to accurately count your steps and track your fitness activities throughout the day.</string>
    
</dict>
</plist>
```

### 2. Permission Request Flow

On iOS, the system will automatically show a permission dialog when your app first tries to access motion sensors. The dialog will display your `NSMotionUsageDescription` text.

### 3. User Settings

If a user denies permission, they can re-enable it at:

**Settings → Privacy & Security → Motion & Fitness → [Your App Name]**

Toggle the switch to **ON**.

### 4. Testing on iOS

```bash
# Build and run on iOS device or simulator
npm run build
npx cap sync ios
npx cap run ios
```

**Note:** iOS Simulator has limited motion sensor capabilities. Test on a real device for accurate results.

---

## 🤖 Android Setup

### 1. Configure AndroidManifest.xml

When you add the Android platform (`npx cap add android`), you need to configure permissions in the manifest.

**Location:** `android/app/src/main/AndroidManifest.xml`

Add the following permissions:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Motion and Activity Recognition Permissions -->
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="android.permission.BODY_SENSORS" />
    
    <!-- Your existing permissions... -->
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <!-- Your existing configuration... -->
        
    </application>
</manifest>
```

### 2. Runtime Permissions (Android 10+)

For Android 10 (API level 29) and above, `ACTIVITY_RECOGNITION` is a dangerous permission that requires runtime request. The Capacitor Motion plugin handles this automatically, but you should be aware of this behavior.

### 3. User Settings

If a user denies permission, they can re-enable it at:

**Settings → Apps → [Your App Name] → Permissions → Physical Activity → Allow**

Alternative path:
**Settings → Privacy → Permission Manager → Physical Activity → [Your App Name] → Allow**

### 4. Testing on Android

```bash
# Build and run on Android device or emulator
npm run build
npx cap sync android
npx cap run android
```

**Note:** Android emulators may have limited sensor capabilities. Test on a real device for best results.

---

## 🛠️ Complete Setup Steps

### Step 1: Export Project to GitHub
1. Click **"Export to GitHub"** button in Lovable
2. Authorize the Lovable GitHub App
3. Create repository

### Step 2: Clone and Install
```bash
git clone <your-repo-url>
cd gym-ai-fuel
npm install
```

### Step 3: Add Native Platforms
```bash
# For iOS (Mac with Xcode required)
npx cap add ios
npx cap update ios

# For Android (Android Studio required)
npx cap add android
npx cap update android
```

### Step 4: Configure Permissions

**For iOS:**
Edit `ios/App/App/Info.plist` and add the `NSMotionUsageDescription` key as shown above.

**For Android:**
Edit `android/app/src/main/AndroidManifest.xml` and add the permissions as shown above.

### Step 5: Build and Sync
```bash
npm run build
npx cap sync
```

### Step 6: Test on Device
```bash
# For iOS
npx cap run ios

# For Android
npx cap run android
```

---

## 🐛 Troubleshooting

### Permission Request Not Showing

**iOS:**
- Check that `NSMotionUsageDescription` is properly added to `Info.plist`
- Delete the app and reinstall to trigger the permission prompt again
- Reset permissions: Settings → General → Reset → Reset Location & Privacy

**Android:**
- Verify `ACTIVITY_RECOGNITION` permission is in `AndroidManifest.xml`
- Check Android version (permissions work differently on Android 10+)
- Clear app data: Settings → Apps → [Your App] → Storage → Clear Data

### Permission Always Denied

**iOS:**
- Go to Settings → Privacy & Security → Motion & Fitness
- Ensure the app is listed and toggled ON
- Restart the app after enabling permission

**Android:**
- Go to Settings → Apps → [Your App] → Permissions
- Ensure "Physical Activity" is set to "Allow"
- Try "Allow all the time" if "Allow only while using the app" doesn't work

### Steps Not Being Counted

1. **Check Permission Status:**
   - The app displays the current permission status
   - Look for error messages in the UI

2. **Verify Sensor Availability:**
   - Not all devices have accelerometers (rare but possible)
   - Test on a known working device

3. **Check Console Logs:**
   ```bash
   # For iOS
   npx cap run ios
   # Then open Safari → Develop → [Your Device] → Console
   
   # For Android
   npx cap run android
   # Android Studio → Logcat shows console logs
   ```

4. **Reset the App:**
   - Use the "Reset" button in the app
   - Close and reopen the app
   - Reinstall the app if needed

### Simulation Mode on Mobile Device

If you see "Development Mode - Using simulated step data" on a real device:
- Permission was likely denied
- Check device settings and grant permission
- Restart the app

### Build Errors After Adding Permissions

**iOS:**
```bash
cd ios/App
pod install --repo-update
cd ../..
npx cap sync ios
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

---

## 🧪 Testing Checklist

- [ ] Permission request appears on first launch
- [ ] Permission can be granted successfully
- [ ] Steps are counted when walking with device
- [ ] Permission denial is handled gracefully
- [ ] User can navigate to settings to enable permission
- [ ] App works correctly after granting permission
- [ ] Reset functionality works as expected
- [ ] Data saves correctly to Supabase

---

## 📚 Additional Resources

### Official Documentation
- [Capacitor Motion Plugin](https://capacitorjs.com/docs/apis/motion)
- [iOS Motion & Fitness Privacy](https://developer.apple.com/documentation/coremotion)
- [Android Activity Recognition](https://developer.android.com/guide/topics/sensors/sensors_motion)

### Permission Best Practices
- Always explain why you need permissions before requesting
- Provide clear instructions when permissions are denied
- Allow users to retry permission requests
- Test on real devices, not just simulators

### Support
- [Capacitor Community Discord](https://discord.gg/capacitor)
- [Lovable Documentation](https://docs.lovable.dev)
- [GitHub Issues](https://github.com/ionic-team/capacitor/issues)

---

## 💡 Pro Tips

1. **Test Early:** Always test permissions on real devices during development
2. **Clear Messages:** Make sure your permission descriptions are user-friendly
3. **Graceful Degradation:** Handle permission denial elegantly with helpful messages
4. **Multiple Attempts:** Allow users to retry permission requests
5. **Settings Link:** Consider adding a direct link to app settings for denied permissions
6. **Platform Detection:** Show platform-specific instructions (iOS vs Android)

---

**Last Updated:** 2025-11-01  
**Compatible with:** Capacitor 7.x, iOS 14+, Android 10+
