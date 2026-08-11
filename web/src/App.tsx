import React, { useState, useEffect } from 'react';
import { useNuiEvent } from './hooks/useNuiEvent';
import { fetchNui } from './utils/fetchNui';
import { attributesMeta } from './config/attributesMeta';
import { TuningSlider } from './components/TuningSlider';
import { X, Save, RotateCcw, Copy, Upload } from 'lucide-react';

export const App: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentHandling, setCurrentHandling] = useState<Record<string, number>>({});
  const [stockHandling, setStockHandling] = useState<Record<string, number>>({});
  const [currentModel, setCurrentModel] = useState('');
  const [vehicleLabel, setVehicleLabel] = useState('');
  const [activeTab, setActiveTab] = useState('engine');
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importXml, setImportXml] = useState('');
  const [importError, setImportError] = useState('');

  const tabs = ['engine', 'brakes', 'traction', 'suspension', 'damage'];

  // Handle opening the UI
  useNuiEvent('open', (data: any) => {
    setCurrentModel(data.model);
    setVehicleLabel(data.label);
    setCurrentHandling(data.handling);
    setStockHandling(data.stock);
    setIsVisible(true);
  });

  // Handle closing with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        if (isImportModalOpen) {
          setIsImportModalOpen(false);
        } else {
          closeUI();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isImportModalOpen]);

  const closeUI = () => {
    setIsVisible(false);
    fetchNui('closeUI');
  };

  const handleValueChange = (attr: string, value: number) => {
    setCurrentHandling(prev => ({ ...prev, [attr]: value }));
    // Instantly apply in game
    fetchNui('applyValue', { attribute: attr, value });
  };

  const handleSave = () => {
    fetchNui('saveTuning', { model: currentModel, handling: currentHandling });
  };

  const handleReset = () => {
    const stock = JSON.parse(JSON.stringify(stockHandling));
    setCurrentHandling(stock);
    
    // Send all stock values back to client
    for (const [attr, val] of Object.entries(stock)) {
      fetchNui('applyValue', { attribute: attr, value: val });
    }
    
    fetchNui('resetStock', { model: currentModel });
  };

  const handleCopy = () => {
    fetchNui('triggerClipboardCopy', { model: currentModel, handling: currentHandling });
  };

  const handleImportSubmit = () => {
    if (!importXml.trim()) return;
    setImportError('');
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(`<HandlingData>${importXml}</HandlingData>`, 'text/xml');
      
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        setImportError('Invalid XML Format');
        return;
      }

      let count = 0;
      const newHandling = { ...currentHandling };

      for (const [attrName, meta] of Object.entries(attributesMeta)) {
        let parsedValue: number | null = null;
        
        const vectorMatch = attrName.match(/^(vec\w+)_(x|y|z)$/);
        if (vectorMatch) {
          const baseName = vectorMatch[1];
          const component = vectorMatch[2];
          const vecEl = xmlDoc.querySelector(baseName);
          if (vecEl) {
            const compVal = vecEl.getAttribute(component);
            if (compVal !== null) parsedValue = parseFloat(compVal);
          }
        } else {
          const el = xmlDoc.querySelector(attrName);
          if (el) {
            const valAttr = el.getAttribute('value');
            const valToParse = valAttr !== null ? valAttr : el.textContent?.trim();
            if (valToParse) {
              parsedValue = meta.type === 'hex' 
                ? parseInt(valToParse.replace(/^0x/i, ''), 16) 
                : parseFloat(valToParse);
            }
          }
        }

        if (parsedValue !== null && !isNaN(parsedValue)) {
          newHandling[attrName] = parsedValue;
          fetchNui('applyValue', { attribute: attrName, value: parsedValue });
          count++;
        }
      }

      if (count > 0) {
        setCurrentHandling(newHandling);
        setIsImportModalOpen(false);
        setImportXml('');
        fetchNui('xmlImported', { count });
      } else {
        setImportError('No matching attributes found in XML.');
      }
    } catch (e) {
      setImportError('Error parsing XML.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-end h-screen w-screen bg-transparent pr-12 font-sans select-none">
      <div className="w-[450px] max-h-[90vh] bg-gta-bg border-t-[12px] border-white flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header GTA V Style */}
        <div className="bg-gta-header px-4 py-3 flex justify-between items-center text-white border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest leading-none">Handling Editor</h1>
            <span className="text-[11px] text-gta-accent font-bold tracking-widest uppercase">{vehicleLabel} ({currentModel})</span>
          </div>
          <button onClick={closeUI} className="hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-black/60 border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab ? 'border-white text-white bg-white/10' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {Object.entries(attributesMeta).map(([attrName, meta]) => {
            if (meta.tab !== activeTab) return null;
            return (
              <TuningSlider
                key={attrName}
                attrName={attrName}
                meta={meta}
                value={currentHandling[attrName] || 0}
                onChange={handleValueChange}
              />
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="bg-gta-header p-2 flex flex-wrap gap-1 border-t border-white/10 text-white">
          <button onClick={handleSave} className="flex-1 min-w-[45%] bg-white/10 hover:bg-white hover:text-black py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
            <Save size={14} /> Save
          </button>
          <button onClick={handleReset} className="flex-1 min-w-[45%] bg-white/10 hover:bg-white hover:text-black py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={handleCopy} className="flex-1 min-w-[45%] bg-white/10 hover:bg-white hover:text-black py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
            <Copy size={14} /> Copy XML
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="flex-1 min-w-[45%] bg-white/10 hover:bg-white hover:text-black py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
            <Upload size={14} /> Import
          </button>
        </div>

        {/* Import Modal */}
        {isImportModalOpen && (
          <div className="absolute inset-0 bg-black/80 flex flex-col p-4 z-50">
            <h2 className="text-white font-bold uppercase tracking-wider mb-2">Import Handling XML</h2>
            <p className="text-white/70 text-xs mb-2">Paste handling.meta snippet below.</p>
            <textarea 
              className="flex-1 w-full bg-white/10 text-white p-2 font-mono text-xs border border-white/20 outline-none focus:border-gta-accent resize-none mb-2"
              value={importXml}
              onChange={(e) => setImportXml(e.target.value)}
              placeholder="<Item type=&quot;CHandlingData&quot;>..."
            />
            {importError && <div className="text-red-500 text-xs mb-2">{importError}</div>}
            <div className="flex gap-2">
              <button onClick={() => setIsImportModalOpen(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 text-xs font-bold uppercase">Cancel</button>
              <button onClick={handleImportSubmit} className="flex-1 bg-white hover:bg-gray-200 text-black py-2 text-xs font-bold uppercase">Import</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
