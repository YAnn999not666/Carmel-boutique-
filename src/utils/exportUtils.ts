import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '../types';

// Format currency without decimals or slashes
const formatCFA = (val: number): string => {
  return `${Math.round(val).toLocaleString('fr-FR').replace(/\s/g, ' ')} FCFA`;
};

// Format date with dashes instead of slashes to avoid any '/' in numbers
const formatDateClean = (dateStr?: string): string => {
  if (!dateStr) return '-';
  return dateStr.replace(/\//g, '-');
};

/**
 * Export sales list to CSV with UTF-8 BOM (compatible with Excel & LibreOffice)
 */
export function exportSalesToCSV(sales: Sale[], filenamePrefix = 'export_ventes'): void {
  if (!sales || sales.length === 0) {
    alert('Aucune vente à exporter.');
    return;
  }

  // Headers
  const headers = [
    'Référence',
    'Date',
    'Heure',
    'Caissier',
    'Mode de Paiement',
    'Article',
    'Quantité',
    'Prix Unitaire (FCFA)',
    'Remise (FCFA)',
    'Total (FCFA)',
    'Montant Reçu (FCFA)',
    'Monnaie Rendue (FCFA)',
    'Client',
  ];

  // Rows
  const rows = sales.map((s) => [
    `"${s.id || ''}"`,
    `"${formatDateClean(s.dateFormatted)}"`,
    `"${s.timeFormatted || ''}"`,
    `"${(s.cashierName || '').replace(/"/g, '""')}"`,
    `"${s.paymentType === 'Wave Business' ? 'Wave Bus' : s.paymentType || ''}"`,
    `"${(s.productName || '').replace(/"/g, '""')}"`,
    s.quantity || 1,
    Math.round(s.unitPrice || 0),
    Math.round(s.discount || 0),
    Math.round(s.totalAmount || 0),
    Math.round(s.amountReceived || 0),
    Math.round(s.changeGiven || 0),
    `"${(s.clientName ? `${s.clientTitle || ''} ${s.clientName}`.trim() : '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

  // Add UTF-8 BOM so Excel opens accents correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export sales list to PDF Report with clean layout, no slashes, no overflow, and Wave Bus naming
 */
export function exportSalesToPDF(
  sales: Sale[],
  options: { title?: string; subtitle?: string; filenamePrefix?: string } = {}
): void {
  if (!sales || sales.length === 0) {
    alert('Aucune vente à exporter.');
    return;
  }

  const {
    title = 'Rapport des Ventes',
    subtitle = 'Exportation et archivage comptable',
    filenamePrefix = 'rapport_ventes',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalQuantity = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const waveTotal = sales.filter((s) => s.paymentType === 'Wave').reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const waveBusTotal = sales.filter((s) => s.paymentType === 'Wave Business').reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const omTotal = sales.filter((s) => s.paymentType === 'OM').reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const cashTotal = sales.filter((s) => s.paymentType === 'Cash').reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} à ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 12, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text(`${subtitle} • Généré le ${dateFormatted}`, 12, 20);

  // Financial Summary Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, 31, 186, 22, 2.5, 2.5, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text("CHIFFRE D'AFFAIRES TOTAL", 16, 37);
  doc.text('NOMBRE DE VENTES', 82, 37);
  doc.text('TOTAL ARTICLES VENDUS', 134, 37);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCFA(totalRevenue), 16, 47);
  doc.text(`${sales.length} ventes`, 82, 47);
  doc.text(`${totalQuantity} unités`, 134, 47);

  // Payment Breakdown Line (using Wave Bus and bullet separators)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const paymentBreakdown = `Détails règlements : Wave : ${formatCFA(waveTotal)}   •   Wave Bus : ${formatCFA(waveBusTotal)}   •   OM : ${formatCFA(omTotal)}   •   Espèces : ${formatCFA(cashTotal)}`;
  doc.text(paymentBreakdown, 12, 59);

  // Clean Sales Table with perfectly proportioned column widths
  const tableData = sales.map((s, idx) => [
    idx + 1,
    formatDateClean(s.dateFormatted),
    s.timeFormatted || '-',
    s.cashierName || '-',
    s.paymentType === 'Wave Business' ? 'Wave Bus' : s.paymentType || '-',
    s.productName || '-',
    s.quantity || 1,
    formatCFA(s.totalAmount || 0),
  ]);

  autoTable(doc, {
    startY: 63,
    head: [['#', 'Date', 'Heure', 'Caissier', 'Moyen', 'Article', 'Qté', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 26, halign: 'left' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 56, halign: 'left' },
      6: { cellWidth: 12, halign: 'center' },
      7: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
      overflow: 'linebreak',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 12, right: 12, bottom: 16 },
    didDrawPage: (data) => {
      // Clean footer page number
      const pageStr = `Page ${data.pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(pageStr, 198, 290, { align: 'right' });
    },
  });

  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  doc.save(`${filenamePrefix}_${dateStr}.pdf`);
}
