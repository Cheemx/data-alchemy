# Data Alchemy

This project was built as a submission for the "Data Alchemist" assignment. It was my first experience working with CSV/XLSX data processing and UI rule-based validation logic. Given the complexity of the task and the short 3-day deadline, I have tried my best to implement as many functionalities as I could and as accurately as possible.

Although I could not complete the Assignment to the mark, but I've learned too many new possibilitis of Next.js and file handling. 

Also Used TypeScript in this, it's really better than sole Javascript cause it helps a lot with compile time errors**Live Demo**: [data-alchemy](https://data-alchemy-kohl.vercel.app/)

---

##  Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with TypeScript)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **CSV Parsing**: [PapaParse](https://www.papaparse.com/)
- **Excel Parsing**: [xlsx](https://github.com/SheetJS/sheetjs)
- **Deployment**: [Vercel](https://vercel.com/)

---

## Features Implemented

- **Data Ingestion**  
  Upload and parse `.csv`, `.xls`, and `.xlsx` files directly in the browser.

- **Validations & In-app Changes**  
  Basic validation logic with support for inline editing and real-time validation feedback.

- **Natural Language Data Retrieval (Regex-based)**  
  Users can search data using simple natural language queries, parsed using regular expressions.

- **Rule Input UI**  
  Clean, dynamic UI for defining rules based on datasets.

- **Prioritization and Weights (Partial) !!NOT COMPLETE!!**  
  UI scaffolding and partial logic for adjusting rule-based weights and prioritizations.

---

## Features Not Implemented (Due to Time Constraints)

- Prioritization & Weighting (Full Functional Logic)
- Natural Language to Rule Converter
- Natural Language-based Data Modification
- AI-based Rule Recommendations
- AI-driven Error Correction
- AI-driven Validation System

---

## Notes

- All functionalities implemented are built from scratch and tested to the best of my understanding.
- Given more time, I would love to fully implement the AI components and natural language rule translation as described in the assignment brief and also it will help me gain my knowledge about Data Handling and working with AI agents.

---

## Project Structure

- `/components` – UI, interaction & all logical components (Tables, Uploads, RuleBuilder, etc.)
- `/utils` – Validation logic
- `/app` – Single Page Component

---

## Getting Started Locally

```bash
git clone https://github.com/yourusername/data-alchemy.git
cd data-alchemy
npm install
npm run dev
```

## Final Thoughts

This project was a great challenge. Although I couldn’t implement everything, I believe it’s a strong foundation and a good demonstration of my ability to learn quickly and build production-grade UI and logic under time constraints.

Feel free to explore the code or reach out for feedback!
Thanks!

---