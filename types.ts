
export type MethylationCounts = {
  [percentage: number]: number;
};

export interface AnalysisResult {
  group1: MethylationCounts;
  pSamples: MethylationCounts;
  yjSamples: MethylationCounts;
}
