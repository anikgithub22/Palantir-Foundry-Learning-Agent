import React, { useMemo } from 'react';
import { BuildIcon } from './icons';

interface ResponseDisplayProps {
  responseText: string;
  onBuild: (responseText: string) => void;
  isBuilding: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ responseText, onBuild, isBuilding }) => {

  const parsedResponse = useMemo(() => {
    const lines = responseText.split('\n');
    const sections: { [key: string]: string[] } = {};
    let currentSection = 'title';
    sections[currentSection] = [];

    const sectionHeaders = [
      'Summary:',
      'Methodology & Steps:',
      'Best Practices & Considerations:',
      'Source & Attribution:'
    ];

    for (const line of lines) {
      const trimmedLine = line.trim();
      const matchingHeader = sectionHeaders.find(h => trimmedLine.startsWith(h));

      if (matchingHeader) {
        currentSection = matchingHeader.slice(0, -1); // Remove colon
        sections[currentSection] = [];
        if (trimmedLine.length > matchingHeader.length) {
          sections[currentSection].push(trimmedLine.substring(matchingHeader.length).trim());
        }
      } else if(trimmedLine.length > 0 || line.length > 0) { // Keep empty lines within sections
        if (!sections[currentSection]) {
            sections[currentSection] = [];
        }
        sections[currentSection].push(line); // push original line to preserve indentation
      }
    }
    
    // The first non-empty line before 'Summary:' is the title.
    const titleLines = sections['title']?.filter(line => line.trim() !== '') || [];
    const title = titleLines.length > 0 ? titleLines[0] : 'AI Response';


    return {
      title,
      summary: sections['Summary']?.join('\n'),
      methodology: sections['Methodology & Steps']?.join('\n'),
      bestPractices: sections['Best Practices & Considerations']?.join('\n'),
      sources: sections['Source & Attribution']?.join('\n'),
    };
  }, [responseText]);

  const renderSectionContent = (content: string | undefined) => {
    if (!content) return null;
  
    const lines = content.split('\n');
    let isCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';
  
    const elements = [];
    let listItems: string[] = [];
  
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-outside space-y-2 pl-5 mt-2">
            {listItems.map((item, index) => (
              <li key={index} className="text-gray-300" dangerouslySetInnerHTML={{ __html: item }}></li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };
  
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
  
      if (line.trim().startsWith('```')) {
        flushList();
        isCodeBlock = !isCodeBlock;
        if (isCodeBlock) {
          codeBlockLang = line.trim().substring(3);
        } else {
          elements.push(
            <pre key={`code-${elements.length}`} className="bg-foundry-dark/70 p-4 rounded-md overflow-x-auto my-4 border border-foundry-slate/50 text-cyan-300">
              <code className={`language-${codeBlockLang} text-sm`}>{codeBlockContent}</code>
            </pre>
          );
          codeBlockContent = '';
          codeBlockLang = '';
        }
        continue;
      }
  
      if (isCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }
  
      const listItemMatch = line.match(/^(\s*)(-|\d+\.)\s+(.*)/);
      if (listItemMatch) {
        if(listItems.length === 0) flushList(); // Flush paragraphs before new list
        listItems.push(listItemMatch[3]);
      } else {
        flushList();
        if (line.trim()) {
           // Treat lines with '**' as subheadings
          if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
             elements.push(<h4 key={`h4-${elements.length}`} className="font-semibold text-gray-200 mt-4">{line.trim().replace(/\*\*/g, '')}</h4>);
          } else {
             elements.push(<p key={`p-${elements.length}`} className="text-gray-300 mt-2">{line}</p>);
          }
        } else if (elements.length > 0) {
            // Preserve empty lines as paragraphs for spacing, but only if they are not at the beginning
            elements.push(<p key={`p-empty-${elements.length}`} className="h-4"></p>);
        }
      }
    }
  
    flushList(); // Flush any remaining list items
  
    if (isCodeBlock && codeBlockContent) {
       elements.push(
            <pre key={`code-final-${elements.length}`} className="bg-foundry-dark/70 p-4 rounded-md overflow-x-auto my-4 border border-foundry-slate/50 text-cyan-300">
              <code className={`language-${codeBlockLang} text-sm`}>{codeBlockContent}</code>
            </pre>
        );
    }

    return elements;
  };

  return (
    <article className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-gray-200 prose-ul:text-gray-300">
      <h2 className="text-2xl font-bold text-foundry-accent border-b border-foundry-slate pb-2 mb-4">
        {parsedResponse.title}
      </h2>

      {parsedResponse.summary && (
        <section className="mt-6">
          <h3 className="text-xl font-semibold text-gray-200 border-l-4 border-foundry-accent pl-4">Summary</h3>
          <div className="pl-4">
            <p className="mt-2 text-gray-300">{parsedResponse.summary}</p>
          </div>
        </section>
      )}

      {parsedResponse.methodology && (
        <section className="mt-6">
          <h3 className="text-xl font-semibold text-gray-200 border-l-4 border-foundry-accent pl-4">Methodology & Steps</h3>
          <div className="pl-4">{renderSectionContent(parsedResponse.methodology)}</div>
        </section>
      )}

      {parsedResponse.bestPractices && (
        <section className="mt-6">
          <h3 className="text-xl font-semibold text-gray-200 border-l-4 border-foundry-accent pl-4">Best Practices & Considerations</h3>
          <div className="pl-4">{renderSectionContent(parsedResponse.bestPractices)}</div>
        </section>
      )}

      {parsedResponse.sources && (
        <section className="mt-6">
          <h3 className="text-xl font-semibold text-gray-200 border-l-4 border-foundry-accent pl-4">Source & Attribution</h3>
           <div className="pl-4">{renderSectionContent(parsedResponse.sources)}</div>
        </section>
      )}
      <div className="mt-8 pt-6 border-t border-foundry-slate/50 flex justify-center">
        <button
          onClick={() => onBuild(responseText)}
          disabled={isBuilding}
          className="futuristic-glow-button flex items-center justify-center w-full max-w-xs mx-auto px-4 py-2 bg-foundry-accent text-white font-semibold rounded-md hover:bg-foundry-accent-hover disabled:bg-foundry-slate disabled:cursor-not-allowed"
          aria-label="Generate a build plan from this guidance"
        >
          <BuildIcon className="w-5 h-5 mr-2" />
          {isBuilding ? 'Generating Plan...' : 'Build from Guidance'}
        </button>
      </div>
    </article>
  );
};

export default ResponseDisplay;
