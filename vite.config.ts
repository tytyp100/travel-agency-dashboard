import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path'; // Add this import

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      // Add this alias to help Vite find Syncfusion files
      '@syncfusion': path.resolve(__dirname, 'node_modules/@syncfusion')
    }
  }
});