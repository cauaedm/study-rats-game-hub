import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    // Configure Status Bar
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#499BD1' });
    } catch (error) {
      console.error('Error configuring status bar:', error);
    }

    // Hide Splash Screen after app loads
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }
};

export const isNative = () => Capacitor.isNativePlatform();
