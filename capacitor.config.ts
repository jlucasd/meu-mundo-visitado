import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.jlucasd.meumundovisitado',
  appName: 'Meu Mundo Visitado',
  webDir: 'dist',
  backgroundColor: '#07070b',
  android: {
    allowMixedContent: false,
  },
}

export default config
