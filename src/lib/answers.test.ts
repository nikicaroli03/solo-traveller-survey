import { describe, expect, it } from 'vitest';
import { OTHER, sections, type Question } from '../survey.config';
import { choicesFor, emptyAnswers, toggleMulti, validate } from './answers';
import { questions, steps, totalQuestions } from './steps';

const byId = (id: string) => questions.find((q) => q.id === id) as Question;
const premium = byId('premium');
const [filtri, safety] = premium.options!.map((o) => o.value);
const nessuna = 'Non pagherei per nessuna funzione';

describe('configurazione', () => {
  it('ha 13 domande, 12 obbligatorie, con codici entry unici', () => {
    expect(totalQuestions).toBe(13);
    expect(questions.filter((q) => q.required)).toHaveLength(12);
    expect(new Set(questions.map((q) => q.entry)).size).toBe(13);
  });

  it('mostra la schermata di passaggio solo prima della seconda sezione', () => {
    const sectionSteps = steps.filter((s) => s.kind === 'section');
    expect(sectionSteps).toEqual([{ kind: 'section', section: 1 }]);
    expect(steps.indexOf(sectionSteps[0]!)).toBe(1 + sections[0]!.questions.length);
  });

  it('aggiunge "Altro" solo alle domande 8, 9 e 11', () => {
    const withOther = questions.filter((q) => choicesFor(q).some((o) => o.value === OTHER));
    expect(withOther.map((q) => q.id)).toEqual(['badge', 'premium', 'uso']);
  });
});

describe('toggleMulti', () => {
  it('"Non pagherei" deseleziona le altre opzioni', () => {
    expect(toggleMulti(premium, [filtri!, safety!, OTHER], nessuna)).toEqual([nessuna]);
  });

  it('una funzione deseleziona "Non pagherei"', () => {
    expect(toggleMulti(premium, [nessuna], filtri!)).toEqual([filtri]);
  });

  it('un secondo clic toglie la selezione', () => {
    expect(toggleMulti(premium, [filtri!, safety!], filtri!)).toEqual([safety]);
  });
});

describe('validate', () => {
  it('richiede una risposta alle domande obbligatorie', () => {
    const a = emptyAnswers();
    expect(validate(byId('nome'), a)).toBe('required');
    a.values.nome = '   ';
    expect(validate(byId('nome'), a)).toBe('required');
    a.values.nome = 'Luca';
    expect(validate(byId('nome'), a)).toBeNull();
  });

  it('accetta vuota la domanda facoltativa', () => {
    expect(validate(byId('consigli'), emptyAnswers())).toBeNull();
  });

  it('con "Altro" richiede il testo', () => {
    const a = emptyAnswers();
    a.values.badge = OTHER;
    expect(validate(byId('badge'), a)).toBe('other');
    a.others.badge = 'Non mi interessa';
    expect(validate(byId('badge'), a)).toBeNull();

    a.values.premium = [filtri!, OTHER];
    expect(validate(premium, a)).toBe('other');
  });

  it('richiede almeno una casella', () => {
    const a = emptyAnswers();
    a.values.motivo = [];
    expect(validate(byId('motivo'), a)).toBe('required');
  });
});
