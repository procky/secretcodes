/**
 * SecretCodes: Secret codes, like videogame cheat codes (e.g. Konami code), in the web browser.
 *
 * @author Adam Wicks
 * @license MIT
 * @version 2.0.0
 */

export default class SecretCodeManager {
  #targetElement;
  #secretCodes = [];
  #keyHistory = [];
  #keyHistoryLimit = 100;
  #maxInputBufferSize = 0;
  #boundKeyDownHandler;
  #currentGuess = '';

  static get keyNameMap() {
    return new Map([
      ['backspace', 'Backspace'],
      ['tab', 'Tab'],
      ['enter', 'Enter'],
      ['shift', 'Shift'],
      ['ctrl', 'Control'],
      ['alt', 'Alt'],
      ['escape', 'Escape'],
      ['space', ' '],
      ['pageup', 'PageUp'],
      ['pagedown', 'PageDown'],
      ['end', 'End'],
      ['home', 'Home'],
      ['left', 'ArrowLeft'],
      ['up', 'ArrowUp'],
      ['right', 'ArrowRight'],
      ['down', 'ArrowDown'],
      ['insert', 'Insert'],
      ['delete', 'Delete'],
      ...Array.from({ length: 10 }, (_, i) => [String(i), String(i)]),
      ...'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => [c, c.toLowerCase()]),
    ]);
  }

  /**
   * Normalise a single key name
   * @private
   * @param {string} key - The key to normalise
   * @returns {string} The normalised key
   */
  static #normaliseKey(key) {
    if (key.length === 1) {
      return key.toLowerCase();
    }
    // Check if it's a known key name
    const normalised = SecretCodeManager.keyNameMap.get(key.toLowerCase());
    if (normalised) {
      return normalised;
    }
    // For multi-word keys, try to normalise each word
    if (key.includes(' ')) {
      return key
        .split(' ')
        .map((k) => this.#normaliseKey(k))
        .join(' ');
    }
    // Unknown key
    throw new Error(
      `Unrecognised key: '${key}'. Only single characters and standard key names are allowed.`
    );
  }

  /**
   * Create a new SecretCodeManager
   * @param {HTMLElement} [targetElement=document] - The element to listen for key events on
   */
  constructor(targetElement = document) {
    if (!targetElement || !(targetElement instanceof HTMLElement || targetElement === document)) {
      throw new Error('Target must be an HTMLElement or document');
    }

    this.#targetElement = targetElement;
    this.#boundKeyDownHandler = this.#handleKeyDown.bind(this);
    this.#targetElement.addEventListener('keydown', this.#boundKeyDownHandler);
  }

  /**
   * Add a new secret code sequence
   * @param {string} code - The secret code sequence (e.g., 'a b c')
   * @param {Function} callback - Function to call when code is entered
   * @throws {Error} If code is invalid or callback is not a function
   */
  addSecretCode(code, callback) {
    if (typeof code !== 'string' || code.trim() === '') {
      throw new Error('Code string must be a non-empty string.');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function.');
    }

    // Validate
    const validation = this.isValidCode(code);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid code');
    }

    // Normalise
    const codeArray = code
      .split(' ')
      .filter((key) => key.trim() !== '')
      .map((key) => SecretCodeManager.#normaliseKey(key));

    this.#maxInputBufferSize = Math.max(this.#maxInputBufferSize, codeArray.length);

    this.#secretCodes.push({ code: codeArray, callback });
  }

  /**
   * Remove a secret code sequence
   * @param {string} code - The secret code sequence to remove
   * @returns {boolean} true if code was removed, false if not found
   */
  removeSecretCode(code) {
    if (typeof code !== 'string' || code.trim() === '') {
      return false;
    }

    // Validate
    const validation = this.isValidCode(code);
    if (!validation.isValid) {
      return false;
    }

    // Normalise
    const codeToRemove = code
      .split(' ')
      .filter((key) => key.trim() !== '')
      .map((key) => SecretCodeManager.#normaliseKey(key));

    const initialLength = this.#secretCodes.length;

    // Filter out the matching code
    this.#secretCodes = this.#secretCodes.filter(
      (sc) => !this.#areCodeSequencesEqual(sc.code, codeToRemove)
    );

    const wasRemoved = this.#secretCodes.length < initialLength;

    if (wasRemoved) {
      this.#recalculateMaxBufferSize();
    }

    return wasRemoved;
  }

  /**
   * Get the current sequence of keys being tracked
   * @returns {string} Current key guess sequence
   */
  get currentGuess() {
    return this.#currentGuess;
  }

  /**
   * Clean up event listeners and internal state
   */
  destroy() {
    if (this.#targetElement && this.#boundKeyDownHandler) {
      this.#targetElement.removeEventListener('keydown', this.#boundKeyDownHandler);
    }
    this.#secretCodes = [];
    this.#keyHistory = [];
    this.#maxInputBufferSize = 0;
    this.#currentGuess = '';
  }

  /**
   * Check if a code string is valid
   * @param {string} code - The code string to validate (e.g., 'up up b a')
   * @returns {{isValid: boolean, error?: string}} Validation result with error message if invalid
   */
  isValidCode(code) {
    if (typeof code !== 'string' || code.trim() === '') {
      return { isValid: false, error: 'Code string must be a non-empty string.' };
    }

    const keys = code.split(' ').filter((key) => key.trim() !== '');

    if (keys.length === 0) {
      return { isValid: false, error: 'Code must contain at least one key.' };
    }

    for (const key of keys) {
      try {
        // See if it's valid
        SecretCodeManager.#normaliseKey(key);
      } catch (error) {
        return {
          isValid: false,
          error: `Invalid key '${key}' in code. ${error.message}`,
        };
      }
    }

    return { isValid: true };
  }

  // Private methods
  #handleKeyDown(event) {
    // Skip if key is being held down
    if (event.repeat) return;

    // Normalise
    const key = event.key;
    const normalisedKey = SecretCodeManager.keyNameMap.get(key.toLowerCase()) || key;

    // Update key history
    this.#keyHistory.push(normalisedKey);
    if (this.#keyHistory.length > this.#keyHistoryLimit) {
      this.#keyHistory.shift();
    }

    // Update current guess
    this.#currentGuess = this.#keyHistory.slice(-this.#maxInputBufferSize).join(' ');

    // Check against all registered codes
    for (const { code, callback } of this.#secretCodes) {
      const currentSequence = this.#keyHistory.slice(-code.length);

      if (
        currentSequence.length === code.length &&
        this.#areCodeSequencesEqual(currentSequence, code)
      ) {
        callback(event);
        break; // One callback per key press
      }
    }
  }

  #areCodeSequencesEqual(seq1, seq2) {
    if (seq1.length !== seq2.length) return false;
    return seq1.every((key, i) => key === seq2[i]);
  }

  /**
   * Get the current sequence of keys that have been pressed
   * @returns {string} The current key sequence as a space-separated string
   */
  getCurrentGuess() {
    return this.#currentGuess;
  }

  #recalculateMaxBufferSize() {
    this.#maxInputBufferSize = this.#secretCodes.reduce(
      (max, { code }) => Math.max(max, code.length),
      0
    );
  }
}
