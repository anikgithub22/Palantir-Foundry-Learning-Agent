import React, { useState, useEffect, useRef } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

declare const hljs: any;

interface CodeBlockProps {
  code: string;
  lang: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, lang }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, lang]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // You could add user feedback for the error here
    }
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-foundry-slate/50 text-foundry-light-slate rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 futuristic-glow-button"
        aria-label={isCopied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        title={isCopied ? 'Copied!' : 'Copy code'}
      >
        {isCopied ? (
          <CheckIcon className="w-5 h-5 text-foundry-accent" />
        ) : (
          <ClipboardIcon className="w-5 h-5 hover:text-white" />
        )}
      </button>
      <pre className="p-4 rounded-md overflow-x-auto">
        <code ref={codeRef} className={`language-${lang} text-sm`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;