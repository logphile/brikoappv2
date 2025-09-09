import autoTable from "jspdf-autotable";
import type jsPDF from "jspdf";

export function renderBOM(pdf: jsPDF, bom: Array<{partLabel:string;colorName:string;qty:number;estimate?:number}>) {
  const M = 40;
  pdf.setFont("Outfit","heavy"); pdf.setTextColor(17); pdf.setFontSize(18);
  pdf.text("Bill of Materials", M, 64);

  autoTable(pdf, {
    startY: 84,
    head: [["Part","Color","Qty","Est. $"]],
    body: bom.map(r => [r.partLabel, r.colorName, r.qty.toString(), r.estimate!=null ? r.estimate.toFixed(2) : "—"]),
    styles: { font:"Outfit", fontStyle:"normal", fontSize:10, lineColor:[229,231,235], lineWidth:0.25, textColor:[17,24,39] },
    headStyles: { fillColor:[17,24,39], textColor:255, font:"Outfit", fontStyle:"bold" },
    alternateRowStyles: { fillColor:[249,250,251] },
    columnStyles: { 2:{ halign:"right", cellWidth:40 }, 3:{ halign:"right", cellWidth:50 } },
    margin: { left:M, right:M }
  });

  const H = pdf.internal.pageSize.getHeight();
  pdf.setFont("Outfit","normal"); pdf.setFontSize(9); pdf.setTextColor(120);
  pdf.text("Estimated cost varies by seller, region, and color availability. LEGO® is a trademark of the LEGO Group.", M, H-24);
}
