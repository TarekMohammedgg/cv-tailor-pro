import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

let dataBuffer = fs.readFileSync(
  "Tarek Mohammed Mobile Apps Develper (Flutter).pdf",
);

pdf(dataBuffer)
  .then(function (data) {
    fs.writeFileSync("out.txt", data.text, "utf8");
    console.log("PDF extraction successful!");
  })
  .catch((err) => console.error(err));
