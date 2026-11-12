// Configurazione della survey "Solo traveLLers".
// Per modificare domande, opzioni o testi si cambia SOLO questo file.
// I `value` delle opzioni devono coincidere carattere per carattere con il Google Form,
// altrimenti Google scarta la risposta (o la registra come "altro").

export const FORM_ID = '1FAIpQLScweNXunWF_Dmr42pCRq0z7e48z8OmEqaDrQcoHDpAxaEY_lg';
export const FORM_ACTION = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;
/** Pagine del modulo: 0 introduzione, 1 e 2 le sezioni, 3 il ringraziamento. */
export const PAGE_HISTORY = '0,1,2,3';
export const MVP_URL = 'https://d15hbasockij31.cloudfront.net';
/** Link pubblico della survey, usato dai pulsanti di condivisione. */
export const SHARE_URL = 'https://nikicaroli03.github.io/solo-traveller-survey/';
export const SHARE_TEXT =
  'Ci aiuti con 5 minuti? Compila il questionario di Solo Travellers, la piattaforma per chi viaggia da solo:';

/** Valore che Google si aspetta per l'opzione "Altro" con testo libero. */
export const OTHER = '__other_option__';

export type QuestionType = 'short' | 'paragraph' | 'single' | 'multi';

export interface Option {
  /** Testo inviato a Google (identico al modulo). */
  value: string;
  /** Testo mostrato, se diverso da `value` (es. nome in grassetto + descrizione). */
  label?: string;
  description?: string;
  icon?: 'filter' | 'shield' | 'incognito';
  /** Opzione esclusiva: se scelta, deseleziona le altre (e viceversa). */
  exclusive?: boolean;
}

export interface Question {
  id: string;
  entry: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: Option[];
  /** Aggiunge "Altro" con campo di testo obbligatorio (inviato come __other_option__). */
  other?: boolean;
  placeholder?: string;
}

export interface Section {
  title: string;
  questions: Question[];
}

export const intro = {
  // Il titolo della schermata iniziale è il logo animato (src/assets, src/brand).
  text:
    "Questionario per un progetto di Ingegneria Gestionale dell'Università di Bologna. " +
    'Ci aiuta a capire come migliorare una piattaforma che permette a chi viaggia da solo di ' +
    'condividere esperienze con sconosciuti in sicurezza. La partecipazione è volontaria, le ' +
    'risposte sono riservate e usate solo a fini accademici. Tempo richiesto: circa 5 minuti. ' +
    'Non ci sono risposte giuste o sbagliate.',
};

export const sections: Section[] = [
  {
    title: 'Informazioni generiche',
    questions: [
      { id: 'nome', entry: 'entry.610269776', type: 'short', title: 'Nome', required: true },
      {
        id: 'genere',
        entry: 'entry.164376526',
        type: 'single',
        title: 'Genere',
        required: true,
        // "Altro" qui è un'opzione normale del modulo, senza campo di testo.
        options: [{ value: 'Maschio' }, { value: 'Femmina' }, { value: 'Altro' }],
      },
      {
        id: 'eta',
        entry: 'entry.1296847839',
        type: 'single',
        title: "Fascia d'età",
        required: true,
        options: [
          { value: '<25 anni' },
          { value: 'tra 25 e 35 anni' },
          { value: 'tra 35 e 45 anni' },
          { value: '>45 anni' },
        ],
      },
      {
        id: 'viaggi',
        entry: 'entry.671732319',
        type: 'single',
        title: 'Hai mai fatto viaggi da solo?',
        required: true,
        options: [
          { value: 'Mai' },
          { value: 'solo 1 volta' },
          { value: '1-3 volte' },
          { value: '3-5 volte' },
          { value: 'più di 5 volte' },
        ],
      },
      {
        id: 'durata',
        entry: 'entry.1990798905',
        type: 'single',
        title: 'Quanto durano i tuoi viaggi da solo di solito?',
        required: true,
        options: [
          { value: '1-2 giorni' },
          { value: '3-7 giorni' },
          { value: 'settimane' },
          { value: 'mesi o più' },
          { value: 'non ho mai fatto viaggi da solo' },
        ],
      },
      {
        id: 'motivo',
        entry: 'entry.1898157712',
        type: 'multi',
        title: 'Perchè viaggi da solo/a',
        required: true,
        options: [
          { value: 'Lavoro' },
          { value: 'Piacere' },
          { value: 'Studio' },
          { value: 'Nomade digitale' },
          { value: 'Non ho mai fatto viaggi da solo' },
        ],
      },
    ],
  },
  {
    title: 'Aiutaci a migliorare il nostro sito web',
    questions: [
      {
        id: 'esitazione',
        entry: 'entry.1322256738',
        type: 'short',
        title:
          "Hai esitato prima di caricare il tuo documento d'identità e il selfie? Se sì, perché?",
        required: true,
      },
      {
        id: 'badge',
        entry: 'entry.191703681',
        type: 'single',
        title:
          'Il badge "Profilo Verificato" ti ha fatto sentire più al sicuro rispetto a usare gruppi Facebook o altro?',
        required: true,
        options: [
          { value: 'Mi sentivo già al sicuro' },
          { value: "Un po' di più" },
          { value: 'Molto di più' },
        ],
        other: true,
      },
      {
        id: 'premium',
        entry: 'entry.1036149427',
        type: 'multi',
        title:
          "L'app base è gratuita. Per quale di queste funzioni Premium saresti disposto a pagare un piccolo pass?",
        required: true,
        options: [
          {
            value:
              "Filtri avanzati: Poter partecipare a esperienze riservate solo al tuo stesso genere o fascia d'età.",
            label: 'Filtri avanzati',
            description:
              "Poter partecipare a esperienze riservate solo al tuo stesso genere o fascia d'età.",
            icon: 'filter',
          },
          {
            value:
              'Safety Bot: Un pulsante che avvisa contatti ed emergenze in automatico e condivide il tuo GPS live.',
            label: 'Safety Bot',
            description:
              'Un pulsante che avvisa contatti ed emergenze in automatico e condivide il tuo GPS live.',
            icon: 'shield',
          },
          {
            value:
              'Modalità Incognito: Vedere le attività e i profili degli altri senza essere vistə finché non fai richiesta.',
            label: 'Modalità Incognito',
            description:
              'Vedere le attività e i profili degli altri senza essere vistə finché non fai richiesta.',
            icon: 'incognito',
          },
          { value: 'Non pagherei per nessuna funzione', exclusive: true },
        ],
        other: true,
      },
      {
        id: 'momento',
        entry: 'entry.49579327',
        type: 'single',
        title:
          "In quale momento del tuo viaggio saresti più propenso ad aprire l'app per cercare qualcuno con cui condividere un'esperienza?",
        required: true,
        options: [
          { value: 'Prima di partire' },
          { value: 'La sera prima per il giorno successivo' },
          { value: "All'ultimo minuto" },
        ],
      },
      {
        id: 'uso',
        entry: 'entry.527908095',
        type: 'single',
        title: 'Se fossi in viaggio ora, come pensi che lo useresti principalmente?',
        required: true,
        options: [
          { value: "Proponendo io un'idea" },
          { value: 'Scorrendo la bacheca per unirmi alle attività proposte da altri' },
          { value: 'Per farti ispirare per attività da fare con il tuo gruppo di amici' },
        ],
        other: true,
      },
      {
        id: 'delusione',
        entry: 'entry.794622205',
        type: 'single',
        title: 'Come ti sentiresti se da domani non potessi più usare Solo traveLLers?',
        required: true,
        options: [
          { value: 'Abbastanza deluso' },
          { value: 'Poco deluso' },
          { value: 'Indifferente' },
        ],
      },
      {
        id: 'consigli',
        entry: 'entry.734591211',
        type: 'paragraph',
        title: 'Hai altri consigli riguardo cosa cambieresti del sito?',
        required: false,
      },
    ],
  },
];

export const outro = {
  title: "Grazie per l'attenzione e il supporto",
  text: 'Quando il nostro progetto si concretizzerà sarai tra i primi a essere informato!',
};
