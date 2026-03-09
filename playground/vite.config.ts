import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pue } from '../src/plugin'

export default defineConfig({
  plugins: [pue(), vue()],
})
