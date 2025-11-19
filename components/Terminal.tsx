import React, { useState, useEffect, useRef } from 'react';
import { runPythonSimulation } from '../services/gemini';

export const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<string[]>(["Microsoft Windows [Version 10.0.22621.1]", "(c) Microsoft Corporation. All rights reserved.", "", "C:\\Users\\Gemini> python"]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pythonContext, setPythonContext] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!input.trim()) {
        setHistory(prev => [...prev, `>>> ${input}`, ""]);
        setInput("");
        return;
      }

      const cmd = input;
      setHistory(prev => [...prev, `>>> ${cmd}`]);
      setInput("");
      setIsProcessing(true);

      if (cmd === 'exit()') {
        setHistory(prev => [...prev, "Exiting Python environment..."]);
        setIsProcessing(false);
        return;
      }

      if (cmd === 'clear' || cmd === 'cls') {
        setHistory([]);
        setPythonContext("");
        setIsProcessing(false);
        return;
      }

      // Call Gemini
      const output = await runPythonSimulation(cmd, pythonContext);
      
      // Update context roughly (simplified)
      setPythonContext(prev => prev + "\n" + cmd + "\n" + output);

      setHistory(prev => [...prev, output]);
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="h-full w-full bg-black/95 text-gray-200 font-mono p-2 text-sm flex flex-col overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">{line}</div>
        ))}
        {isProcessing && <div className="animate-pulse text-blue-400">Processing...</div>}
      </div>
      <div className="flex items-center p-2 border-t border-gray-800">
        <span className="mr-2 text-green-500">{'>>>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white"
          autoFocus
          autoComplete="off"
        />
      </div>
    </div>
  );
};