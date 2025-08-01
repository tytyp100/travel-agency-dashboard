import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    noExternal: [/@syncfusion/]
  },
  define: {
    'process.env.VITE_FRONTEND_URL': JSON.stringify(process.env.VITE_FRONTEND_URL)
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit for Syncfusion components
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Syncfusion components into their own chunks
          'syncfusion-charts': [
            '@syncfusion/ej2-react-charts',
            '@syncfusion/ej2-charts'
          ],
          'syncfusion-grids': [
            '@syncfusion/ej2-react-grids',
            '@syncfusion/ej2-grids'
          ],
          'syncfusion-navigation': [
            '@syncfusion/ej2-react-navigations',
            '@syncfusion/ej2-navigations'
          ],
          'syncfusion-dropdowns': [
            '@syncfusion/ej2-react-dropdowns',
            '@syncfusion/ej2-dropdowns'
          ],
          'syncfusion-maps': [
            '@syncfusion/ej2-react-maps',
            '@syncfusion/ej2-maps'
          ]
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
});
