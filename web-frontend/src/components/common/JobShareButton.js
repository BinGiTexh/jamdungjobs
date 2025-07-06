import React, { useState } from 'react';
import { FaShare, FaWhatsapp, FaLinkedin, FaTwitter, FaCopy, FaCheck } from 'react-icons/fa';

const JobShareButton = ({ job, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/jobs/${job.id}`;
  const jobTitle = job.title;
  const companyName = job.company?.name || 'a company';
  const shareText = `Check out this job opportunity: ${jobTitle} at ${companyName}`;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(jobTitle)}&summary=${encodeURIComponent(shareText)}`,
      color: 'text-blue-700 hover:bg-blue-50'
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'text-blue-500 hover:bg-blue-50'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Share this job"
      >
        <FaShare className="w-4 h-4" />
        <span className="text-sm">Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Menu */}
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]">
            <div className="py-2">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-2 ${option.color} transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="text-sm">{option.name}</span>
                </a>
              ))}
              
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-3 px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <FaCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <FaCopy className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobShareButton;
