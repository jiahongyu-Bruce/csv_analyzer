
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  Play, 
  Trash2, 
  AlertCircle, 
  ArrowRight,
  Database,
  Activity,
  History,
  FileSearch,
  PieChart
} from 'lucide-react';
import FileSelector from './components/FileSelector';
import ResultTable from './components/ResultTable';
import EventChart from './components/EventChart';
import { AnalysisResult } from './types';
import { analyzeCSV, exportToCSV } from './services/csvProcessor';

const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<number | 'combined'>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      files.forEach(f => {
        if (!newFiles.find(existing => existing.name === f.name && existing.size === f.size)) {
          newFiles.push(f);
        }
      });
      return newFiles;
    });
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setResults([]);
    setError(null);
    setProgress({ current: 0, total: 0 });
    setActiveTab(0);
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: selectedFiles.length });
    
    const newResults: AnalysisResult[] = [];
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          const result = await analyzeCSV(file);
          newResults.push(result);
          setProgress(p => ({ ...p, current: i + 1 }));
        } catch (fileErr) {
          console.error(`Error processing ${file.name}:`, fileErr);
        }
      }
      
      setResults(newResults);
      setActiveTab(newResults.length > 1 ? 'combined' : 0);
      if (newResults.length === 0) {
        setError("None of the selected files could be processed.");
      }
    } catch (err) {
      setError("A critical error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentResult = useMemo(() => {
    if (activeTab === 'combined') return null;
    return results[activeTab as number];
  }, [results, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none mb-1">Industrial Data Insight</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">v3.0 Edge-Capture</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Regenerative Monitor</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {selectedFiles.length > 0 && !results.length && !isProcessing && (
              <button
                onClick={processFiles}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <Play className="w-4 h-4" />
                Analyze Batch ({selectedFiles.length})
              </button>
            )}
            {results.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">
          <FileSelector 
            onFilesSelected={handleFilesSelected} 
            selectedFiles={selectedFiles}
            onRemoveFile={removeFile}
          />

          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col min-h-0">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <History className="w-4 h-4 text-emerald-500" />
                Analyzed Reports
              </h2>
              
              <div className="space-y-2 overflow-y-auto max-h-[500px]">
                {/* 合併視圖按鈕 */}
                {results.length > 1 && (
                  <button
                    onClick={() => setActiveTab('combined')}
                    className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden group mb-4 ${
                      activeTab === 'combined' 
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20' 
                        : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeTab === 'combined' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-500'}`}>
                        <PieChart className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${activeTab === 'combined' ? 'text-indigo-700' : 'text-slate-700'}`}>
                          All Files Combined View
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">{results.length} series comparison</span>
                      </div>
                    </div>
                  </button>
                )}

                {results.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden group ${
                      activeTab === idx 
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {activeTab === idx && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold truncate block pr-2 ${activeTab === idx ? 'text-blue-700' : 'text-slate-700'}`}>
                        {res.fileName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400">
                        <Database className="w-3 h-3" />
                        {res.totalRows.toLocaleString()} pts
                      </div>
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-600">
                        <Activity className="w-3 h-3" />
                        {res.detectedEvents.length} events
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {isProcessing && (
            <div className="flex-1 min-h-[500px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-slate-800">Processing Batch...</h3>
              <p className="text-sm text-slate-500">{progress.current} / {progress.total} files completed</p>
            </div>
          )}

          {!results.length && !isProcessing && (
            <div className="flex-1 min-h-[500px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <FileSearch className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-slate-700">No Data Analyzed</h3>
              <p className="text-sm max-w-xs mt-2">Select files or folders to detect regenerative load transitions and compare multiple datasets.</p>
            </div>
          )}

          {activeTab === 'combined' && results.length > 0 && !isProcessing && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <EventChart multiData={results} isCombined={true} />
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-bold mb-1">Combined View Information</p>
                  <p>圖表已將所有檔案的跳變點（Transitions）對齊時間軸顯示。此模式適合觀察不同機台或不同時間段在相同關鍵位置的負載表現差異。</p>
                </div>
              </div>
            </div>
          )}

          {currentResult && activeTab !== 'combined' && !isProcessing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl"><Database className="w-6 h-6 text-blue-600" /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected File</h4>
                    <p className="text-sm font-bold text-slate-800">{currentResult.fileName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Detected Transitions</p>
                  <p className="text-lg font-bold text-emerald-600 mono">{currentResult.detectedEvents.length}</p>
                </div>
              </div>

              <EventChart data={currentResult.detectedEvents} fileName={currentResult.fileName} />
              <ResultTable 
                events={currentResult.detectedEvents} 
                onExport={() => exportToCSV(currentResult.detectedEvents, currentResult.fileName)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
