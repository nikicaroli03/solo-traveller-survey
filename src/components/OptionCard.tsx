import type { Option } from '../survey.config';
import { CheckIcon, FilterIcon, IncognitoIcon, ShieldIcon } from './Icons';

const icons = { filter: FilterIcon, shield: ShieldIcon, incognito: IncognitoIcon };

interface Props {
  option: Option;
  letter: string;
  multi: boolean;
  selected: boolean;
  /** Scelta singola appena confermata: breve animazione prima di avanzare. */
  confirming: boolean;
  onSelect: () => void;
}

export function OptionCard({ option, letter, multi, selected, confirming, onSelect }: Props) {
  const Icon = option.icon ? icons[option.icon] : null;
  const label = option.label ?? option.value;

  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      aria-keyshortcuts={letter}
      onClick={onSelect}
      className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition duration-200 sm:px-5 ${
        selected
          ? 'border-sea bg-sea/15 shadow-[0_0_0_1px_var(--color-sea)]'
          : 'border-white/12 bg-white/[0.04] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.07]'
      } ${confirming ? 'animate-blink' : ''}`}
    >
      <span
        aria-hidden
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition ${
          selected
            ? 'border-sea bg-sea text-ink'
            : 'border-white/20 text-mist group-hover:text-white'
        }`}
      >
        {selected && multi ? <CheckIcon className="size-4 animate-pop" /> : letter}
      </span>

      {Icon && (
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose/15 text-rose"
        >
          <Icon className="size-5" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className={`block text-base sm:text-lg ${option.description ? 'font-bold' : ''}`}>
          {label}
        </span>
        {option.description && (
          <span className="mt-0.5 block text-sm leading-snug text-mist">{option.description}</span>
        )}
      </span>

      {selected && !multi && (
        <CheckIcon aria-hidden className="size-5 shrink-0 animate-pop text-sea" />
      )}
    </button>
  );
}
