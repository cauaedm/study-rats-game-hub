import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.482d9e8b0721440290c9f1986bfb5d18',
  appName: 'StudyRats',
  webDir: 'dist',
  server: {
    url: 'https://482d9e8b-0721-4402-90c9-f1986bfb5d18.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#499BD1',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#499BD1'
    }
  }
};

export default config;
