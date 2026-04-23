const fs = require("fs");

// Load data
const documents = [
  "Công ty ABC chuyên về logistics và vận chuyển quốc tế.",
  "Thời gian làm việc từ thứ 2 đến thứ 6, 8h đến 17h.",
  "Liên hệ IT: it@company.com"
];

// simple search
function searchDocs(query) {
  const results = documents.filter(doc =>
    doc.toLowerCase().includes(query.toLowerCase())
  );

  return results.slice(0, 3).join("\n");
}

module.exports = { searchDocs };