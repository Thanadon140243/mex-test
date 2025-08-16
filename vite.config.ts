import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/hal': {
        target: 'https://hal.hal-logistics.la',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hal/, ''),
      },
      '/api/shippop': {
        target: 'https://mkpservice.shippop.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/shippop/, ''),
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
  },
});