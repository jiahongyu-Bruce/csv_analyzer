
import React from 'react';
import { CSVRow } from '../types';
import { Download, Table as TableIcon } from 'lucide-react';

interface ResultTableProps {
  events: CSVRow[];
  onExport: () => void;
}

const ResultTable: React.FC<ResultTableProps> = ({ events, onExport }) => {
  // If there are too many events, we could implement windowing, 
  // but for now, we'll ensure the UI is robust.
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold text-slate-700">Event Log</h3>
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
            {events.length.toLocaleString()} RECORDS
          </span>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 bg-white shadow-sm z-20">
            <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100">
              <th className="px-6 py-3 w-1/4">Timetick</th>
              <th className="px-6 py-3 w-1/5">Velocity</th>
              <th className="px-6 py-3 w-1/4">Load Ratio (H)</th>
              <th className="px-6 py-3 w-1/6 text-center">SecID</th>
              <th className="px-6 py-3 w-1/6 text-center">AddrID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                  No transitions detected in this file.
                </td>
              </tr>
            ) : (
              events.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-6 py-3 text-xs font-medium text-slate-600 mono truncate">{row.timetick}</td>
                  <td className="px-6 py-3 text-xs text-slate-500 mono">{row.Move_Vel}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold mono border border-blue-100">
                      {row.Move_RegenerativeLoadRatio}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-center text-slate-400 mono">{row.SecID_Last}</td>
                  <td className="px-6 py-3 text-xs text-center text-slate-400 mono">{row.AddrID_Last}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;
