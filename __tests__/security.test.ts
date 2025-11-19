/**
 * Unit tests for security utilities
 */

import {
  isValidEmail,
  isValidOfferId,
  isValidFullName,
  isValidTransactionId,
  sanitizeString,
  sanitizeHTML,
  checkRateLimit,
  getClientIP,
  isValidUUID,
  validateBodySize,
  validateCSRF
} from '@/lib/security';

describe('Security Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should enforce length limits', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(false);
      // Minimum valid email is 3 chars (a@b), but our regex requires a domain with TLD
      expect(isValidEmail('a@b.c')).toBe(true);
    });
  });

  describe('isValidOfferId', () => {
    it('should validate correct offer IDs', () => {
      expect(isValidOfferId('ESIM-GLOBAL-30D-5GB')).toBe(true);
      expect(isValidOfferId('offer_123')).toBe(true);
      expect(isValidOfferId('offer-123')).toBe(true);
    });

    it('should reject invalid offer IDs', () => {
      expect(isValidOfferId('')).toBe(false);
      expect(isValidOfferId('offer with spaces')).toBe(false);
      expect(isValidOfferId('offer@123')).toBe(false);
      expect(isValidOfferId('a'.repeat(101))).toBe(false);
    });
  });

  describe('isValidFullName', () => {
    it('should validate correct names', () => {
      expect(isValidFullName('John Doe')).toBe(true);
      expect(isValidFullName("O'Brien")).toBe(true);
      expect(isValidFullName('Jean-Pierre')).toBe(true);
      expect(isValidFullName('José María')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(isValidFullName('')).toBe(false);
      expect(isValidFullName('John123')).toBe(false);
      expect(isValidFullName('John@Doe')).toBe(false);
      expect(isValidFullName('a'.repeat(201))).toBe(false);
    });
  });

  describe('isValidTransactionId', () => {
    it('should validate correct transaction IDs', () => {
      expect(isValidTransactionId('txn_1234567890_abc123')).toBe(true);
      expect(isValidTransactionId('txn_1234567890_abc-123')).toBe(true);
    });

    it('should reject invalid transaction IDs', () => {
      expect(isValidTransactionId('invalid')).toBe(false);
      expect(isValidTransactionId('txn_abc')).toBe(false);
      expect(isValidTransactionId('txn_123')).toBe(false);
      expect(isValidTransactionId('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).not.toContain('<script>');
      expect(sanitizeString('javascript:alert(1)')).not.toContain('javascript:');
      expect(sanitizeString('onclick="evil()"')).not.toContain('onclick');
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(2000);
      const sanitized = sanitizeString(longString, 100);
      expect(sanitized.length).toBeLessThanOrEqual(100);
    });

    it('should remove null bytes', () => {
      expect(sanitizeString('test\0string')).not.toContain('\0');
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const html = '<div>Safe</div><script>alert("xss")</script>';
      const sanitized = sanitizeHTML(html);
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove javascript: protocol', () => {
      const html = '<a href="javascript:alert(1)">Link</a>';
      const sanitized = sanitizeHTML(html);
      expect(sanitized).not.toContain('javascript:');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-key', 10, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-limit-' + Date.now();
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(key, 10, 60000);
      }
      // 11th request should be blocked
      const result = checkRateLimit(key, 10, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
      });
      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://example.com', {
        headers: { 'x-real-ip': '192.168.1.1' }
      });
      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return unknown if no IP headers', () => {
      const request = new Request('http://example.com');
      const ip = getClientIP(request);
      expect(ip).toBe('unknown');
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('invalid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('validateBodySize', () => {
    it('should allow valid body sizes', () => {
      const result = validateBodySize('1024', 2048);
      expect(result.valid).toBe(true);
    });

    it('should reject oversized bodies', () => {
      const result = validateBodySize('2048', 1024);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing Content-Length', () => {
      const result = validateBodySize(null);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCSRF', () => {
    it('should allow same-origin requests', () => {
      const request = new Request('http://example.com');
      const result = validateCSRF(request);
      expect(result.valid).toBe(true);
    });

    it('should validate origin when expected origin is set', () => {
      const request = new Request('http://example.com', {
        headers: { 'origin': 'http://example.com' }
      });
      const result = validateCSRF(request, 'http://example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject mismatched origins', () => {
      const request = new Request('http://example.com', {
        headers: { 'origin': 'http://evil.com' }
      });
      const result = validateCSRF(request, 'http://example.com');
      expect(result.valid).toBe(false);
    });
  });
});

