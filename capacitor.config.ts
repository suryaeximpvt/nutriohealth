import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a2437c59d17943cf9086fb365d70d08a',
  appName: 'Nutrio',
  webDir: 'dist',
  server: {
    url: 'https://a2437c59-d179-43cf-9086-fb365d70d08a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav'
    }
  }
};

export default config;
