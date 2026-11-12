import type { Answers } from './answers';

const PROGRESS_KEY = 'solo-survey:risposte';
const SUBMITTED_KEY = 'solo-survey:inviata';

export interface Progress {
  answers: Answers;
  step: number;
}

// localStorage può non essere disponibile (navigazione privata, cookie bloccati):
// in quel caso la survey funziona comunque, semplicemente senza ripristino.

export function loadProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Progress>;
    if (
      typeof data.step !== 'number' ||
      typeof data.answers?.values !== 'object' ||
      typeof data.answers?.others !== 'object'
    ) {
      return null;
    }
    return data as Progress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignorato: vedi sopra
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // ignorato
  }
}

export function isSubmitted(): boolean {
  try {
    return localStorage.getItem(SUBMITTED_KEY) !== null;
  } catch {
    return false;
  }
}

export function markSubmitted() {
  try {
    localStorage.setItem(SUBMITTED_KEY, new Date().toISOString());
  } catch {
    // ignorato
  }
}
