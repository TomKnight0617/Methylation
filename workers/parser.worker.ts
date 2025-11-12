
import { AnalysisResult, MethylationCounts } from '../types';

// This is a web worker, so it runs in a separate context.
// `self` refers to the worker global scope.
self.onmessage = (e: MessageEvent<File>) => {
    const file = e.data;
    const reader = new FileReader();

    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) {
            self.postMessage({ error: 'File is empty' });
            return;
        }

        try {
            const lines = text.split('\n');
            const header = lines[0].trim().split(/\s+/);

            const group1Samples = new Set(['ddm1', 'ddmP-1', 'Nip-1', 'NIP']);
            
            const group1Indices: number[] = [];
            const pSampleIndices: number[] = [];
            const yjSampleIndices: number[] = [];

            header.forEach((colName, index) => {
                if (group1Samples.has(colName)) {
                    group1Indices.push(index);
                } else if (colName.startsWith('P')) {
                    pSampleIndices.push(index);
                } else if (colName.startsWith('YJ')) {
                    yjSampleIndices.push(index);
                }
            });

            const results: AnalysisResult = {
                group1: {},
                pSamples: {},
                yjSamples: {},
            };
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (!line.trim()) continue;

                const values = line.trim().split(/\s+/);
                
                processValues(values, group1Indices, results.group1);
                processValues(values, pSampleIndices, results.pSamples);
                processValues(values, yjSampleIndices, results.yjSamples);
            }
            
            self.postMessage(results);

        } catch (error) {
             if (error instanceof Error) {
                // Manually construct an object that can be cloned
                self.postMessage({
                    error: {
                        message: error.message,
                        stack: error.stack,
                    }
                });
            } else {
                 self.postMessage({
                    error: {
                        message: 'An unknown error occurred in the worker.'
                    }
                });
            }
        }
    };

    reader.onerror = () => {
         self.postMessage({ error: 'Failed to read file' });
    };

    reader.readAsText(file);
};

function processValues(values: string[], indices: number[], counts: MethylationCounts) {
    for (const index of indices) {
        if (index < values.length) {
            const valueStr = values[index];
            if (valueStr && valueStr.toUpperCase() !== 'NA') {
                const numValue = parseFloat(valueStr);
                if (!isNaN(numValue)) {
                    const percentage = Math.round(numValue * 100);
                    counts[percentage] = (counts[percentage] || 0) + 1;
                }
            }
        }
    }
}
