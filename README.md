# secretcodes.js
> Secret codes, like videogame cheat codes (e.g. Konami code), in the web browser.

**LICENCE:** MIT

**DEPENDENCIES:** none!

**WARNING:** This is NOT a secure way of adding a password and is purely for fun. This source code and your chosen "secret codes" are publicly viewable.


## Example usage

Download and add secretcodes.js to your project like

```html
<script type="text/javascript" src="lib/secretcodes.js"></script>
```

You supply the codes that users can input and a callback function for each code when they are performed.

```javascript
function konamiCodeCallback() {
	// code inputted so this function is called
	// execute any code you want
}
SCJS.Manager.addSecretCode('up up down down left right left right b a enter', konamiCodeCallback);
```
