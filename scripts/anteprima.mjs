// Crea l'anteprima da far provare: un solo file HTML (anteprima/solo-travellers-survey.html)
// con JS, CSS, font e immagini dentro, che non invia risposte al Google Form.
// Uso: npm run build:anteprima
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = `${root}dist-anteprima/`;
const html = readFileSync(`${dist}index.html`, 'utf8');

const asset = (re) => {
  const match = html.match(re);
  if (!match) throw new Error(`Asset non trovato: ${re}`);
  return readFileSync(`${dist}${match[1].replace(/^\.\//, '')}`, 'utf8');
};
const js = asset(/<script type="module" crossorigin src="([^"]+)"/);
const css = asset(/<link rel="stylesheet" crossorigin href="([^"]+)"/);

// Niente <html>/<head>/<body>: la pagina viene inserita in uno scheletro già pronto.
const page = `<title>Solo Travellers Questionario</title>
<style>
:root { color-scheme: dark; }
body { background: #0e1c30; color: #fff8ef; }
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replace(/<\/script/gi, '<\\/script')}
</script>
`;

mkdirSync(`${root}anteprima`, { recursive: true });
const out = `${root}anteprima/solo-travellers-survey.html`;
writeFileSync(out, page);
console.log(`Creato ${out} (${Math.round(page.length / 1024)} KB)`);
