import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const require = createRequire(import.meta.url);
const pdfPath = resolve(
  "e:/root/Programming/web-development/cv-tailor-pro/Tarek Mohammed Mobile Apps Develper (Flutter).pdf",
);

const pdfjsLib =
  await import("file:///e:/root/Programming/web-development/cv-tailor-pro/node_modules/pdfjs-dist/legacy/build/pdf.mjs");

pdfjsLib.GlobalWorkerOptions.workerSrc = "";

const data = readFileSync(pdfPath);
const pdf = await pdfjsLib.getDocument({
  data: new Uint8Array(data),
  disableWorker: true,
}).promise;

let fullText = "";
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map((item) => item.str).join(" ");
  fullText += pageText + "\n\n";

  const annotations = await page.getAnnotations();
  const links = annotations
    .filter((a) => a.subtype === "Link" && a.url)
    .map((a) => `[PROJECT_LINK: ${a.url}]`);
  if (links.length > 0) {
    fullText += links.join("\n") + "\n";
  }
}

writeFileSync("out.txt", fullText.trim(), "utf8");
console.log("Done");
