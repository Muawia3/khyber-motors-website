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
  const fileName = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;

  // Trigger immediate native browser download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', fileName);
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
