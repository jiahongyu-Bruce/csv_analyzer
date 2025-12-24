
import React, { useState } from 'react';
import { Upload, FileText, FolderOpen, X, Plus } from 'lucide-react';

interface FileSelectorProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFilesSelected, selectedFiles, onRemoveFile }) => {
  const [mode, setMode] = useState<'file' | 'folder'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Filter for CSV files only when selecting folders/multiple files
      // Added explicit cast to File[] to prevent 'unknown' type inference on file objects
      const files = (Array.from(e.target.files) as File[]).filter(f => f.name.toLowerCase().endsWith('.csv'));
      onFilesSelected(files);
      // Reset input value so the same folder/file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Data Source
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('file')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              mode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setMode('folder')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              mode === 'folder' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Folders
          </button>
        </div>
      </div>
      
      <div className="relative group">
        {mode === 'file' ? (
          <input
            key="file-input"
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        ) : (
          <input
            key="folder-input"
            type="file"
            // @ts-ignore - webkitdirectory is non-standard but supported
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}
        <div className="border-2 border-dashed border-slate-300 group-hover:border-blue-400 rounded-lg p-8 transition-colors flex flex-col items-center justify-center bg-slate-50 group-hover:bg-blue-50/50">
          {mode === 'file' ? (
            <FileText className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-3" />
          ) : (
            <FolderOpen className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-3" />
          )}
          <p className="text-slate-600 font-medium">
            {mode === 'file' ? 'Select Multiple CSV Files' : 'Select Folder(s)'}
          </p>
          <p className="text-slate-400 text-sm mt-1 text-center">
            {mode === 'file' ? 'Drag and drop files here' : 'Automatically filters for .csv files inside'}
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Queue ({selectedFiles.length})
            </p>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">CSV Files Only</span>
          </div>
          <div className="max-h-60 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
            {selectedFiles.map((file, idx) => (
              <div key={`${file.name}-${idx}-${file.size}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-slate-700 truncate font-medium">{file.name}</span>
                    <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveFile(idx)}
                  className="p-1 hover:bg-red-100 hover:text-red-600 text-slate-400 rounded transition-colors"
                  title="Remove from queue"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSelector;
