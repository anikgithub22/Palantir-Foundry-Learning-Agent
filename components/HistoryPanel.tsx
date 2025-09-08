import React from 'react';
import { HistoryItem } from '../App';
import { PlusIcon, XIcon, TrashIcon } from './icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (id: string) => void;
  onNewQuery: () => void;
  onClearHistory: () => void;
  activeQuery: string;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onNewQuery, onClearHistory, activeQuery, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop for mobile view */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* The panel itself */}
      <aside
        className={`
          w-64 bg-foundry-charcoal/80 p-4 border-r border-foundry-slate/50 
          flex flex-col h-screen backdrop-blur-sm 
          fixed lg:static top-0 left-0 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-foundry-light-slate hover:text-white rounded-md lg:hidden"
          aria-label="Close history"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={onNewQuery} 
          className="futuristic-glow-button flex items-center justify-center w-full px-4 py-2 mb-4 bg-foundry-accent text-white font-semibold rounded-md hover:bg-foundry-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-foundry-charcoal focus:ring-foundry-accent"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Query
        </button>
        <h2 className="text-lg font-semibold text-gray-300 mb-2 px-2">History</h2>
        <div className="overflow-y-auto flex-1">
          {history.length === 0 ? (
              <p className="text-sm text-foundry-light-slate px-2">No queries yet.</p>
          ) : (
            <ul className="space-y-1">
              {history.map(item => {
                const isActive = item.query === activeQuery && item.query !== '' && !item.isDraft;
                return (
                  <li key={item.id}>
                    <button 
                      onClick={() => onSelect(item.id)}
                      className={`w-full flex items-center text-left p-2 rounded-md text-sm transition-colors relative ${
                        isActive 
                          ? 'bg-foundry-accent/20 text-foundry-accent font-semibold' 
                          : 'text-gray-300 hover:bg-foundry-slate/50'
                      }`}
                      title={item.query}
                    >
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-foundry-accent rounded-r-full"></span>}
                      <span className="pl-2 flex-grow truncate">{item.query}</span>
                      {item.isDraft && (
                        <span className="ml-2 flex-shrink-0 text-xs bg-foundry-slate text-foundry-light-slate px-2 py-0.5 rounded-full font-medium">
                          Draft
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="mt-auto pt-4 border-t border-foundry-slate/50">
            <button
                onClick={onClearHistory}
                disabled={history.length === 0}
                className="futuristic-glow-button flex items-center justify-center w-full px-4 py-2 text-sm bg-foundry-slate/60 text-red-400 font-semibold rounded-md hover:bg-foundry-slate/90 hover:text-red-300 disabled:bg-transparent disabled:text-foundry-light-slate/40 disabled:cursor-not-allowed transition-all"
                aria-label="Clear all history"
            >
                <TrashIcon className="w-4 h-4 mr-2" />
                Clear History
            </button>
        </div>
      </aside>
    </>
  );
};

export default HistoryPanel;
