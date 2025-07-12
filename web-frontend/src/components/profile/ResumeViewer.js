import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';

/**
 * ResumeViewer Component
 * Provides inline viewing of resumes with iframe for PDFs and document preview for other formats
 */
const ResumeViewer = ({ 
  open, 
  onClose, 
  resumeUrl, 
  resumeFileName,
  maxWidth = 'lg'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);

  // Construct full resume URL - handle both relative and absolute URLs
  const getFullResumeUrl = () => {
    if (!resumeUrl) return '';
    
    // If it's already a full URL, return as-is
    if (resumeUrl.startsWith('http')) {
      return resumeUrl;
    }
    
    // If it starts with /uploads, prepend the API base URL
    if (resumeUrl.startsWith('/uploads')) {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return `${apiBaseUrl}${resumeUrl}`;
    }
    
    // Otherwise, assume it's a relative path from uploads
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${apiBaseUrl}/uploads/${resumeUrl}`;
  };

  const fullResumeUrl = getFullResumeUrl();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setLoading(true);
      setError('');
      setZoom(100);
      
      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('ResumeViewer Debug:', { // eslint-disable-line no-console
          originalResumeUrl: resumeUrl,
          fullResumeUrl: fullResumeUrl,
          fileName: resumeFileName
        });
      }
    }
  }, [open, resumeUrl, fullResumeUrl, resumeFileName]);

  // Get file extension
  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  };

  const fileExtension = getFileExtension(resumeFileName);
  const isPDF = fileExtension === 'pdf';
  const isDoc = ['doc', 'docx'].includes(fileExtension);

  // Handle iframe load
  const handleIframeLoad = () => {
    setLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setLoading(false);
    setError('Unable to preview this document. You can download it to view.');
  };

  // Handle download
  const handleDownload = () => {
    if (fullResumeUrl) {
      const link = document.createElement('a');
      link.href = fullResumeUrl;
      link.download = resumeFileName || 'resume';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (fullResumeUrl) {
      window.open(fullResumeUrl, '_blank');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: { 
          height: '90vh',
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📄 {resumeFileName || 'Resume Preview'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Zoom Controls for PDFs */}
          {isPDF && !error && (
            <>
              <IconButton 
                size="small" 
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                title="Zoom Out"
              >
                <ZoomOutIcon />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: '45px', textAlign: 'center' }}>
                {zoom}%
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                title="Zoom In"
              >
                <ZoomInIcon />
              </IconButton>
            </>
          )}
          
          {/* Fullscreen Button */}
          <IconButton 
            size="small" 
            onClick={handleFullscreen}
            title="Open in New Tab"
          >
            <FullscreenIcon />
          </IconButton>
          
          {/* Download Button */}
          <IconButton 
            size="small" 
            onClick={handleDownload}
            title="Download Resume"
          >
            <DownloadIcon />
          </IconButton>
          
          {/* Close Button */}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#ffffff' }}>
        {/* Loading State */}
        {loading && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '400px',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading resume preview...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{
                  backgroundColor: '#009639',
                  '&:hover': {
                    backgroundColor: '#007A2E'
                  }
                }}
              >
                Download Resume
              </Button>
            </Box>
          </Box>
        )}

        {/* Resume Preview */}
        {fullResumeUrl && !error && (
          <Box sx={{ height: '100%', position: 'relative' }}>
            {isPDF ? (
              // PDF Preview with iframe
              <iframe
                src={`${fullResumeUrl}#zoom=${zoom}`}
                style={{
                  width: '100%',
                  height: '70vh',
                  border: 'none',
                  display: loading ? 'none' : 'block'
                }}
                title="Resume Preview"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            ) : isDoc ? (
              // For DOC/DOCX files, show a preview message and download option
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Document preview is not available for {fileExtension.toUpperCase()} files. 
                  Please download to view the full content.
                </Alert>
                
                <Box sx={{ 
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  backgroundColor: '#f9f9f9'
                }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    📄 {resumeFileName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {fileExtension.toUpperCase()} Document
                  </Typography>
                  
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    size="large"
                    sx={{
                      backgroundColor: '#009639',
                      '&:hover': {
                        backgroundColor: '#007A2E'
                      }
                    }}
                  >
                    Download Resume
                  </Button>
                </Box>
                {setLoading(false)}
              </Box>
            ) : (
              // Unsupported file type
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Preview not available for this file type.
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{
                    backgroundColor: '#009639',
                    '&:hover': {
                      backgroundColor: '#007A2E'
                    }
                  }}
                >
                  Download Resume
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {isPDF ? 'Use zoom controls to adjust preview size' : 'Download for full document access'}
        </Typography>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumeViewer;