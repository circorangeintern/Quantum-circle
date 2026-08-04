import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

export function generateCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  try {
    const parser = new Parser({
      fields: Object.keys(data[0]),
    });
    return parser.parse(data);
  } catch (error) {
    console.error("CSV generation failed:", error);
    throw new Error("Failed to generate CSV");
  }
}

export function generatePDF(data: any[]): any {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      // Title
      doc.fontSize(20).text("SpeakSafe Reports", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown();

      // Table headers
      const headers = Object.keys(data[0] || {});
      const columnWidth = (doc.page.width - 100) / headers.length;

      let y = doc.y;
      doc.fontSize(10);

      // Headers
      headers.forEach((header, i) => {
        doc.text(header.toUpperCase(), 50 + i * columnWidth, y, {
          width: columnWidth - 10,
          align: "left",
        });
      });

      doc.moveDown();
      doc
        .strokeColor("#E1E7F5")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();
      doc.moveDown();

      // Data rows
      for (const row of data) {
        y = doc.y;
        headers.forEach((header, i) => {
          const value = row[header] || "";
          doc.text(String(value), 50 + i * columnWidth, y, {
            width: columnWidth - 10,
            align: "left",
          });
        });

        doc.moveDown();

        // Check for page break
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
      }

      // Footer
      doc.moveDown();
      doc.fontSize(8).text(`Page ${doc.page} - Confidential - SpeakSafe`, {
        align: "center",
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
