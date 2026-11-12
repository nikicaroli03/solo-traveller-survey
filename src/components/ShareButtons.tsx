import { useState } from 'react';
import { SHARE_TEXT, SHARE_URL } from '../survey.config';
import { LinkIcon, WhatsAppIcon } from './Icons';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Browser senza Clipboard API (o non in HTTPS): ripiego con una textarea nascosta.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

const buttonClass =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border px-5 font-semibold whitespace-nowrap transition duration-200 hover:-translate-y-0.5 sm:w-auto';

export function ShareButtons() {
  const [copied, setCopied] = useState<boolean | null>(null);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;

  return (
    <div>
      <p className="text-sm font-semibold text-mist">Ci aiuti a far girare il questionario?</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} border-[#25D366]/50 bg-[#25D366]/15 text-cream hover:bg-[#25D366]/25`}
        >
          <WhatsAppIcon className="size-5 shrink-0 text-[#25D366]" />
          Condividi su WhatsApp
        </a>
        <button
          type="button"
          onClick={async () => setCopied(await copyText(SHARE_URL))}
          className={`${buttonClass} border-white/15 text-cream hover:border-white/35 hover:bg-white/5`}
        >
          <LinkIcon className="size-5" />
          {copied ? 'Link copiato!' : 'Copia link'}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-mist">
        {copied === false && `Copia questo link: ${SHARE_URL}`}
      </p>
    </div>
  );
}
