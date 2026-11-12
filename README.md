# Solo traveLLers – Questionario

Versione web, in stile Typeform, della survey di validazione di **Solo traveLLers** (Team 9,
Ingegneria Gestionale, Università di Bologna). Le risposte arrivano nello stesso Google Form
di prima: questo sito ne cambia solo l'aspetto.

Link da condividere: **https://nikicaroli03.github.io/solo-traveller-survey/**

È un progetto separato dalla piattaforma Solo Traveller: non usa il suo backend né la sua
infrastruttura AWS.

## Modificare le domande

Tutto sta in [`src/survey.config.ts`](src/survey.config.ts): testi, tipo di domanda, opzioni,
obbligatorietà e codice `entry` del Google Form.

- Il `value` di ogni opzione deve essere **identico** al testo dell'opzione nel Google Form
  (maiuscole, accenti, spazi e simboli compresi), altrimenti Google scarta la risposta.
- Se si aggiunge una domanda o una sezione al Google Form, il suo codice `entry.N` si trova
  aprendo il modulo, menu ⋮ → "Ottieni link precompilato", compilando e copiando il link.
  Se cambia il numero di sezioni va aggiornato anche `PAGE_HISTORY`.
- Dopo ogni modifica: `npm test` (i test controllano codici e testi inviati).

## Comandi

| Comando            | Cosa fa                                                               |
| ------------------ | --------------------------------------------------------------------- |
| `npm install`      | installa le dipendenze (Node.js 22)                                   |
| `npm run dev`      | anteprima locale su http://localhost:5173/solo-traveller-survey/      |
| `npm test`         | test automatici                                                       |
| `npm run build`    | versione di produzione in `dist/`                                     |
| `npm run preview`  | anteprima della build su http://localhost:4173/solo-traveller-survey/ |
| `npm run og-image` | rigenera `public/og.png`, l'anteprima per i social (usa Edge)         |

Attenzione: anche in anteprima locale l'invio finale manda una risposta **vera** al Google Form.

## Pubblicazione

Ogni push sul branch `main` pubblica automaticamente il sito su GitHub Pages
(workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), dopo aver eseguito
controllo del formato, typecheck e test.

## Come funziona l'invio

Le risposte vengono inviate con una `POST` in modalità `no-cors` all'indirizzo `formResponse`
del Google Form, con un parametro `entry.N` per risposta (ripetuto per ogni casella scelta),
`__other_option__` più `entry.N.other_option_response` per "Altro", e `pageHistory=0,1,2,3`
perché il modulo ha più sezioni. Google non restituisce una risposta leggibile: l'invio è
considerato riuscito se non c'è un errore di rete.

Nel browser restano solo le risposte in corso (per riprendere dopo una chiusura accidentale) e
un indicatore di "survey già inviata" per evitare invii doppi. Nessun cookie, nessun tracciamento.
