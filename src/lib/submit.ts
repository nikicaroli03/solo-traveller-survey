import { FORM_ACTION, OTHER, PAGE_HISTORY } from '../survey.config';
import { selectedValues, type Answers } from './answers';
import { questions } from './steps';

/**
 * Corpo della richiesta per Google Moduli: un parametro `entry.N` per ogni risposta
 * (ripetuto per ogni casella scelta), il testo di "Altro" in `entry.N.other_option_response`
 * e `pageHistory` con tutte le pagine del modulo, senza il quale Google scarta la risposta.
 */
export function buildPayload(answers: Answers): URLSearchParams {
  const payload = new URLSearchParams();

  for (const question of questions) {
    if (question.type === 'short' || question.type === 'paragraph') {
      const text = answers.values[question.id];
      if (typeof text === 'string' && text.trim()) payload.append(question.entry, text.trim());
      continue;
    }

    const selected = selectedValues(answers, question.id);
    for (const value of selected) payload.append(question.entry, value);
    if (selected.includes(OTHER)) {
      payload.append(
        `${question.entry}.other_option_response`,
        (answers.others[question.id] ?? '').trim(),
      );
    }
  }

  payload.append('pageHistory', PAGE_HISTORY);
  return payload;
}

/**
 * Invia le risposte. Con `no-cors` Google non restituisce una risposta leggibile:
 * l'invio è riuscito se la richiesta non genera un errore di rete.
 */
export async function submitAnswers(answers: Answers, fetchImpl: typeof fetch = fetch) {
  await fetchImpl(FORM_ACTION, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: buildPayload(answers).toString(),
  });
}
