// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder for Node.js test environment
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}

// Simple Request and Response mocks for tests
if (typeof globalThis.Request === 'undefined') {
  class MockRequest {
    constructor(url, init = {}) {
      this._url = url
      this.method = init.method || 'GET'
      this._headers = new Map()
      this._body = init.body || null
      
      if (init.headers) {
        if (init.headers instanceof Map) {
          this._headers = new Map(init.headers)
        } else if (typeof init.headers === 'object') {
          Object.entries(init.headers).forEach(([key, value]) => {
            this._headers.set(key.toLowerCase(), value)
          })
        }
      }
      
      // Make url a getter to be compatible with NextRequest
      Object.defineProperty(this, 'url', {
        get: () => this._url,
        enumerable: true,
        configurable: true
      })
      
      // Make headers compatible with Headers API (including entries() for NextRequest)
      Object.defineProperty(this, 'headers', {
        get: () => ({
          get: (key) => this._headers.get(key.toLowerCase()),
          has: (key) => this._headers.has(key.toLowerCase()),
          set: (key, value) => this._headers.set(key.toLowerCase(), value),
          forEach: (callback) => this._headers.forEach(callback),
          entries: () => this._headers.entries(),
          keys: () => this._headers.keys(),
          values: () => this._headers.values(),
          [Symbol.iterator]: () => this._headers[Symbol.iterator](),
        }),
        enumerable: true,
        configurable: true
      })
    }
    
    get(key) {
      return this._headers.get(key.toLowerCase())
    }
    
    // Support req.json() for reading request body
    async json() {
      if (!this._body) return {}
      if (typeof this._body === 'string') {
        return JSON.parse(this._body)
      }
      return this._body
    }
    
    async text() {
      if (!this._body) return ''
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    }
  }
  
  globalThis.Request = MockRequest
}

if (typeof globalThis.Response === 'undefined') {
  class MockResponse {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Map()
      
      if (init.headers) {
        if (init.headers instanceof Map) {
          this.headers = new Map(init.headers)
        } else if (typeof init.headers === 'object') {
          Object.entries(init.headers).forEach(([key, value]) => {
            this.headers.set(key.toLowerCase(), value)
          })
        }
      }
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    async text() {
      return this.body || ''
    }
    
    // Static method for NextResponse.json()
    static json(body, init = {}) {
      return new MockResponse(JSON.stringify(body), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers
        }
      })
    }
  }
  
  globalThis.Response = MockResponse
}

