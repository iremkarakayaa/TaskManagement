import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173, // Ýstediðin portu buraya yazabilirsin
        strictPort: true, // Eðer port meþgulse hata versin
        hmr: {
            protocol: 'ws', // WebSocket protokolü
            host: 'localhost', // Host adý
        },
    },
});
