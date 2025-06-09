```
                                  __                      __                                   
                                 /\ \__                  /\ \                     __           
  ____     __    ___   _ __    __\ \ ,_\   ___    ___    \_\ \     __    ____    /\_\    ____  
 /',__\  /'__`\ /'___\/\`'__\/'__`\ \ \/  /'___\ / __`\  /'_` \  /'__`\ /',__\   \/\ \  /',__\ 
/\__, `\/\  __//\ \__/\ \ \//\  __/\ \ \_/\ \__//\ \L\ \/\ \L\ \/\  __//\__, `\__ \ \ \/\__, `\
\/\____/\ \____\ \____\\ \_\\ \____\\ \__\ \____\ \____/\ \___,_\ \____\/\____/\_\_\ \ \/\____/
 \/___/  \/____/\/____/ \/_/ \/____/ \/__/\/____/\/___/  \/__,_ /\/____/\/___/\/_/\ \_\ \/___/ 
                                                                                 \ \____/      
                                                                                  \/___/       
```
# SecretCodes.js

> Secret codes, like videogame cheat codes (e.g. Konami code), in the web browser.

**LICENCE:** MIT
**VERSION:** 2.0.0
**DEPENDENCIES:** None!

[![Demo](https://img.shields.io/badge/DEMO-Live%20Demo-blue)](http://procky.github.io/secretcodes/)

**WARNING:** This is NOT a secure way of adding a password and is purely for fun. This source code and your chosen "secret codes" are publicly viewable.

## 🔥 What's New in v2.0.0

- Complete ES6+ modernisation with private class fields and methods
- Improved error handling with descriptive messages
- Added `isValidCode()` method to validate codes before adding them
- Better code organisation and maintainability
- Modern JavaScript syntax and features
- Added test coverage
- Better documentation

It's been a pleasure modernising this library while keeping its fun and simple nature!

## 🚀 Installation

### ES Module Import (for build tools like Webpack, Rollup, Vite etc.)

```javascript
import SecretCodeManager from 'secretcodes';
// or
import { SecretCodeManager } from 'secretcodes';  // if using named exports
```

### Browser Usage (ES Module Import)

```html
<script type="module">
  import SecretCodeManager from './path/to/secretcodes.js';
  const manager = new SecretCodeManager();
</script>
```

You can use a cdn like unpkg/jsdelivr to generate umd builds of the library.

## 💡 Usage Examples

### Basic Usage

```javascript
// Create a new instance
const manager = new SecretCodeManager();

// Add a secret code
manager.addSecretCode('up up down down left right left right b a enter', () => {
  console.log('Konami code activated!');
  // Add your game cheat or easter egg here
});

// Add another code with a custom target element
const gameElement = document.getElementById('game');
const gameManager = new SecretCodeManager(gameElement);

gameManager.addSecretCode('a b c', () => {
  console.log('ABC code activated on game element!');
});
```

### Advanced Usage

```javascript
const manager = new SecretCodeManager();

// Validate a code before adding it
const validation = manager.isValidCode('up up a b');
if (validation.isValid) {
  manager.addSecretCode('up up a b', () => {
    console.log('Code was valid and has been added');
  });
} else {
  console.error('Invalid code:', validation.error);
}

// Remove a code
manager.addSecretCode('remove me', () => console.log('This will be removed'));
manager.removeSecretCode('remove me');

// Get the current key sequence
console.log('Current sequence:', manager.currentGuess);

// Clean up when done
manager.destroy();
```

## 📚 API Reference

### `new SecretCodeManager([targetElement = document])`

Create a new SecretCodeManager instance.

- `targetElement` (Optional): The DOM element to listen for key events on. Defaults to `document`.

### `addSecretCode(code, callback)`

Add a secret code and its callback.

- `code` (String): The sequence of keys to match (e.g., 'up up down down')
- `callback` (Function): Function to call when the code is entered
- Throws: Error if code is invalid or callback is not a function

### `removeSecretCode(code)`

Remove a previously added secret code.

- `code` (String): The code sequence to remove
- Returns: `true` if code was found and removed, `false` otherwise

### `isValidCode(code)`

Check if a code string is valid.

- `code` (String): The code to validate
- Returns: `{isValid: Boolean, error?: String}` Validation result with optional error message

### `currentGuess` (getter)

Get the current sequence of pressed keys as a string.

### `destroy()`

Clean up event listeners and internal state.

## 📄 Licence

MIT © [Adam Wicks](https://github.com/procky)
