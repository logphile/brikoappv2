export async function exportSimplePdf(text = 'BrickMOC Export', filename = 'brickmoc.pdf') {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF()
  pdf.text(text, 20, 20)
  pdf.save(filename)
}
