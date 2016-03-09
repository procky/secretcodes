/*
example.js
	Example usage of secretcodes.js
	AUTHOR: Adam Wicks
	LICENCE: MIT
	DEPENDENCIES: none!
WARNING: This is not a secure way of adding a password and is purely for fun. This source code, and your supplied codes, are publicly viewable in web browsers.
*/

"use strict";

// Adding codes to the webpage
function konamiCodeCallback() {
	alert('Konami code entered');
}
secretcodes.addSecretCode('up up down down left right left right b a enter', konamiCodeCallback);
secretcodes.addSecretCode('s e c r e t', function() { alert('How did you find this?'); } );
secretcodes.addSecretCode('q w e r t y', function() { alert('Trying every key?'); } );

var domReady = function(ready) {
	if(/in/.test(document.readyState)) {
		return setTimeout(function() { return domReady(ready); }, 9);
	}
	return ready();
};
function pageLoaded() {
	function showGuessing() {
		document.getElementById('SCJS_showcode').innerHTML = secretcodes.getCurrentGuess();
	}

	var el = document;
	if(el.addEventListener) {
		el.addEventListener('keyup', showGuessing, false);
	} else if(el.attachEvent) {
		el.attachEvent('onkeyup', showGuessing);
	}
}
domReady(pageLoaded);
