import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data, filename, columns) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(filename.replace(/_/g, ' ').toUpperCase(), 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
  
  // Prepare table data
  const tableData = data.map(item => 
    columns.map(col => {
      if (col.accessor === 'isActive') {
        return item[col.accessor] ? 'Active' : 'Inactive';
      }
      if (typeof item[col.accessor] === 'number') {
        return `$${item[col.accessor].toFixed(2)}`;
      }
      return item[col.accessor];
    })
  );
  
  // Add table
  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}; 