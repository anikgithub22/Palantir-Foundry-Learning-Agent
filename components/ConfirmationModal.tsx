import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (credentials: { domain: string; token: string }) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [domain, setDomain] = useState('');
  const [token, setToken] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(domain.trim() !== '' && token.trim() !== '');
  }, [domain, token]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setDomain('');
      setToken('');
    }
  }, [isOpen]);
  
  const handleConfirm = () => {
    if (isFormValid) {
      onConfirm({ domain, token });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      handleConfirm();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-foundry-charcoal/80 rounded-lg shadow-2xl border border-foundry-slate/50 w-full max-w-md m-4 transform transition-all" onKeyDown={handleKeyDown}>
        <div className="flex items-center justify-between p-4 border-b border-foundry-slate">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-100">
            Confirm Project Build
          </h2>
          <button onClick={onClose} className="text-foundry-light-slate hover:text-white transition-colors" aria-label="Close modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-foundry-light-slate">
            Please provide your Palantir Foundry credentials to proceed. This information is required to generate a build plan for your environment.
          </p>
          <div>
            <label htmlFor="foundry-domain" className="block text-sm font-medium text-gray-300 mb-1">
              Foundry Domain
            </label>
            <input
              type="text"
              id="foundry-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="your-company.palantirfoundry.com"
              className="w-full p-2 bg-foundry-dark border border-foundry-slate rounded-md focus:ring-2 focus:ring-foundry-accent focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="api-token" className="block text-sm font-medium text-gray-300 mb-1">
              API Token
            </label>
            <input
              type="password"
              id="api-token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Foundry API token"
              className="w-full p-2 bg-foundry-dark border border-foundry-slate rounded-md focus:ring-2 focus:ring-foundry-accent focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex justify-end p-4 bg-foundry-dark/50 rounded-b-lg space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-foundry-slate text-white font-semibold rounded-md hover:bg-foundry-light-slate transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="futuristic-glow-button px-4 py-2 bg-foundry-accent text-white font-semibold rounded-md hover:bg-foundry-accent-hover disabled:bg-foundry-slate disabled:cursor-not-allowed"
          >
            Confirm & Build
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
