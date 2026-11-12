import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response(null));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** Attende l'avanzamento automatico dopo una scelta singola. */
const waitAdvance = () => act(() => new Promise((r) => setTimeout(r, 500)));

const question = (text: string | RegExp) => screen.findByRole('heading', { name: text });

describe('intro animata', () => {
  it('si può saltare e poi mostra logo e pulsante Inizia', async () => {
    sessionStorage.clear();
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: "Salta l'animazione" }));
    expect(screen.getByRole('img', { name: 'Solo Travellers' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "Salta l'animazione" })).not.toBeInTheDocument();
    expect(sessionStorage.getItem('solo-survey:intro-vista')).toBe('1');
    await user.click(screen.getByRole('button', { name: /Inizia/ }));
    expect(await question(/Nome/)).toBeInTheDocument();
  });
});

describe('survey', () => {
  it('blocca le domande obbligatorie con un messaggio', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Inizia/ }));
    await question(/Nome/);
    await user.click(screen.getByRole('button', { name: /Avanti/ }));

    expect(screen.getByText(/Questa domanda è obbligatoria/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Nome/ })).toBeInTheDocument();
  });

  it('si compila da tastiera e invia tutte le risposte', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard('{Enter}');
    await question(/Nome/);
    await user.keyboard('Giulia{Enter}');

    await question(/Genere/);
    await user.keyboard('b'); // Femmina
    await waitAdvance();

    await question(/Fascia d'età/);
    await user.keyboard('a');
    await waitAdvance();

    await question(/Hai mai fatto viaggi/);
    await user.keyboard('e');
    await waitAdvance();

    await question(/Quanto durano/);
    await user.keyboard('c');
    await waitAdvance();

    await question(/Perchè viaggi/);
    await user.keyboard('ab{Enter}');

    expect(await question(/Aiutaci a migliorare il nostro sito web/)).toBeInTheDocument();
    await user.keyboard('{Enter}');

    await question(/Hai esitato/);
    await user.keyboard('No{Enter}');

    // "Altro" non avanza: mostra il campo di testo, obbligatorio
    await question(/Profilo Verificato/);
    await user.keyboard('d');
    await waitAdvance();
    expect(screen.getByRole('heading', { name: /Profilo Verificato/ })).toBeInTheDocument();
    const other = screen.getByRole('textbox', { name: /Altro/ });
    expect(other).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/nel campo "Altro"/)).toBeInTheDocument();
    await user.type(other, 'Non lo so{Enter}');

    // "Non pagherei" esclude le altre
    await question(/funzioni Premium/);
    await user.click(screen.getByRole('checkbox', { name: /Safety Bot/ }));
    await user.click(screen.getByRole('checkbox', { name: /Non pagherei/ }));
    expect(screen.getByRole('checkbox', { name: /Safety Bot/ })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Non pagherei/ })).toBeChecked();
    await user.click(screen.getByRole('button', { name: /Continua/ }));

    await question(/In quale momento/);
    await user.keyboard('c');
    await waitAdvance();

    await question(/Se fossi in viaggio/);
    await user.keyboard('a');
    await waitAdvance();

    await question(/Come ti sentiresti/);
    await user.keyboard('a');
    await waitAdvance();

    await question(/altri consigli/);
    await user.click(screen.getByRole('button', { name: /Invia risposte/ }));

    expect(await question("Grazie per l'attenzione e il supporto")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();

    const body = new URLSearchParams(fetchMock.mock.calls[0]![1].body as string);
    expect(body.get('entry.610269776')).toBe('Giulia');
    expect(body.get('entry.164376526')).toBe('Femmina');
    expect(body.get('entry.1296847839')).toBe('<25 anni');
    expect(body.get('entry.671732319')).toBe('più di 5 volte');
    expect(body.get('entry.1990798905')).toBe('settimane');
    expect(body.getAll('entry.1898157712')).toEqual(['Lavoro', 'Piacere']);
    expect(body.get('entry.1322256738')).toBe('No');
    expect(body.get('entry.191703681')).toBe('__other_option__');
    expect(body.get('entry.191703681.other_option_response')).toBe('Non lo so');
    expect(body.getAll('entry.1036149427')).toEqual(['Non pagherei per nessuna funzione']);
    expect(body.get('entry.49579327')).toBe("All'ultimo minuto");
    expect(body.get('entry.527908095')).toBe("Proponendo io un'idea");
    expect(body.get('entry.794622205')).toBe('Abbastanza deluso');
    expect(body.get('pageHistory')).toBe('0,1,2,3');

    // Non si può inviare due volte dallo stesso browser
    expect(localStorage.getItem('solo-survey:inviata')).not.toBeNull();
  }, 20000);

  it('riprende da dove si era rimasti dopo il ricaricamento', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.keyboard('{Enter}');
    await question(/Nome/);
    await user.keyboard('Marco{Enter}');
    await question(/Genere/);
    unmount();

    render(<App />);
    expect(await question(/Genere/)).toBeInTheDocument();
    expect(screen.getByText(/Bentornatə/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Indietro/ }));
    expect(await screen.findByRole('textbox', { name: /Nome/ })).toHaveValue('Marco');
  });

  it('mostra un avviso a chi ha già inviato', async () => {
    localStorage.setItem('solo-survey:inviata', '2026-11-12T10:00:00.000Z');
    render(<App />);
    expect(await question('Hai già compilato il questionario')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Inizia/ })).not.toBeInTheDocument();
  });

  it('in caso di errore conserva le risposte e permette di riprovare', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'solo-survey:risposte',
      JSON.stringify({
        step: 14, // ultima domanda
        answers: { values: { nome: 'Test' }, others: {} },
      }),
    );
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    render(<App />);

    await question(/altri consigli/);
    await user.click(screen.getByRole('button', { name: /Invia risposte/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Non siamo riusciti/);
    expect(localStorage.getItem('solo-survey:inviata')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Riprova/ }));
    expect(await question("Grazie per l'attenzione e il supporto")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
