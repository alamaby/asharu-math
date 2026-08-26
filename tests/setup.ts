/**
 * Setup global untuk seluruh test.
 * Beberapa lingkungan jsdom menyediakan objek localStorage yang tidak lengkap
 * (mis. tanpa metode clear); pastikan implementasi penuh berbasis memori.
 */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length(): number {
      return store.size
    },
    clear(): void {
      store.clear()
    },
    getItem(key: string): string | null {
      return store.has(key) ? (store.get(key) as string) : null
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string): void {
      store.delete(key)
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value))
    },
  }
}

interface PartialStorage {
  getItem?: unknown
  setItem?: unknown
  removeItem?: unknown
  clear?: unknown
}

const existing = window.localStorage as unknown as PartialStorage | null
const methods: Array<keyof PartialStorage> = ['getItem', 'setItem', 'removeItem', 'clear']
const incomplete = !existing || methods.some((method) => typeof existing[method] !== 'function')
if (incomplete) {
  Object.defineProperty(window, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  })
}

/** jsdom tidak menyediakan matchMedia; stub minimal untuk hook PWA & preferensi visual */
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent(): boolean {
      return false
    },
  })) as unknown as typeof window.matchMedia
}

/** jsdom tidak menyediakan IntersectionObserver; stub minimal untuk AdSlot lazy-load. */
if (typeof window.IntersectionObserver !== 'function') {
  class IntersectionObserverStub {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: ReadonlyArray<number> = [0]
    constructor(_callback: IntersectionObserverCallback) {}
    disconnect(): void {}
    observe(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
    unobserve(): void {}
  }
  window.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver
}
