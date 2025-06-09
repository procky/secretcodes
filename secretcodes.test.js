// Import the implementation
import SecretCodeManager from './secretcodes.js';

// Helper to simulate a key press
const pressKey = (key, target = document) => {
  const event = new KeyboardEvent('keydown', {
    key: key,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
};

describe('SecretCodeManager', () => {
  let manager;
  let mockCallback;

  beforeEach(() => {
    // Create a new manager and a mock callback for each test
    manager = new SecretCodeManager();
    mockCallback = jest.fn();
  });

  afterEach(() => {
    // Clean up the manager after each test
    if (manager) {
      manager.destroy();
    }
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('addSecretCode', () => {
    it('should add a secret code and trigger its callback on correct sequence', () => {
      manager.addSecretCode('a b c', mockCallback);
      pressKey('a');
      pressKey('b');
      pressKey('c');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle key names from keyNameMap (e.g., "up")', () => {
      manager.addSecretCode('up up', mockCallback);
      pressKey('ArrowUp');
      pressKey('ArrowUp');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should be case-insensitive for letter key inputs', () => {
      manager.addSecretCode('x y z', mockCallback);
      pressKey('X');
      pressKey('y');
      pressKey('Z');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callback for incorrect sequence', () => {
      manager.addSecretCode('a b c', mockCallback);
      pressKey('a');
      pressKey('x');
      pressKey('c');
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should update maxInputBufferSize correctly', () => {
      manager.addSecretCode('a b', mockCallback);
      // Test behaviorally - add a longer code and check if it still works
      manager.addSecretCode('x y z w', mockCallback);

      // Test that the buffer can handle the longer code
      pressKey('x');
      pressKey('y');
      pressKey('z');
      pressKey('w');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid code string', () => {
      expect(() => manager.addSecretCode('', mockCallback)).toThrow(
        'Code string must be a non-empty string.'
      );
      expect(() => manager.addSecretCode(null, mockCallback)).toThrow(
        'Code string must be a non-empty string.'
      );
    });

    it('should throw error for invalid callback', () => {
      expect(() => manager.addSecretCode('a b', null)).toThrow('Callback must be a function.');
      expect(() => manager.addSecretCode('a b', 'not-a-function')).toThrow(
        'Callback must be a function.'
      );
    });

    it('should handle space key correctly', () => {
      manager.addSecretCode('space space', mockCallback);
      pressKey(' ');
      pressKey(' ');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input History and Buffer', () => {
    it('should maintain input history correctly and limit its size', () => {
      manager.addSecretCode('c d e', mockCallback);
      pressKey('a');
      pressKey('b');
      pressKey('c');
      pressKey('d');
      pressKey('e');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should allow codes to be triggered even if history was longer than code', () => {
      manager.addSecretCode('b c', mockCallback);
      pressKey('a');
      pressKey('b');
      pressKey('c');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeSecretCode', () => {
    it('should remove a secret code', () => {
      // Add a simpler code for testing
      manager.addSecretCode('a b c', mockCallback);

      // Press the keys in sequence
      pressKey('a');
      pressKey('b');
      pressKey('c');

      // The callback should be called once
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Clear the mock and remove the code
      mockCallback.mockClear();
      expect(manager.removeSecretCode('a b c')).toBe(true);

      // Press the same keys again
      pressKey('a');
      pressKey('b');
      pressKey('c');

      // Callback should not be called after removal
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should return false if trying to remove a non-existent code', () => {
      expect(manager.removeSecretCode('non existent')).toBe(false);
    });
  });

  describe('currentGuess', () => {
    it('should return the current sequence of pressed keys', () => {
      pressKey('ArrowUp');
      pressKey('a');
      pressKey(' ');
      // Note: The test expects spaces between keys in the currentGuess
      expect(manager.currentGuess).toBe('ArrowUp a  ');
    });
  });

  describe('Target Element', () => {
    it('should attach listener to a specified target element', () => {
      const customTarget = document.createElement('div');
      document.body.appendChild(customTarget);
      const customManager = new SecretCodeManager(customTarget);

      customManager.addSecretCode('t e s t', mockCallback);

      // Should not trigger on document
      pressKey('t');
      pressKey('e');
      pressKey('s');
      pressKey('t');
      expect(mockCallback).not.toHaveBeenCalled();

      // Should trigger on custom target
      const keys = ['t', 'e', 's', 't'];
      keys.forEach((key) => {
        const event = new KeyboardEvent('keydown', {
          key: key,
          bubbles: true,
          cancelable: true,
        });
        customTarget.dispatchEvent(event);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Clean up
      customManager.destroy();
      document.body.removeChild(customTarget);
    });
  });

  describe('isValidCode', () => {
    it('should validate valid codes', () => {
      const manager = new SecretCodeManager();

      // Valid codes
      expect(manager.isValidCode('a b c')).toEqual({ isValid: true });
      expect(manager.isValidCode('up down left right')).toEqual({ isValid: true });
      expect(manager.isValidCode('a b space c')).toEqual({ isValid: true });
      expect(manager.isValidCode('  a  b  c  ')).toEqual({ isValid: true }); // Test trimming

      manager.destroy();
    });

    it('should reject invalid codes', () => {
      const manager = new SecretCodeManager();

      // Invalid codes
      expect(manager.isValidCode('')).toMatchObject({
        isValid: false,
        error: 'Code string must be a non-empty string.',
      });

      expect(manager.isValidCode('   ')).toMatchObject({
        isValid: false,
        error: 'Code string must be a non-empty string.',
      });

      expect(manager.isValidCode('a b invalidkey c')).toMatchObject({
        isValid: false,
        error: expect.stringContaining('Unrecognised key:'),
      });

      manager.destroy();
    });

    it('should be used by addSecretCode for validation', () => {
      const manager = new SecretCodeManager();

      // This should work
      expect(() => manager.addSecretCode('a b c', () => {})).not.toThrow();

      // These should throw
      expect(() => manager.addSecretCode('', () => {})).toThrow(
        'Code string must be a non-empty string'
      );
      expect(() => manager.addSecretCode('a b invalidkey', () => {})).toThrow('Unrecognised key');

      manager.destroy();
    });
  });
  describe('Key Normalisation', () => {
    it('should normalise key names consistently', () => {
      const manager = new SecretCodeManager();
      const mockCallback = jest.fn();

      // Test case insensitivity and normalisation when adding code
      manager.addSecretCode('UP up Up UP', mockCallback);

      pressKey('ArrowUp');
      pressKey('ArrowUp');
      pressKey('ArrowUp');
      pressKey('ArrowUp');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});
