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

export type FaviconInstallationOptions = {
  target: FaviconIntegrationTarget;
  language: "en" | "es";
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

function localized(es: boolean, spanish: string, english: string): string {
  return es ? spanish : english;
}

function nextJsHead(snippet: string): string {
  return snippet.replaceAll("<link ", "<link ").replaceAll("<meta ", "<meta ");
}

export function buildInstallationGuide({
  target,
  language,
  htmlSnippet,
  faviconPath,
}: FaviconInstallationOptions): string {
  const es = language === "es";
  const publicPath = normalizeDisplayPath(faviconPath);
  const common = es
    ? `1. Extrae todos los archivos del ZIP en la carpeta pública, dentro de \`${publicPath}\`.\n2. No cambies nombres ni separes el manifest de sus iconos.`
    : `1. Extract every ZIP file into the public folder under \`${publicPath}\`.\n2. Keep file names unchanged and keep the manifest beside its icons.`;

  const headInstruction = localized(
    es,
    "Añade estas etiquetas una sola vez dentro de `<head>`:",
    "Add these tags once inside `<head>`:",
  );

  const guides: Record<FaviconIntegrationTarget, string> = {
    html: `${common}\n3. ${headInstruction}\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    react: `${common}\n3. ${localized(es, "Abre `index.html` (Vite/CRA) y añade estas etiquetas una sola vez dentro de `<head>`:", "Open `index.html` (Vite/CRA) and add these tags once inside `<head>`. ")}\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    nextjs: `${common}\n3. ${localized(es, "Conserva los assets en", "Keep the assets in")} \`public${publicPath === "/" ? "" : publicPath.slice(0, -1)}\`.\n4. ${localized(es, "Añade las etiquetas una sola vez en", "Add the tags once in")} \`src/app/layout.tsx\` (App Router) ${localized(es, "o", "or")} \`pages/_document.tsx\` (Pages Router):\n\n\`\`\`tsx\n<head>\n${indent(nextJsHead(htmlSnippet))}\n</head>\n\`\`\``,
    rails: `${common}\n3. ${localized(es, "Copia los assets a", "Copy the assets to")} \`public${publicPath === "/" ? "" : publicPath.slice(0, -1)}\`.\n4. ${localized(es, "Añade estas etiquetas una sola vez en", "Add these tags once in")} \`app/views/layouts/application.html.erb\`, ${localized(es, "dentro de", "inside")} \`<head>\`:\n\n\`\`\`erb\n${htmlSnippet}\n\`\`\``,
    node: `${common}\n3. ${localized(es, "Expón esa carpeta con", "Serve that folder with")} \`express.static\` ${localized(es, "o el middleware estático equivalente", "or the equivalent static middleware")}\n4. ${localized(es, "Inserta estas etiquetas una sola vez en la plantilla raíz", "Insert these tags once in the root template")}:\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    "node-cli": `${common}\n3. ${localized(es, "Automatiza la copia desde tu terminal", "Automate the copy from your terminal")}:\n\n\`\`\`sh\nmkdir -p public${publicPath}\ncp -R ./favicons/* public${publicPath}\n\`\`\`\n4. ${headInstruction}\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    gulp: `${common}\n3. ${localized(es, "Automatiza la copia con Gulp y añade el snippet a tu plantilla raíz", "Automate the copy with Gulp and add the snippet to your root template")}:\n\n\`\`\`js\nimport gulp from "gulp";\n\nexport function favicons() {\n  return gulp.src("favicons/**/*", { encoding: false })\n    .pipe(gulp.dest("public${publicPath}"));\n}\n\`\`\`\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    grunt: `${common}\n3. ${localized(es, "Automatiza la copia con Grunt y añade el snippet a tu plantilla raíz", "Automate the copy with Grunt and add the snippet to your root template")}:\n\n\`\`\`js\ncopy: {\n  favicons: {\n    expand: true,\n    cwd: "favicons",\n    src: ["**/*"],\n    dest: "public${publicPath}"\n  }\n}\n\`\`\`\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
    "aspnet-core": `${common}\n3. ${localized(es, "Copia los assets a", "Copy the assets to")} \`wwwroot${publicPath === "/" ? "" : publicPath.slice(0, -1)}\`.\n4. ${localized(es, "Añade estas etiquetas una sola vez a", "Add these tags once to")} \`Views/Shared/_Layout.cshtml\`, ${localized(es, "dentro de", "inside")} \`<head>\`:\n\n\`\`\`html\n${htmlSnippet}\n\`\`\``,
  };

  return guides[target];
}

export function buildAiInstallationPrompt(
  options: FaviconInstallationOptions,
): string {
  const es = options.language === "es";
  const guide = buildInstallationGuide(options);
  const files = PACKAGE_FILES.map((file) => `- ${file}`).join("\n");

  return es
    ? `He generado un paquete de favicons local y quiero instalarlo correctamente en mi proyecto (${options.target}).\n\nPrimero inspecciona el repositorio y localiza la carpeta pública y el archivo raíz que controla el <head>. No inventes rutas ni dependencias. No dupliques etiquetas ya existentes.\n\nEl ZIP contiene, entre otros, estos archivos:\n${files}\n\nSigue esta guía adaptándola a la estructura real del proyecto:\n\n${guide}\n\nDespués verifica que:\n- las URLs de todos los iconos responden correctamente;\n- el manifest es JSON válido y sus iconos existen;\n- las etiquetas aparecen una sola vez en el HTML final;\n- no hay rutas relativas rotas ni errores de tipo MIME;\n- el favicon funciona en una página interna, no solo en la portada.\n\nSi encuentras una instalación previa, migra con cuidado y explica qué reemplazaste. Al terminar, resume archivos modificados y comprobaciones realizadas.`
    : `I generated a local favicon package and want to install it correctly in my ${options.target} project.\n\nFirst inspect the repository and locate its public folder and the root file controlling <head>. Do not invent paths or dependencies. Do not duplicate existing tags.\n\nThe ZIP includes these files among others:\n${files}\n\nFollow this guide while adapting it to the actual project structure:\n\n${guide}\n\nThen verify that:\n- every icon URL responds successfully;\n- the manifest is valid JSON and its icons exist;\n- tags appear only once in the final HTML;\n- no relative path or MIME type is broken;\n- the favicon works on an internal page, not only the home page.\n\nIf an older setup exists, migrate it carefully and explain what was replaced. Finish with a summary of modified files and completed checks.`;
}
