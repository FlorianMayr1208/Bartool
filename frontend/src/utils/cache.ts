class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const apiCache = new SimpleCache();

// Performance tracking utilities
export const performanceTracker = {
  startTime: 0,
  
  start(label: string): void {
    this.startTime = performance.now();
    console.log(`🚀 Performance: Starting ${label}`);
  },
  
  end(label: string): number {
    const duration = performance.now() - this.startTime;
    console.log(`⚡ Performance: ${label} completed in ${duration.toFixed(2)}ms`);
    return duration;
  }
};