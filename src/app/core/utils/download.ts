/**
 * Helper to download a PDF blob file in the browser.
 * @param blob The binary blob of the PDF
 * @param filename The default name for the downloaded file
 */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
