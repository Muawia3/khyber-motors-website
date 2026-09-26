import { getFileUrl } from './urlHelper';

/**
 * Extract Google Drive file ID from various Google Drive URL formats
 */
export const getGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];
  return null;
};

/**
 * Helper utilities for Vehicle Brochure PDF preview & download
 */

export const getBrochurePreviewUrl = (brochureUrl) => {
  if (!brochureUrl) return '';
  const driveId = getGoogleDriveFileId(brochureUrl);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  if (brochureUrl.startsWith('http://') || brochureUrl.startsWith('https://')) {
    return brochureUrl;
  }
  return getFileUrl(brochureUrl);
};

export const getBrochureDownloadUrl = (brochureUrl, customName = 'brochure.pdf') => {
  if (!brochureUrl) return '';
  if (brochureUrl.startsWith('blob:')) {
    return brochureUrl;
  }

  const driveId = getGoogleDriveFileId(brochureUrl);
  if (driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }

  if (brochureUrl.startsWith('http://') || brochureUrl.startsWith('https://')) {
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

  const driveId = getGoogleDriveFileId(brochureUrl);
  const fileName = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;

  if (driveId) {
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
    const windowRef = window.open(directDownloadUrl, '_blank', 'noopener,noreferrer');
    if (!windowRef) {
      const link = document.createElement('a');
      link.href = directDownloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return;
  }

  if (brochureUrl.startsWith('http://') || brochureUrl.startsWith('https://')) {
    const windowRef = window.open(brochureUrl, '_blank', 'noopener,noreferrer');
    if (!windowRef) {
      const link = document.createElement('a');
      link.href = brochureUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return;
  }

  const downloadUrl = getBrochureDownloadUrl(brochureUrl, customName);

  // Trigger immediate native browser download for local files
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', fileName);
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
