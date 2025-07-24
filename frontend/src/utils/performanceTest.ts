// Performance testing utilities
export class PerformanceTest {
  private measurements: { [key: string]: number[] } = {};

  startTest(testName: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.measurements[testName]) {
        this.measurements[testName] = [];
      }
      this.measurements[testName].push(duration);
      return duration;
    };
  }

  getResults(): { [key: string]: { avg: number; min: number; max: number; count: number } } {
    const results: { [key: string]: { avg: number; min: number; max: number; count: number } } = {};
    
    Object.entries(this.measurements).forEach(([testName, times]) => {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      results[testName] = {
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        count: times.length
      };
    });
    
    return results;
  }

  displayResults(): void {
    const results = this.getResults();
    console.log('\n🎯 Performance Test Results:');
    console.log('================================');
    
    Object.entries(results).forEach(([testName, stats]) => {
      console.log(`\n📊 ${testName}:`);
      console.log(`   Average: ${stats.avg}ms`);
      console.log(`   Min: ${stats.min}ms`);
      console.log(`   Max: ${stats.max}ms`);
      console.log(`   Samples: ${stats.count}`);
    });
  }

  clear(): void {
    this.measurements = {};
  }
}

// Global performance tester instance
export const performanceTest = new PerformanceTest();

// Hook to measure component render times
export function useMeasureRender(componentName: string) {
  const startTime = performance.now();
  
  // Measure on mount and each render
  const endRender = () => {
    const duration = performance.now() - startTime;
    console.log(`🔧 ${componentName} render: ${duration.toFixed(2)}ms`);
  };

  // Call this in useEffect to measure
  return endRender;
}