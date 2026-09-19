import { getFileUrl } from './urlHelper';

/**
 * Helper utilities for Vehicle Brochure PDF preview & download
 */

export const getBrochurePreviewUrl = (brochureUrl) => {
  if (!brochureUrl) return '';
  return getFileUrl(brochureUrl);
};

export const getBrochureDownloadUrl = (brochureUrl, customName = 'brochure.pdf') => {
  if (!brochureUrl) return '';
  if (brochureUrl.startsWith('blob:')) {
    return brochureUrl;
  }
  const filename = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;
  const downloadPath = `/api/files/download?file=${encodeURIComponent(brochureUrl)}&name=${encodeURIComponent(filename)}`;
  return getFileUrl(downloadPath);
};

export const handleDownloadBrochure = async (brochureUrl, customName = 'brochure.pdf') => {
  if (!brochureUrl) {
    throw new Error('No brochure URL available for download.');
  }

  const downloadUrl = getBrochureDownloadUrl(brochureUrl, customName);

  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      let errText = `Server returned HTTP ${response.status} error.`;
      try {
        const json = await response.json();
        if (json.error) errText = json.error;
      } catch {
        errText = `HTTP ${response.status}: Brochure file not found on server.`;
      }
      throw new Error(errText);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Brochure download error:', error);
    if (!brochureUrl.startsWith('blob:')) {
      const fallbackUrl = getBrochurePreviewUrl(brochureUrl);
      const a = document.createElement('a');
      a.href = fallbackUrl;
      a.target = '_blank';
      a.download = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    throw error;
  }
};
