import React, { useMemo } from 'react';
import { BuildIcon } from './icons';
import CodeBlock from './CodeBlock';

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

  const renderSectionContent = (content: string | undefined, isMethodology = false) => {
    if (!content) return null;
  
    const lines = content.split('\n');
    let isCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';
    
    const elements: { type: string; content: any; props?: any }[] = [];
    let listItems: string[] = [];
    const stepIdMap: { [key: number]: string } = {};

    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-');
  
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push({ type: 'ul', content: [...listItems] });
        listItems = [];
      }
    };
  
    // --- First Pass: Build elements and identify steps ---
    lines.forEach((line) => {
      if (line.trim().startsWith('```')) {
        flushList();
        isCodeBlock = !isCodeBlock;
        if (isCodeBlock) {
          codeBlockLang = line.trim().substring(3);
        } else {
          elements.push({ type: 'code', content: codeBlockContent, props: { lang: codeBlockLang } });
          codeBlockContent = '';
          codeBlockLang = '';
        }
        return;
      }
  
      if (isCodeBlock) {
        codeBlockContent += line + '\n';
        return;
      }
  
      const listItemMatch = line.match(/^(\s*)(-|\d+\.)\s+(.*)/);
      if (listItemMatch) {
        if (listItems.length === 0) flushList();
        listItems.push(listItemMatch[3]);
      } else {
        flushList();
        if (line.trim()) {
          const stepHeaderMatch = isMethodology && line.match(/^\s*(\d+)\.\s+\*\*(.*?)\*\*/);
          if (stepHeaderMatch) {
            const stepNumber = parseInt(stepHeaderMatch[1], 10);
            const stepTitle = stepHeaderMatch[2].replace(/:$/, '');
            const stepId = `step-${stepNumber}-${slugify(stepTitle)}`;
            stepIdMap[stepNumber] = stepId;
            elements.push({ type: 'h4', content: line.trim().replace(/\*\*/g, ''), props: { id: stepId } });
          } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
            elements.push({ type: 'h4', content: line.trim().replace(/\*\*/g, '') });
          } else {
            elements.push({ type: 'p', content: line });
          }
        } else if (elements.length > 0) {
          elements.push({ type: 'p', content: '', props: { className: "h-4" } });
        }
      }
    });
  
    flushList();
    if (isCodeBlock && codeBlockContent) {
      elements.push({ type: 'code', content: codeBlockContent, props: { lang: codeBlockLang } });
    }

    // --- Second Pass: Link steps and render ---
    const linkifyStepReferences = (text: string) => {
        return text.replace(/([Ss]tep\s+(\d+))/g, (match, _, stepNum) => {
            const stepId = stepIdMap[parseInt(stepNum, 10)];
            if (stepId) {
                return `<a href="#${stepId}" class="text-foundry-accent hover:underline">${match}</a>`;
            }
            return match; // Return original text if step ID not found
        });
    };

    return elements.map((el, index) => {
      switch (el.type) {
        case 'h4':
          return <h4 key={index} id={el.props?.id} className="font-semibold text-gray-200 mt-4">{el.content}</h4>;
        case 'p':
          const linkedContent = isMethodology ? linkifyStepReferences(el.content) : el.content;
          return <p key={index} className={`text-gray-300 mt-2 ${el.props?.className || ''}`} dangerouslySetInnerHTML={{ __html: linkedContent }} />;
        case 'ul':
          return (
            <ul key={index} className="list-disc list-outside space-y-2 pl-5 mt-2">
              {(el.content as string[]).map((item, itemIndex) => (
                <li key={itemIndex} className="text-gray-300" dangerouslySetInnerHTML={{ __html: isMethodology ? linkifyStepReferences(item) : item }}></li>
              ))}
            </ul>
          );
        case 'code':
          return (
            <CodeBlock 
              key={index} 
              lang={el.props.lang} 
              code={el.content.trim()} 
            />
          );
        default:
          return null;
      }
    });
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
          <div className="pl-4">{renderSectionContent(parsedResponse.methodology, true)}</div>
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