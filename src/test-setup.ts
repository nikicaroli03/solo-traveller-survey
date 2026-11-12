import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Nei test l'intro animata del logo è già "vista": si parte dalla schermata iniziale.
// La si prova a parte, togliendo questo flag.
beforeEach(() => {
  sessionStorage.setItem('solo-survey:intro-vista', '1');
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
