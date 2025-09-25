import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      // Define global process object for browser compatibility
      global: 'globalThis',
      // Expose env variables to your client-side code
      'process.env': JSON.stringify(env)
    },
    // Handle environment variables
    envPrefix: ['VITE_', 'REACT_APP_']
  }
})
