export const FAVICON_INTEGRATION_TARGETS = [
  "html",
  "react",
  "nextjs",
  "rails",
  "node",
  "node-cli",
  "gulp",
  "grunt",
  "aspnet-core",
] as const;

export type FaviconIntegrationTarget =
  (typeof FAVICON_INTEGRATION_TARGETS)[number];

export type FaviconInstallationLanguage = "de" | "en" | "es" | "fr" | "it";

export type FaviconInstallationOptions = {
  target: FaviconIntegrationTarget;
  language: FaviconInstallationLanguage;
  htmlSnippet: string;
  faviconPath: string;
};

const PACKAGE_FILES = [
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "android-chrome-maskable-192x192.png",
  "android-chrome-maskable-512x512.png",
  "site.webmanifest",
  "browserconfig.xml",
] as const;

function normalizeDisplayPath(path: string): string {
  const clean = path.trim().replace(/^\/+|\/+$/g, "");
  return clean ? `/${clean}/` : "/";
}

function indent(content: string, spaces = 2): string {
  const prefix = " ".repeat(spaces);
  return content
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

type InstallationCopy = {
  addHead: string;
  automateRoot: (tool: "Gulp" | "Grunt") => string;
  common: (path: string) => string;
  copyAssets: string;
  inside: string;
  keepAssets: string;
  nodeCopy: string;
  nodeMiddleware: string;
  nodeServe: string;
  nodeTemplate: string;
  openReact: string;
  or: string;
  promptChecks: readonly [string, string, string, string, string];
  promptClosing: string;
  promptFiles: string;
  promptGuide: string;
  promptIntro: (target: string) => string;
  promptInspect: string;
  promptVerify: string;
  railsAdd: string;
};

const INSTALLATION_COPY: Record<FaviconInstallationLanguage, InstallationCopy> =
  {
    de: {
      addHead: "Füge diese Tags einmalig innerhalb von `<head>` ein:",
      automateRoot: (tool) =>
        `Automatisiere das Kopieren mit ${tool} und füge das Snippet deiner Root-Vorlage hinzu`,
      common: (path) =>
        `1. Entpacke alle ZIP-Dateien in den öffentlichen Ordner unter \`${path}\`.\n2. Ändere die Dateinamen nicht und belasse das Manifest bei seinen Icons.`,
      copyAssets: "Kopiere die Assets nach",
      inside: "innerhalb von",
      keepAssets: "Belasse die Assets in",
      nodeCopy: "Automatisiere das Kopieren über dein Terminal",
      nodeMiddleware: "oder der entsprechenden statischen Middleware",
      nodeServe: "Stelle diesen Ordner bereit mit",
      nodeTemplate: "Füge diese Tags einmalig in die Root-Vorlage ein",
      openReact:
        "Öffne `index.html` (Vite/CRA) und füge diese Tags einmalig innerhalb von `<head>` ein:",
      or: "oder",
      promptChecks: [
        "alle Icon-URLs erfolgreich antworten",
        "das Manifest gültiges JSON ist und seine Icons vorhanden sind",
        "die Tags im finalen HTML nur einmal vorkommen",
        "keine relativen Pfade oder MIME-Typen fehlerhaft sind",
        "das Favicon auch auf einer Unterseite funktioniert, nicht nur auf der Startseite",
      ],
      promptClosing:
        "Falls bereits eine ältere Einrichtung vorhanden ist, migriere sie sorgfältig und erkläre, was ersetzt wurde. Schließe mit einer Zusammenfassung der geänderten Dateien und durchgeführten Prüfungen ab.",
      promptFiles: "Das ZIP enthält unter anderem diese Dateien:",
      promptGuide:
        "Befolge diese Anleitung und passe sie an die tatsächliche Projektstruktur an:",
      promptIntro: (target) =>
        `Ich habe ein lokales Favicon-Paket erstellt und möchte es korrekt in meinem ${target}-Projekt installieren.`,
      promptInspect:
        "Untersuche zuerst das Repository und ermittle den öffentlichen Ordner sowie die Root-Datei, die `<head>` steuert. Erfinde keine Pfade oder Abhängigkeiten. Dupliziere keine vorhandenen Tags.",
      promptVerify: "Prüfe anschließend, dass:",
      railsAdd: "Füge diese Tags einmalig ein in",
    },
    en: {
      addHead: "Add these tags once inside `<head>`:",
      automateRoot: (tool) =>
        `Automate the copy with ${tool} and add the snippet to your root template`,
      common: (path) =>
        `1. Extract every ZIP file into the public folder under \`${path}\`.\n2. Keep file names unchanged and keep the manifest beside its icons.`,
      copyAssets: "Copy the assets to",
      inside: "inside",
      keepAssets: "Keep the assets in",
      nodeCopy: "Automate the copy from your terminal",
      nodeMiddleware: "or the equivalent static middleware",
      nodeServe: "Serve that folder with",
      nodeTemplate: "Insert these tags once in the root template",
      openReact:
        "Open `index.html` (Vite/CRA) and add these tags once inside `<head>`:",
      or: "or",
      promptChecks: [
        "every icon URL responds successfully",
        "the manifest is valid JSON and its icons exist",
        "tags appear only once in the final HTML",
        "no relative path or MIME type is broken",
        "the favicon works on an internal page, not only the home page",
      ],
      promptClosing:
        "If an older setup exists, migrate it carefully and explain what was replaced. Finish with a summary of modified files and completed checks.",
      promptFiles: "The ZIP includes these files among others:",
      promptGuide:
        "Follow this guide while adapting it to the actual project structure:",
      promptIntro: (target) =>
        `I generated a local favicon package and want to install it correctly in my ${target} project.`,
      promptInspect:
        "First inspect the repository and locate its public folder and the root file controlling `<head>`. Do not invent paths or dependencies. Do not duplicate existing tags.",
      promptVerify: "Then verify that:",
      railsAdd: "Add these tags once to",
    },
    es: {
      addHead: "Añade estas etiquetas una sola vez dentro de `<head>`:",
      automateRoot: (tool) =>
        `Automatiza la copia con ${tool} y añade el snippet a tu plantilla raíz`,
      common: (path) =>
        `1. Extrae todos los archivos del ZIP en la carpeta pública, dentro de \`${path}\`.\n2. No cambies nombres ni separes el manifest de sus iconos.`,
      copyAssets: "Copia los assets a",
      inside: "dentro de",
      keepAssets: "Conserva los assets en",
      nodeCopy: "Automatiza la copia desde tu terminal",
      nodeMiddleware: "o el middleware estático equivalente",
      nodeServe: "Expón esa carpeta con",
      nodeTemplate: "Inserta estas etiquetas una sola vez en la plantilla raíz",
      openReact:
        "Abre `index.html` (Vite/CRA) y añade estas etiquetas una sola vez dentro de `<head>`:",
      or: "o",
      promptChecks: [
        "las URLs de todos los iconos responden correctamente",
        "el manifest es JSON válido y sus iconos existen",
        "las etiquetas aparecen una sola vez en el HTML final",
        "no hay rutas relativas rotas ni errores de tipo MIME",
        "el favicon funciona en una página interna, no solo en la portada",
      ],
      promptClosing:
        "Si encuentras una instalación previa, migra con cuidado y explica qué reemplazaste. Al terminar, resume archivos modificados y comprobaciones realizadas.",
      promptFiles: "El ZIP contiene, entre otros, estos archivos:",
      promptGuide:
        "Sigue esta guía adaptándola a la estructura real del proyecto:",
      promptIntro: (target) =>
        `He generado un paquete de favicons local y quiero instalarlo correctamente en mi proyecto (${target}).`,
      promptInspect:
        "Primero inspecciona el repositorio y localiza la carpeta pública y el archivo raíz que controla `<head>`. No inventes rutas ni dependencias. No dupliques etiquetas ya existentes.",
      promptVerify: "Después verifica que:",
      railsAdd: "Añade estas etiquetas una sola vez en",
    },
    fr: {
      addHead: "Ajoutez ces balises une seule fois dans `<head>` :",
      automateRoot: (tool) =>
        `Automatisez la copie avec ${tool} et ajoutez le snippet à votre modèle racine`,
      common: (path) =>
        `1. Extrayez tous les fichiers du ZIP dans le dossier public, sous \`${path}\`.\n2. Ne modifiez pas les noms de fichiers et conservez le manifeste avec ses icônes.`,
      copyAssets: "Copiez les ressources dans",
      inside: "dans",
      keepAssets: "Conservez les ressources dans",
      nodeCopy: "Automatisez la copie depuis votre terminal",
      nodeMiddleware: "ou le middleware statique équivalent",
      nodeServe: "Servez ce dossier avec",
      nodeTemplate: "Insérez ces balises une seule fois dans le modèle racine",
      openReact:
        "Ouvrez `index.html` (Vite/CRA) et ajoutez ces balises une seule fois dans `<head>` :",
      or: "ou",
      promptChecks: [
        "toutes les URL d’icônes répondent correctement",
        "le manifeste est un JSON valide et ses icônes existent",
        "les balises n’apparaissent qu’une fois dans le HTML final",
        "aucun chemin relatif ni type MIME n’est incorrect",
        "le favicon fonctionne sur une page interne, pas seulement sur la page d’accueil",
      ],
      promptClosing:
        "Si une ancienne configuration existe, migrez-la avec précaution et expliquez ce qui a été remplacé. Terminez par un résumé des fichiers modifiés et des vérifications effectuées.",
      promptFiles: "Le ZIP contient notamment les fichiers suivants :",
      promptGuide:
        "Suivez ce guide en l’adaptant à la structure réelle du projet :",
      promptIntro: (target) =>
        `J’ai généré un paquet de favicons local et je souhaite l’installer correctement dans mon projet ${target}.`,
      promptInspect:
        "Inspectez d’abord le dépôt et localisez son dossier public ainsi que le fichier racine qui contrôle `<head>`. N’inventez ni chemins ni dépendances. Ne dupliquez pas les balises existantes.",
      promptVerify: "Vérifiez ensuite que :",
      railsAdd: "Ajoutez ces balises une seule fois dans",
    },
    it: {
      addHead: "Aggiungi questi tag una sola volta dentro `<head>`:",
      automateRoot: (tool) =>
        `Automatizza la copia con ${tool} e aggiungi lo snippet al template principale`,
      common: (path) =>
        `1. Estrai tutti i file dello ZIP nella cartella pubblica, sotto \`${path}\`.\n2. Non modificare i nomi dei file e mantieni il manifest accanto alle sue icone.`,
      copyAssets: "Copia le risorse in",
      inside: "dentro",
      keepAssets: "Mantieni le risorse in",
      nodeCopy: "Automatizza la copia dal terminale",
      nodeMiddleware: "o il middleware statico equivalente",
      nodeServe: "Esponi questa cartella con",
      nodeTemplate:
        "Inserisci questi tag una sola volta nel template principale",
      openReact:
        "Apri `index.html` (Vite/CRA) e aggiungi questi tag una sola volta dentro `<head>`:",
      or: "o",
      promptChecks: [
        "tutti gli URL delle icone rispondano correttamente",
        "il manifest sia un JSON valido e le sue icone esistano",
        "i tag compaiano una sola volta nell’HTML finale",
        "non ci siano percorsi relativi interrotti o tipi MIME errati",
        "il favicon funzioni in una pagina interna, non solo nella home page",
      ],
      promptClosing:
        "Se esiste una configurazione precedente, migrala con attenzione e spiega cosa hai sostituito. Concludi con un riepilogo dei file modificati e delle verifiche eseguite.",
      promptFiles: "Lo ZIP include, tra gli altri, questi file:",
      promptGuide:
        "Segui questa guida adattandola alla struttura reale del progetto:",
      promptIntro: (target) =>
        `Ho generato un pacchetto di favicon locale e voglio installarlo correttamente nel mio progetto ${target}.`,
      promptInspect:
        "Per prima cosa ispeziona il repository e individua la cartella pubblica e il file principale che controlla `<head>`. Non inventare percorsi o dipendenze. Non duplicare i tag esistenti.",
      promptVerify: "Verifica quindi che:",
      railsAdd: "Aggiungi questi tag una sola volta in",
    },
  };

function nextJsHead(snippet: string): string {
  return snippet.replaceAll("<link ", "<link ").replaceAll("<meta ", "<meta ");
}

export function buildInstallationGuide({
  target,
  language,
  htmlSnippet,
  faviconPath,
}: FaviconInstallationOptions): string {
  const copy = INSTALLATION_COPY[language];
  const publicPath = normalizeDisplayPath(faviconPath);
  const common = copy.common(publicPath);

  const guides: Record<FaviconIntegrationTarget, string> = {
    html: `${common}\n3. ${copy.addHead}\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    react: `${common}\n3. ${copy.openReact}\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    nextjs: `${common}\n3. ${copy.keepAssets} \`public${publicPath === "/" ? "" : publicPath.slice(0, -1)}\`.\n4. ${copy.railsAdd} \`src/app/layout.tsx\` (App Router) ${copy.or} \`pages/_document.tsx\` (Pages Router):\n\n\`\`\`tsx\n<head>\n${indent(nextJsHead(htmlSnippet))}\n</head>\n\`\`\``,
    rails: `${common}\n3. ${copy.copyAssets} \`public${publicPath === "/" ? "" : publicPath.slice(0, -1)}\`.\n4. ${copy.railsAdd} \`app/views/layouts/application.html.erb\`, ${copy.inside} \`<head>\`:\n\n\`\`\`erb\n${htmlSnippet}\n\`\`\``,
    node: `${common}\n3. ${copy.nodeServe} \`express.static\` ${copy.nodeMiddleware}.\n4. ${copy.nodeTemplate}:\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    "node-cli": `${common}\n3. ${copy.nodeCopy}:\n\n\`\`\`sh\nmkdir -p public${publicPath}\ncp -R ./favicons/* public${publicPath}\n\`\`\`\n4. ${copy.addHead}\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    gulp: `${common}\n3. ${copy.automateRoot("Gulp")}:\n\n\`\`\`js\nimport gulp from "gulp";\n\nexport function favicons() {\n  return gulp.src("favicons/**/*", { encoding: false })\n    .pipe(gulp.dest("public${publicPath}"));\n}\n\`\`\`\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    grunt: `${common}\n3. ${copy.automateRoot("Grunt")}:\n\n\`\`\`js\ncopy: {\n  favicons: {\n    expand: true,\n    cwd: "favicons",\n    src: ["**/*"],\n    dest: "public${publicPath}"\n  }\n}\n\`\`\`\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    "aspnet-core": `${common}\n3. ${copy.copyAssets} \`wwwroot${publicPath === "/" ? "" : publicPath.slice(0, -1)}\`.\n4. ${copy.railsAdd} \`Views/Shared/_Layout.cshtml\`, ${copy.inside} \`<head>\`:\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
  };

  return guides[target];
}

export function buildAiInstallationPrompt(
  options: FaviconInstallationOptions,
): string {
  const copy = INSTALLATION_COPY[options.language];
  const guide = buildInstallationGuide(options);
  const files = PACKAGE_FILES.map((file) => `- ${file}`).join("\n");

  const checks = copy.promptChecks.map((check) => `- ${check};`).join("\n");
  return `${copy.promptIntro(options.target)}\n\n${copy.promptInspect}\n\n${copy.promptFiles}\n${files}\n\n${copy.promptGuide}\n\n${guide}\n\n${copy.promptVerify}\n${checks}\n\n${copy.promptClosing}`;
}
