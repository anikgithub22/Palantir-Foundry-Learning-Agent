import React from 'react';

interface BuildPlanDisplayProps {
  buildPlan: string;
}

const BuildPlanDisplay: React.FC<BuildPlanDisplayProps> = ({ buildPlan }) => {
  // Assuming buildPlan is a markdown code block, extract the language and content
  const codeMatch = buildPlan.match(/```(\w*)\n([\s\S]*?)```/);
  const lang = codeMatch ? codeMatch[1] : '';
  const code = codeMatch ? codeMatch[2].trim() : buildPlan.trim();

  return (
    <div className="bg-foundry-charcoal/80 backdrop-blur-sm p-6 rounded-lg shadow-2xl border border-foundry-slate/50 mt-8">
      <h3 className="text-xl font-semibold text-foundry-accent mb-4 border-l-4 border-foundry-accent pl-4">
        Generated Build Plan
      </h3>
      <pre className="bg-foundry-dark/70 p-4 rounded-md overflow-x-auto my-4 border border-foundry-slate/50 text-cyan-300">
        <code className={`language-${lang} text-sm`}>{code}</code>
      </pre>
      <p className="text-xs text-center text-foundry-light-slate italic mt-4">
        This build plan was auto-generated. Always review and test code before executing in a production environment.
      </p>
    </div>
  );
};

export default BuildPlanDisplay;
