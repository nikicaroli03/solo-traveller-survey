import { sections, type Question } from '../survey.config';

export type Step =
  | { kind: 'intro' }
  | { kind: 'section'; section: number }
  | { kind: 'question'; question: Question; section: number; number: number };

export const questions: Question[] = sections.flatMap((s) => s.questions);
export const totalQuestions = questions.length;

/**
 * Sequenza delle schermate: introduzione, poi le domande. Prima di ogni sezione
 * successiva alla prima c'è una schermata di passaggio con il titolo della sezione.
 */
export const steps: Step[] = (() => {
  const list: Step[] = [{ kind: 'intro' }];
  let number = 0;
  sections.forEach((section, index) => {
    if (index > 0) list.push({ kind: 'section', section: index });
    for (const question of section.questions) {
      number++;
      list.push({ kind: 'question', question, section: index, number });
    }
  });
  return list;
})();

/** Domande completate prima di questa schermata, per la barra di avanzamento. */
export function questionsBefore(stepIndex: number): number {
  return steps.slice(0, stepIndex).filter((s) => s.kind === 'question').length;
}
