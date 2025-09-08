import React from 'react';
import { SendIcon } from './icons';

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  isLoading: boolean;
  loadingMessage: string;
}

const QueryInput: React.FC<QueryInputProps> = ({ query, setQuery, onSubmit, onSaveDraft, isLoading, loadingMessage }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div>
      <label htmlFor="query" className="block text-sm font-medium text-foundry-light-slate mb-2">
        Enter your Palantir Foundry question
      </label>
      <div className="relative futuristic-input-glow rounded-lg flex items-center bg-foundry-dark/70 border border-foundry-slate">
        <textarea
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., How do I use the Ontology SDK to edit an object?"
          rows={3}
          className="flex-1 w-full p-4 bg-transparent border-none rounded-lg focus:ring-0 focus:outline-none resize-none transition-colors"
          disabled={isLoading}
        />
        <div className="flex items-center self-stretch p-2">
            <button
                onClick={onSaveDraft}
                disabled={isLoading || !query.trim()}
                title="Save as Draft"
                className="futuristic-glow-button h-full flex items-center justify-center min-w-[90px] sm:min-w-[100px] px-3 sm:px-4 py-2 bg-foundry-slate/80 text-white font-semibold rounded-md hover:bg-foundry-slate disabled:bg-foundry-slate/40 disabled:text-foundry-light-slate/50 disabled:cursor-not-allowed mr-2 transition-all"
            >
              Save Draft
            </button>
            <button
              onClick={onSubmit}
              disabled={isLoading || !query.trim()}
              className="futuristic-glow-button h-full flex items-center justify-center min-w-[90px] sm:min-w-[120px] px-3 sm:px-4 py-2 bg-foundry-accent text-white font-semibold rounded-md hover:bg-foundry-accent-hover disabled:bg-foundry-slate disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (loadingMessage || 'Thinking...') : (
                <>
                  <span className="sm:hidden">Ask</span>
                  <span className="hidden sm:inline">Ask Agent</span>
                </>
              )}
              {!isLoading && <SendIcon className="w-4 h-4 ml-2" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default QueryInput;
