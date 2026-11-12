/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  // Anteprima da far provare: un solo file HTML (scripts/anteprima.mjs) che non invia risposte,
  // con font e immagini incorporati.
  const preview = mode === 'anteprima';

  return {
    // GitHub Pages pubblica il sito in https://<utente>.github.io/solo-traveller-survey/
    base: preview ? './' : '/solo-traveller-survey/',
    plugins: [react(), tailwindcss()],
    build: preview
      ? { outDir: 'dist-anteprima', assetsInlineLimit: () => true, cssCodeSplit: false }
      : undefined,
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
    },
  };
});
