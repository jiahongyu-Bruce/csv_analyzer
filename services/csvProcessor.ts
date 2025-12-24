
import Papa from 'papaparse';
import { CSVRow, AnalysisResult, DEFAULT_MAPPING } from '../types';

export const analyzeCSV = (file: File): Promise<AnalysisResult> => {
  return new Promise((resolve, reject) => {
    let prevRatio: string | null = null;
    let lastZeroRow: any = null;
    const detectedEvents: CSVRow[] = [];
    let rowCount = 0;

    const isZero = (val: any) => {
      if (val === null || val === undefined) return true;
      const s = String(val).trim();
      return s === "0" || s === "0.0" || s === "0.00" || s === "";
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      chunk: (results) => {
        const data = results.data as any[];
        data.forEach((row) => {
          rowCount++;
          const currentRatio = row[DEFAULT_MAPPING.H];
          const currentRow: CSVRow = {
            timetick: row[DEFAULT_MAPPING.A] || '',
            Move_Vel: row[DEFAULT_MAPPING.C] || '',
            Move_RegenerativeLoadRatio: String(currentRatio) || '0',
            SecID_Last: row[DEFAULT_MAPPING.AN] || '',
            AddrID_Last: row[DEFAULT_MAPPING.AO] || '',
          };

          if (currentRatio !== prevRatio && currentRatio !== undefined) {
            const currentIsZero = isZero(currentRatio);
            const prevIsZero = isZero(prevRatio);

            if (prevIsZero && !currentIsZero) {
              // 0 -> n: 記錄之前的 0 點，以及現在的 n 點
              if (lastZeroRow) {
                detectedEvents.push({...lastZeroRow});
              }
              detectedEvents.push({...currentRow});
            } else if (!prevIsZero && currentIsZero) {
              // n -> 0: 記錄現在這個 0 點
              detectedEvents.push({...currentRow});
            } else if (!currentIsZero) {
              // n -> m: 記錄變化的數值
              detectedEvents.push({...currentRow});
            }
            
            prevRatio = currentRatio;
          }

          // 持續更新最後看到的 0 點位置
          if (isZero(currentRatio)) {
            lastZeroRow = {...currentRow};
          }
        });
      },
      complete: () => {
        resolve({
          fileName: file.name,
          totalRows: rowCount,
          detectedEvents,
          timestamp: Date.now(),
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const exportToCSV = (events: CSVRow[], fileName: string) => {
  const csv = Papa.unparse(events);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Analysis_${fileName}`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
