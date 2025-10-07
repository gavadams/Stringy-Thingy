import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGenerationOptions {
  lines: { from: number; to: number }[];
  pegs: { x: number; y: number }[];
  settings: {
    pegs: number;
    lines: number;
    lineWeight: number;
    frameShape: string;
  };
  imagePreview?: string;
  kitType?: string;
}

/**
 * Generate a professional PDF with string art instructions
 */
export async function generateInstructionsPDF(options: PDFGenerationOptions): Promise<Blob> {
  const { lines, pegs, settings, imagePreview, kitType = 'standard' } = options;
  
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = '#7c3aed'; // Purple
  const secondaryColor = '#6b7280'; // Gray
  const textColor = '#1f2937'; // Dark gray
  
  // Helper function to add text with styling
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.fontSize || 12);
    doc.setTextColor(options.color || textColor);
    doc.text(text, x, y);
  };
  
  // Helper function to add line
  const addLine = (x1: number, y1: number, x2: number, y2: number, color: string = '#e5e7eb') => {
    doc.setDrawColor(color);
    doc.line(x1, y1, x2, y2);
  };
  
  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  addText('Stringy-Thingy', 20, 20, { 
    fontSize: 24, 
    color: '#ffffff' 
  });
  
  addText('String Art Instructions', 20, 35, { 
    fontSize: 16, 
    color: primaryColor 
  });
  
  // Kit information
  let yPos = 50;
  addText(`Kit Type: ${kitType.toUpperCase()}`, 20, yPos, { fontSize: 14, color: primaryColor });
  yPos += 10;
  
  addText(`Frame: ${settings.frameShape === 'circle' ? 'Circular' : 'Square'}`, 20, yPos);
  yPos += 8;
  addText(`Pegs: ${settings.pegs}`, 20, yPos);
  yPos += 8;
  addText(`Lines: ${lines.length}`, 20, yPos);
  yPos += 8;
  addText(`Line Weight: ${settings.lineWeight}`, 20, yPos);
  
  yPos += 20;
  
  // Materials section
  addText('MATERIALS NEEDED', 20, yPos, { fontSize: 14, color: primaryColor });
  yPos += 10;
  
  const materials = [
    '• Pre-cut wooden frame with numbered pegs',
    '• Premium cotton string (included)',
    '• Scissors',
    '• Tape or pins to secure string ends',
    '• Pattern reference (this document)'
  ];
  
  materials.forEach(material => {
    addText(material, 20, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Tips section
  addText('TIPS FOR SUCCESS', 20, yPos, { fontSize: 14, color: primaryColor });
  yPos += 10;
  
  const tips = [
    '• Start with peg 0 and follow the sequence exactly',
    '• Keep string tension consistent throughout',
    '• Use a ruler to help with straight lines',
    '• Take breaks to avoid eye strain',
    '• Don\'t worry about small mistakes - they add character!'
  ];
  
  tips.forEach(tip => {
    addText(tip, 20, yPos);
    yPos += 6;
  });
  
  yPos += 20;
  
  // Instructions header
  addText('STEP-BY-STEP INSTRUCTIONS', 20, yPos, { fontSize: 14, color: primaryColor });
  yPos += 10;
  
  addText('Follow these steps in order to create your string art:', 20, yPos);
  yPos += 15;
  
  // Instructions in two columns
  const instructionsPerPage = 25;
  const totalPages = Math.ceil(lines.length / instructionsPerPage);
  
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage();
      yPos = 20;
    }
    
    const startIndex = page * instructionsPerPage;
    const endIndex = Math.min(startIndex + instructionsPerPage, lines.length);
    const pageLines = lines.slice(startIndex, endIndex);
    
    // Two columns layout
    const columnWidth = (pageWidth - 60) / 2;
    const leftColumnX = 20;
    const rightColumnX = leftColumnX + columnWidth + 20;
    
    pageLines.forEach((line, index) => {
      const stepNumber = startIndex + index + 1;
      const x = stepNumber % 2 === 1 ? leftColumnX : rightColumnX;
      const lineY = yPos + Math.floor((stepNumber - 1) / 2) * 8;
      
      if (lineY > pageHeight - 20) {
        // Move to next page if needed
        doc.addPage();
        yPos = 20;
        const newLineY = 20 + Math.floor((stepNumber - 1) / 2) * 8;
        addText(`${stepNumber}. Connect peg ${line.from} to peg ${line.to}`, x, newLineY);
      } else {
        addText(`${stepNumber}. Connect peg ${line.from} to peg ${line.to}`, x, lineY);
      }
    });
    
    // Add page number
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text(`Page ${page + 1} of ${totalPages}`, pageWidth - 40, pageHeight - 10);
  }
  
  // Add footer to last page
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text('Created with Stringy-Thingy - www.stringythingy.com', 20, pageHeight - 10);
  
  // Add QR code placeholder (you can implement actual QR code generation)
  doc.setFontSize(8);
  doc.text('Scan for more patterns', pageWidth - 60, pageHeight - 20);
  
  return doc.output('blob');
}

/**
 * Generate a simple text-based instructions file
 */
export function generateTextInstructions(options: PDFGenerationOptions): string {
  const { lines, settings } = options;
  
  let instructions = `STRING ART INSTRUCTIONS\n`;
  instructions += `========================\n\n`;
  instructions += `Frame: ${settings.frameShape === 'circle' ? 'Circular' : 'Square'}\n`;
  instructions += `Number of Pegs: ${settings.pegs}\n`;
  instructions += `Total Lines: ${lines.length}\n`;
  instructions += `Line Weight: ${settings.lineWeight}\n\n`;
  instructions += `MATERIALS NEEDED:\n`;
  instructions += `• Pre-cut wooden frame with numbered pegs\n`;
  instructions += `• Premium cotton string\n`;
  instructions += `• Scissors\n`;
  instructions += `• Tape or pins to secure string ends\n\n`;
  instructions += `TIPS FOR SUCCESS:\n`;
  instructions += `• Start with peg 0 and follow the sequence exactly\n`;
  instructions += `• Keep string tension consistent throughout\n`;
  instructions += `• Use a ruler to help with straight lines\n`;
  instructions += `• Take breaks to avoid eye strain\n`;
  instructions += `• Don't worry about small mistakes - they add character!\n\n`;
  instructions += `STEP-BY-STEP GUIDE:\n\n`;
  
  lines.forEach((line, idx) => {
    instructions += `${idx + 1}. Connect peg ${line.from} to peg ${line.to}\n`;
  });
  
  instructions += `\n\nCreated with Stringy-Thingy\n`;
  instructions += `www.stringythingy.com\n`;
  
  return instructions;
}

/**
 * Download PDF instructions
 */
export async function downloadInstructionsPDF(options: PDFGenerationOptions, filename: string = 'string-art-instructions.pdf'): Promise<void> {
  try {
    const pdfBlob = await generateInstructionsPDF(options);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF instructions');
  }
}

/**
 * Download text instructions
 */
export function downloadTextInstructions(options: PDFGenerationOptions, filename: string = 'string-art-instructions.txt'): void {
  try {
    const instructions = generateTextInstructions(options);
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating text instructions:', error);
    throw new Error('Failed to generate text instructions');
  }
}
