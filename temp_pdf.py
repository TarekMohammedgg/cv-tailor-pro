import PyPDF2
reader = PyPDF2.PdfReader(r"e:\root\Programming\web-development\cv-tailor-pro\Tarek Mohammed Mobile Apps Develper (Flutter).pdf")
text = "\n".join([page.extract_text() for page in reader.pages])
with open(r"e:\root\Programming\web-development\cv-tailor-pro\out.txt", "w", encoding="utf-8") as f:
    f.write(text)
print("Done extracting PDF using python.")
