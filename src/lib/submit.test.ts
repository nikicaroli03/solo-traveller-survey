import { describe, expect, it, vi } from 'vitest';
import { FORM_ACTION, OTHER } from '../survey.config';
import type { Answers } from './answers';
import { buildPayload, submitAnswers } from './submit';

const complete: Answers = {
  values: {
    nome: '  Giulia ',
    genere: 'Femmina',
    eta: '<25 anni',
    viaggi: 'più di 5 volte',
    durata: 'mesi o più',
    motivo: ['Piacere', 'Nomade digitale'],
    esitazione: 'Sì, per la privacy',
    badge: OTHER,
    premium: [
      'Safety Bot: Un pulsante che avvisa contatti ed emergenze in automatico e condivide il tuo GPS live.',
      'Modalità Incognito: Vedere le attività e i profili degli altri senza essere vistə finché non fai richiesta.',
      OTHER,
    ],
    momento: "All'ultimo minuto",
    uso: 'Scorrendo la bacheca per unirmi alle attività proposte da altri',
    delusione: 'Abbastanza deluso',
    consigli: '',
  },
  others: { badge: ' Non ho usato il badge ', premium: 'Traduttore' },
};

describe('buildPayload', () => {
  it('usa i codici entry del Google Form e i testi esatti delle opzioni', () => {
    const p = buildPayload(complete);

    expect(p.get('entry.610269776')).toBe('Giulia');
    expect(p.get('entry.164376526')).toBe('Femmina');
    expect(p.get('entry.1296847839')).toBe('<25 anni');
    expect(p.get('entry.671732319')).toBe('più di 5 volte');
    expect(p.get('entry.1990798905')).toBe('mesi o più');
    expect(p.get('entry.1322256738')).toBe('Sì, per la privacy');
    expect(p.get('entry.49579327')).toBe("All'ultimo minuto");
    expect(p.get('entry.527908095')).toBe(
      'Scorrendo la bacheca per unirmi alle attività proposte da altri',
    );
    expect(p.get('entry.794622205')).toBe('Abbastanza deluso');
  });

  it('ripete il parametro per ogni casella scelta', () => {
    const p = buildPayload(complete);
    expect(p.getAll('entry.1898157712')).toEqual(['Piacere', 'Nomade digitale']);
    expect(p.getAll('entry.1036149427')).toEqual([
      complete.values.premium![0],
      complete.values.premium![1],
      '__other_option__',
    ]);
  });

  it('invia "Altro" come __other_option__ con il testo in other_option_response', () => {
    const p = buildPayload(complete);
    expect(p.get('entry.191703681')).toBe('__other_option__');
    expect(p.get('entry.191703681.other_option_response')).toBe('Non ho usato il badge');
    expect(p.get('entry.1036149427.other_option_response')).toBe('Traduttore');
    expect(p.has('entry.527908095.other_option_response')).toBe(false);
  });

  it('omette la domanda facoltativa vuota e aggiunge pageHistory', () => {
    const p = buildPayload(complete);
    expect(p.has('entry.734591211')).toBe(false);
    expect(p.get('pageHistory')).toBe('0,1,2,3');
  });

  it('codifica correttamente accenti e simboli', () => {
    const body = buildPayload(complete).toString();
    expect(body).toContain('entry.1296847839=%3C25+anni');
    expect(body).toContain('vist%C9%99');
  });
});

describe('submitAnswers', () => {
  it('fa una POST no-cors al formResponse con corpo urlencoded', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null));
    await submitAnswers(complete, fetchMock);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(FORM_ACTION);
    expect(init).toMatchObject({ method: 'POST', mode: 'no-cors' });
    expect(init.headers['Content-Type']).toContain('application/x-www-form-urlencoded');
    expect(init.body).toBe(buildPayload(complete).toString());
  });

  it("propaga l'errore di rete", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(submitAnswers(complete, fetchMock)).rejects.toThrow();
  });
});
