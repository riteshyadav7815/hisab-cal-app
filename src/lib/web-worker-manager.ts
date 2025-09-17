// Utility to manage Web Workers
export class WebWorkerManager {
  private static workers = new Map<string, Worker>();
  
  static createWorker(workerFunction: Function, workerName: string): Worker {
    // If worker already exists, terminate it and create a new one
    if (this.workers.has(workerName)) {
      this.workers.get(workerName)?.terminate();
    }
    
    // Create a Blob with the worker function
    const blob = new Blob([`(${workerFunction.toString()})()`], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    // Store the worker
    this.workers.set(workerName, worker);
    
    return worker;
  }
  
  static terminateWorker(workerName: string): void {
    const worker = this.workers.get(workerName);
    if (worker) {
      worker.terminate();
      this.workers.delete(workerName);
    }
  }
  
  static terminateAllWorkers(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers.clear();
  }
}

// Helper function to run a function in a Web Worker with timeout
export function runInWorker<T, R>(workerFunction: (data: T) => R, data: T, timeoutMs: number = 5000): Promise<R> {
  return new Promise((resolve, reject) => {
    // Create a worker with the function
    const workerCode = `
      self.onmessage = function(e) {
        try {
          const result = (${workerFunction.toString()})(e.data);
          self.postMessage({ result });
        } catch (error) {
          self.postMessage({ error: error.message });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error('Web Worker timed out'));
    }, timeoutMs);
    
    // Handle messages from the worker
    worker.onmessage = function(e) {
      clearTimeout(timeoutId);
      worker.terminate(); // Clean up
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.result);
      }
    };
    
    // Handle errors
    worker.onerror = function(error) {
      clearTimeout(timeoutId);
      worker.terminate(); // Clean up
      reject(error);
    };
    
    // Send data to the worker
    worker.postMessage(data);
  });
}