import React, { useState, useEffect, useRef } from 'react';
import { AppID } from '../types';
import { getCodeSuggestion } from '../services/gemini';

// --- NOTEPAD ---
export const NotepadApp: React.FC = () => {
  const [text, setText] = useState("Welcome to React WebOS!\n\nThis is a functional text editor.");
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex gap-4 px-2 py-1 text-xs border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        <span className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-2 rounded">File</span>
        <span className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-2 rounded">Edit</span>
        <span className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-2 rounded">View</span>
      </div>
      <textarea 
        className="flex-1 w-full p-4 resize-none outline-none bg-transparent dark:text-white font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1 text-xs text-right text-gray-500">
        Ln {text.split('\n').length}, Col {text.length}
      </div>
    </div>
  );
};

// --- BROWSER ---
export const BrowserApp: React.FC<{ initialUrl?: string }> = ({ initialUrl = "https://www.google.com/webhp?igu=1" }) => {
  const [url, setUrl] = useState(initialUrl);
  const [displayUrl, setDisplayUrl] = useState(initialUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = displayUrl;
    if (!target.startsWith('http')) target = 'https://' + target;
    setUrl(target);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-10 flex items-center gap-2 px-2 bg-gray-100 border-b border-gray-300">
        <div className="flex gap-1">
          <button className="w-6 h-6 rounded-full hover:bg-gray-200 text-gray-500"><i className="fas fa-arrow-left text-xs"></i></button>
          <button className="w-6 h-6 rounded-full hover:bg-gray-200 text-gray-500"><i className="fas fa-arrow-right text-xs"></i></button>
          <button className="w-6 h-6 rounded-full hover:bg-gray-200 text-gray-500"><i className="fas fa-redo text-xs"></i></button>
        </div>
        <form onSubmit={handleNavigate} className="flex-1">
          <input 
            type="text" 
            value={displayUrl}
            onChange={(e) => setDisplayUrl(e.target.value)}
            className="w-full h-7 px-3 rounded-full bg-white border border-gray-300 text-sm focus:outline-blue-500"
          />
        </form>
      </div>
      <div className="flex-1 relative bg-white">
        <iframe 
          ref={iframeRef}
          src={url}
          title="Browser"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-transparent" /> {/* Interaction blocker for dragging fix */}
      </div>
    </div>
  );
};

// --- PAINT ---
export const PaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="h-12 bg-gray-200 border-b border-gray-300 flex items-center px-4 gap-4">
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 cursor-pointer" />
        <div className="flex items-center gap-2">
          <i className="fas fa-circle text-xs"></i>
          <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24" />
        </div>
        <button onClick={() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if(canvas && ctx) ctx.clearRect(0,0, canvas.width, canvas.height);
        }} className="px-3 py-1 bg-white rounded border border-gray-300 hover:bg-gray-50 text-xs">Clear</button>
      </div>
      <div className="flex-1 overflow-hidden cursor-crosshair relative">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          className="w-full h-full bg-white block"
        />
      </div>
    </div>
  );
};

// --- VS CODE ---
export const VSCodeApp: React.FC = () => {
    const [code, setCode] = useState(`function App() {\n  return (\n    <div>Hello World</div>\n  );\n}`);
    const [suggestion, setSuggestion] = useState("");

    const handleAskAI = async () => {
        setSuggestion("Thinking...");
        const result = await getCodeSuggestion(code);
        setSuggestion(result);
    }

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-300 font-mono text-sm">
            <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-12 border-r border-[#333] flex flex-col items-center py-4 gap-4">
                    <i className="fas fa-copy text-xl text-gray-500 hover:text-white cursor-pointer"></i>
                    <i className="fas fa-search text-xl text-gray-500 hover:text-white cursor-pointer"></i>
                    <i className="fas fa-code-branch text-xl text-gray-500 hover:text-white cursor-pointer"></i>
                </div>
                {/* Main */}
                <div className="flex-1 flex flex-col">
                     <div className="h-8 bg-[#252526] flex items-center px-4 text-xs">
                         <span className="text-white">App.tsx</span>
                         <button onClick={handleAskAI} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded flex items-center gap-1">
                            <i className="fas fa-magic"></i> AI Fix
                         </button>
                     </div>
                     <div className="flex-1 relative">
                         <textarea 
                            className="w-full h-full bg-[#1e1e1e] text-gray-300 p-4 outline-none resize-none font-mono"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                         />
                         {suggestion && (
                             <div className="absolute bottom-0 left-0 right-0 bg-[#2d2d2d] border-t border-blue-500 p-2 text-xs">
                                 <div className="font-bold text-blue-400 mb-1">Gemini Suggestion:</div>
                                 <pre>{suggestion}</pre>
                                 <button onClick={() => setSuggestion("")} className="mt-2 text-gray-500 hover:text-white">Close</button>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        </div>
    );
}

// --- CALCULATOR ---
export const CalculatorApp: React.FC = () => {
    const [disp, setDisp] = useState("0");

    const btnClass = "flex-1 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-lg font-medium text-gray-800 dark:text-white transition-colors";
    const opsClass = "flex-1 h-12 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 rounded text-lg font-medium text-blue-600 dark:text-blue-300 transition-colors";

    const handlePress = (val: string) => {
        if(val === 'C') setDisp("0");
        else if(val === '=') {
            try {
                // eslint-disable-next-line no-eval
                setDisp(eval(disp).toString());
            } catch { setDisp("Error"); }
        } else {
            setDisp(prev => prev === "0" ? val : prev + val);
        }
    }

    return (
        <div className="h-full flex flex-col p-2 bg-white dark:bg-gray-800 gap-2">
            <div className="h-16 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-end justify-end p-3 text-3xl font-light text-gray-800 dark:text-white overflow-hidden">
                {disp}
            </div>
            <div className="flex-1 grid grid-cols-4 gap-1">
                {['7','8','9','/'].map(c => <button key={c} onClick={()=>handlePress(c)} className={['/'].includes(c) ? opsClass : btnClass}>{c}</button>)}
                {['4','5','6','*'].map(c => <button key={c} onClick={()=>handlePress(c)} className={['*'].includes(c) ? opsClass : btnClass}>{c}</button>)}
                {['1','2','3','-'].map(c => <button key={c} onClick={()=>handlePress(c)} className={['-'].includes(c) ? opsClass : btnClass}>{c}</button>)}
                {['C','0','=','+'].map(c => <button key={c} onClick={()=>handlePress(c)} className={['+','C','='].includes(c) ? opsClass : btnClass}>{c}</button>)}
            </div>
        </div>
    );
}

// --- VIDEO EDITOR (Mock) ---
export const VideoEditorApp: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="h-1/2 flex border-b border-gray-700">
        <div className="w-1/3 border-r border-gray-700 p-2">
          <div className="text-xs text-gray-400 mb-2">Media Pool</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800 aspect-square rounded flex items-center justify-center"><i className="fas fa-video text-gray-600"></i></div>
            <div className="bg-gray-800 aspect-square rounded flex items-center justify-center"><i className="fas fa-image text-gray-600"></i></div>
            <div className="bg-gray-800 aspect-square rounded flex items-center justify-center"><i className="fas fa-music text-gray-600"></i></div>
          </div>
        </div>
        <div className="w-2/3 bg-black flex items-center justify-center relative">
             <i className="fas fa-play-circle text-6xl text-white/20 hover:text-white/50 cursor-pointer transition-colors"></i>
             <span className="absolute bottom-2 left-2 text-xs font-mono text-gray-500">00:00:00:00</span>
        </div>
      </div>
      <div className="h-1/2 flex flex-col">
         <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-2 gap-4 text-xs">
            <i className="fas fa-cut cursor-pointer"></i>
            <i className="fas fa-copy cursor-pointer"></i>
            <i className="fas fa-paste cursor-pointer"></i>
            <div className="h-4 w-[1px] bg-gray-600 mx-2"></div>
            <i className="fas fa-undo cursor-pointer"></i>
            <i className="fas fa-redo cursor-pointer"></i>
         </div>
         <div className="flex-1 relative overflow-x-auto p-2 bg-[#1a1a1a]">
             <div className="absolute top-2 left-0 h-full w-[1px] bg-red-500 z-10"></div>
             {/* Tracks */}
             <div className="h-12 bg-blue-900/40 border border-blue-800 rounded mb-1 w-[400px] flex items-center px-2 text-xs">Video Track 1</div>
             <div className="h-12 bg-green-900/40 border border-green-800 rounded w-[600px] ml-12 flex items-center px-2 text-xs">Audio Track 1</div>
         </div>
      </div>
    </div>
  )
}