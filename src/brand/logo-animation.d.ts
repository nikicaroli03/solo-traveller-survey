// Tipi del modulo logo-animation.js (scritto in JavaScript per funzionare anche senza bundler).

export type LogoFormat = '16:9' | '1:1' | '9:16';

export interface LogoFormatSpec {
  /** Larghezza del palco in pixel */
  w: number;
  /** Altezza del palco in pixel */
  h: number;
  /** Quota della larghezza occupata dal logo finale */
  logo: number;
  /** Quota della larghezza occupata dallo slogan iniziale */
  slogan: number;
}

export const FORMATS: Record<LogoFormat, LogoFormatSpec>;

/** Durata totale in secondi, hold finale compreso. */
export const DURATION: number;

export interface LogoAnimationOptions {
  format?: LogoFormat;
  autoplay?: boolean;
  loop?: boolean;
  onComplete?: () => void;
  /** Di default segue prefers-reduced-motion */
  reducedMotion?: boolean;
  /** false: palco trasparente, lo sfondo lo disegna la pagina (predefinito: true) */
  background?: boolean;
}

/** Sottoinsieme di gsap usato dal modulo: basta passare l'export `gsap` del pacchetto. */
export interface GsapLike {
  timeline(vars?: object): unknown;
  set(targets: unknown, vars: object): unknown;
}

export interface GsapTimelineLike {
  play(from?: number): unknown;
  pause(atTime?: number): unknown;
  restart(): unknown;
  time(): number;
  progress(): number;
  paused(): boolean;
  duration(): number;
  /** Esegue una funzione al secondo indicato della timeline */
  call(callback: () => void, params?: unknown[], position?: number): unknown;
  kill(): void;
}

export interface LogoAnimation {
  svg: SVGSVGElement;
  timeline: GsapTimelineLike;
  duration: number;
  play(): void;
  pause(): void;
  replay(): void;
  /** Porta l'animazione al secondo indicato e la mette in pausa */
  seek(seconds: number): void;
  /** Posizione a schermo di nome e slogan; a fine animazione coincide con il logo statico */
  lockupRect(): DOMRect;
  /** Ferma la timeline e rimuove l'SVG */
  destroy(): void;
}

export function createLogoAnimation(
  gsap: GsapLike,
  container: Element,
  options?: LogoAnimationOptions,
): LogoAnimation;
