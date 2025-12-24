
export interface CSVRow {
  timetick: string;
  Move_Vel: string;
  Move_RegenerativeLoadRatio: string;
  SecID_Last: string;
  AddrID_Last: string;
  [key: string]: string;
}

export interface AnalysisResult {
  fileName: string;
  totalRows: number;
  detectedEvents: CSVRow[];
  timestamp: number;
}

export interface ColumnMapping {
  A: string; // timetick
  C: string; // Move_Vel
  H: string; // Move_RegenerativeLoadRatio
  AN: string; // SecID_Last
  AO: string; // AddrID_Last
}

export const DEFAULT_MAPPING: ColumnMapping = {
  A: 'timetick',
  C: 'Move_Vel',
  H: 'Move_RegenerativeLoadRatio',
  AN: 'SecID_Last',
  AO: 'AddrID_Last'
};
