import React, { useRef, useState } from 'react';
import { Upload, FileText, ExternalLink, Download, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { vehicleService } from '../../services/vehicleService';
import { getBrochurePreviewUrl, handleDownloadBrochure } from '../../utils/brochureHelper';

export const BrochureUploader = ({
  brochureUrl = '',
  onBrochureChange,
  vehicleName = 'Vehicle',
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Handle PDF File Selection & Direct Backend Upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadError('Invalid file format. Please upload a valid PDF file.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const uploadedUrl = await vehicleService.uploadFile(file);
      if (uploadedUrl) {
        onBrochureChange(uploadedUrl, file.name);
      } else {
        throw new Error('Server returned empty URL after file upload.');
      }
    } catch (err) {
      console.error('Brochure upload error:', err);
      setUploadError(err.message || 'Failed to upload brochure file to server.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper to extract clean filename
  const getFilename = () => {
    if (!brochureUrl) return 'brochure.pdf';
    if (brochureUrl.startsWith('blob:')) {
      return `${vehicleName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brochure.pdf`;
    }
    const parts = brochureUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart && lastPart.includes('.') ? lastPart : `${vehicleName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brochure.pdf`;
  };

  const onDownloadClick = async () => {
    if (!brochureUrl) return;
    try {
      setDownloading(true);
      setUploadError('');
      await handleDownloadBrochure(brochureUrl, getFilename());
    } catch (err) {
      console.error('Download error:', err);
      setUploadError(err.message || 'Failed to download brochure file.');
    } finally {
      setDownloading(false);
    }
  };

  const previewUrl = getBrochurePreviewUrl(brochureUrl);

  return (
    <div className="space-y-4">
      {/* Hidden PDF File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="application/pdf,.pdf"
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Vehicle Brochure PDF
          </label>
          <p className="text-[11px] text-gray-500">
            Upload vehicle-specific PDF sales brochure (PDF format only, saved persistently).
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          leftIcon={isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8102E]" /> : <Upload className="w-3.5 h-3.5 text-[#C8102E]" />}
        >
          {isUploading ? 'Uploading PDF...' : (brochureUrl ? 'Replace PDF' : 'Upload PDF')}
        </Button>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Brochure Status Card */}
      {brochureUrl ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xs flex items-center justify-center text-[#C8102E] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900 truncate">
                  {getFilename()}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-xs shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active PDF
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5 font-mono">
                {brochureUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                type="button"
                variant="ghost"
                size="xs"
                leftIcon={<ExternalLink className="w-3.5 h-3.5 text-gray-600" />}
                title="Preview PDF Brochure in new tab"
              >
                Preview
              </Button>
            </a>

            <Button
              type="button"
              variant="secondary"
              size="xs"
              disabled={downloading}
              onClick={onDownloadClick}
              leftIcon={downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Download className="w-3.5 h-3.5 text-white" />}
              title="Download PDF Brochure"
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              {downloading ? 'Downloading...' : 'Download'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onBrochureChange('', '')}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
              className="text-red-600 hover:bg-red-50"
              title="Remove Brochure"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xs text-center text-xs text-gray-500">
          No PDF brochure attached for this vehicle. Click "Upload PDF" to upload a sales brochure file to permanent storage.
        </div>
      )}
    </div>
  );
};
