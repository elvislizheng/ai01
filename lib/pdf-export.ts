import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { MidiData } from './midi-types';
import { midiToMusicXML } from './midi-to-musicxml';

interface PdfOptions {
  filename?: string;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  title?: string;
}

export async function exportToPdf(data: MidiData, options: PdfOptions = {}): Promise<void> {
  const {
    filename = data.name || 'sheet-music',
  } = options;

  try {
    // Convert MIDI to MusicXML
    const musicXML = midiToMusicXML(data);

    // Create a temporary container for rendering with proper dimensions
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-10000px';
    container.style.left = '-10000px';
    container.style.width = '793px'; // A4 width in pixels at 96 DPI
    container.style.height = 'auto';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '40px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'Times New Roman, serif';
    document.body.appendChild(container);

    try {
      // Initialize OSMD with professional settings
      const osmd = new OpenSheetMusicDisplay(container, {
        autoResize: false,
        backend: 'svg',
        drawTitle: true,
        drawSubtitle: false,
        drawComposer: false,
        drawLyricist: false,
        drawCredits: true,
        drawPartNames: false,
        drawMetronomeMarks: true,
        drawingParameters: 'compact',
        followCursor: false
      });

      // Load and render the MusicXML
      await osmd.load(musicXML);
      await osmd.render();

      // Wait for rendering to complete fully
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture the rendered music as image using html2canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 3, // Higher quality for professional output
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 0
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit the page
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions maintaining aspect ratio
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If content is taller than one page, split into multiple pages
      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
      }

      // Download the PDF
      pdf.save(`${filename}.pdf`);

    } finally {
      // Clean up the temporary container
      document.body.removeChild(container);
    }

  } catch (error) {
    console.error('PDF export error:', error);

    // Fallback: create a simple PDF with message
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(16);
    pdf.text('Sheet Music Export', pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text('Unable to generate sheet music notation.', pageWidth / 2, 50, { align: 'center' });
    pdf.text('Please check your browser console for details.', pageWidth / 2, 60, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`Title: ${data.name || 'Untitled'}`, 20, 80);
    pdf.text(`Tempo: ${Math.round(data.tempo)} BPM`, 20, 90);
    pdf.text(`Time: ${data.timeSignature.numerator}/${data.timeSignature.denominator}`, 20, 100);
    pdf.text(`Notes: ${data.tracks.reduce((sum, t) => sum + t.notes.length, 0)}`, 20, 110);

    pdf.save(`${filename}.pdf`);

    throw new Error(`Failed to generate notation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
