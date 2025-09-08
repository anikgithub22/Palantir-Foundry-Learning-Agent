import React, { useState, useCallback, useEffect } from 'react';
import { generateFoundryGuidance, generateBuildPlan } from './services/geminiService';
import QueryInput from './components/QueryInput';
import ResponseDisplay from './components/ResponseDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { FoundryLogo, MenuIcon, XIcon } from './components/icons';
import HistoryPanel from './components/HistoryPanel';
import BuildPlanDisplay from './components/BuildPlanDisplay';
import ConfirmationModal from './components/ConfirmationModal';

export interface HistoryItem {
  id: string;
  query: string;
  response: string;
  isDraft?: boolean;
}

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);

  // State for the new "Build from Guidance" feature
  const [buildPlan, setBuildPlan] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildError, setBuildError] = useState<string | null>(null);

  // State for confirmation modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [guidanceToBuild, setGuidanceToBuild] = useState<string | null>(null);
  
  // State for clear history confirmation modal
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('foundry-aip-history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('foundry-aip-history', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);
  
  const handleSaveDraft = useCallback(() => {
    if (!query.trim()) return;

    const newDraft: HistoryItem = {
      id: new Date().toISOString() + Math.random(),
      query,
      response: '', // Drafts have no response
      isDraft: true,
    };
    
    // Avoid saving duplicate drafts
    if (!history.some(item => item.query === query && item.isDraft)) {
        setHistory(prev => [newDraft, ...prev]);
    }
    
    setQuery(''); // Clear input after saving
  }, [query, history]);


  const handleSubmit = useCallback(async () => {
    if (!query.trim() || isLoading) return;

    setError(null);
    setResponse(null);
    setBuildPlan(null);
    setIsLoading(true);
    setLoadingMessage('AIP Agent is thinking...');

    try {
      const result = await generateFoundryGuidance(query);
      setResponse(result);

      // Check if the submitted query was a draft
      const draftIndex = history.findIndex(item => item.query === query && item.isDraft);
      if (draftIndex > -1) {
        // Update the draft to a regular history item
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[draftIndex] = { ...newHistory[draftIndex], response: result, isDraft: false };
          return newHistory;
        });
      } else {
        // Add new history item
        const newHistoryItem: HistoryItem = {
          id: new Date().toISOString(),
          query,
          response: result,
        };
        // Avoid duplicates
        setHistory(prev => [newHistoryItem, ...prev.filter(item => item.query !== query)]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (window.innerWidth < 1024) { // lg breakpoint
        setIsHistoryPanelOpen(false);
      }
    }
  }, [query, isLoading, history]);

  const handleBuild = (guidance: string) => {
    setGuidanceToBuild(guidance);
    setIsModalOpen(true);
  };

  const handleConfirmBuild = async (credentials: { domain: string; token: string }) => {
    setIsModalOpen(false);
    if (!guidanceToBuild) return;

    setBuildError(null);
    setIsBuilding(true);
    setLoadingMessage('Generating build plan...');

    // In a real app, you would use credentials here.
    console.log("Building with credentials for domain:", credentials.domain);

    try {
      const plan = await generateBuildPlan(guidanceToBuild);
      setBuildPlan(plan);
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Failed to generate build plan.');
    } finally {
      setIsBuilding(false);
      setLoadingMessage('');
      setGuidanceToBuild(null);
    }
  };

  const handleHistorySelect = useCallback((id: string) => {
    const selectedItem = history.find(item => item.id === id);
    if (selectedItem) {
      setQuery(selectedItem.query);
      if (selectedItem.isDraft) {
        setResponse(null);
        setError(null);
        setBuildPlan(null);
      } else {
        setResponse(selectedItem.response);
        setError(null);
        setBuildPlan(null);
      }
    }
    if (window.innerWidth < 1024) {
        setIsHistoryPanelOpen(false);
    }
  }, [history]);

  const handleNewQuery = () => {
    setQuery('');
    setResponse(null);
    setError(null);
    setBuildPlan(null);
     if (window.innerWidth < 1024) {
        setIsHistoryPanelOpen(false);
    }
  };
  
  const handleClearHistory = () => {
    setIsClearModalOpen(true);
  };

  const handleConfirmClear = () => {
    setHistory([]);
    setQuery('');
    setResponse(null);
    setError(null);
    setBuildPlan(null);
    // The useEffect hook will handle updating localStorage
    setIsClearModalOpen(false);
  };
  
  const handleCancelClear = () => {
      setIsClearModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-foundry-dark text-gray-200">
      <HistoryPanel
        history={history}
        onSelect={handleHistorySelect}
        onNewQuery={handleNewQuery}
        onClearHistory={handleClearHistory}
        activeQuery={query}
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
      />

      <main className="flex-1 flex flex-col h-screen">
        <header className="flex items-center p-4 border-b border-foundry-slate/50 bg-foundry-charcoal/80 backdrop-blur-sm">
          <button 
            onClick={() => setIsHistoryPanelOpen(true)}
            className="p-2 mr-4 text-gray-300 hover:text-white lg:hidden"
            aria-label="Open history panel"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <FoundryLogo className="w-8 h-8 text-foundry-accent" />
          <h1 className="text-xl font-bold ml-3">Foundry AIP Agent</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {!response && !isLoading && !error && (
              <div className="text-center py-16">
                 <FoundryLogo className="w-24 h-24 text-foundry-slate mx-auto" />
                <h2 className="mt-6 text-2xl font-bold text-gray-300">Welcome to the Foundry AIP Agent</h2>
                <p className="mt-2 text-foundry-light-slate">Ask me anything about Palantir Foundry development.</p>
              </div>
            )}

            {isLoading && <LoadingSpinner message={loadingMessage || (isBuilding ? 'Generating plan...' : 'AIP Agent is thinking...')} />}
            
            {error && <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">{error}</div>}
            
            {response && (
                <ResponseDisplay 
                    responseText={response}
                    onBuild={handleBuild}
                    isBuilding={isBuilding}
                />
            )}

            {buildPlan && <BuildPlanDisplay buildPlan={buildPlan} />}
            {buildError && <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">{buildError}</div>}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 border-t border-foundry-slate/50 bg-foundry-dark/90 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <QueryInput
              query={query}
              setQuery={setQuery}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              isLoading={isLoading || isBuilding}
              loadingMessage={loadingMessage}
            />
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBuild}
      />

      {isClearModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
          aria-labelledby="clear-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-foundry-charcoal/80 rounded-lg shadow-2xl border border-foundry-slate/50 w-full max-w-sm m-4">
            <div className="p-6 text-center">
              <h2 id="clear-modal-title" className="text-lg font-semibold text-gray-100">
                Clear All History?
              </h2>
              <p className="mt-2 text-sm text-foundry-light-slate">
                This will permanently delete all your queries and responses. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end p-4 bg-foundry-dark/50 rounded-b-lg space-x-3">
              <button
                onClick={handleCancelClear}
                className="px-4 py-2 bg-foundry-slate text-white font-semibold rounded-md hover:bg-foundry-light-slate transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="futuristic-glow-button px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
              >
                Confirm & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
