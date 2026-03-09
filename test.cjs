const fs = require("fs");
const pdf = require("pdf-parse");
console.log(typeof pdf);
let dataBuffer = fs.readFileSync(
  "Tarek Mohammed Mobile Apps Develper (Flutter).pdf",
);
pdf(dataBuffer)
  .then(function (data) {
    fs.writeFileSync("out.txt", data.text, "utf8");
  })
  .catch(console.error);
