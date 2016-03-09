/*
secretcodes.js v1.0
	Adds secret codes, like videogame cheat codes (e.g. Konami code), to the web browser.
	You supply the codes to be performed and a callback function for each code when they are input.
	AUTHOR: Adam Wicks
	LICENCE: MIT
	DEPENDENCIES: none!
WARNING: This is NOT a secure way of adding a password and is purely for fun. This source code and your chosen "secret codes" are publicly viewable.


Obfuscator/minifiers:
http://marijnhaverbeke.nl/uglifyjs
http://closure-compiler.appspot.com/home	-	https://developers.google.com/closure/compiler/
http://www.crockford.com/javascript/jsmin.html
http://refresh-sf.com/yui/
http://dean.edwards.name/packer/
http://www.obfuscriptor.com/
http://www.javascriptobfuscator.com/
*/

var SCJS = {};
SCJS.Manager = (function() {
	"use strict";

	// If you wish to expand the dictionary you can find the number relating to the key here: https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent
	// Some keys cross browser vary. Keys that modify like shift+a are not supported currently. Here might help: http://unixpapa.com/js/key.html
	var keyValueDictionary = {
		8: "backspace",
		9: "tab",
		12: "num",
		13: "enter",
		16: "shift",
		17: "ctrl",
		18: "alt",
		19: "pause",
		20: "caps",
		27: "escape",
		32: "space",
		33: "pageup",
		34: "pagedown",
		35: "end",
		36: "home",
		37: "left",
		38: "up",
		39: "right",
		40: "down",
		44: "print",
		45: "insert",
		46: "delete",
		48: "0",
		49: "1",
		50: "2",
		51: "3",
		52: "4",
		53: "5",
		54: "6",
		55: "7",
		56: "8",
		57: "9",
		65: "a",
		66: "b",
		67: "c",
		68: "d",
		69: "e",
		70: "f",
		71: "g",
		72: "h",
		73: "i",
		74: "j",
		75: "k",
		76: "l",
		77: "m",
		78: "n",
		79: "o",
		80: "p",
		81: "q",
		82: "r",
		83: "s",
		84: "t",
		85: "u",
		86: "v",
		87: "w",
		88: "x",
		89: "y",
		90: "z",
		96: "num_0",
		97: "num_1",
		98: "num_2",
		99: "num_3",
		100: "num_4",
		101: "num_5",
		102: "num_6",
		103: "num_7",
		104: "num_8",
		105: "num_9",
		106: "num_multiply",
		107: "num_add",
		108: "num_enter",
		109: "num_subtract",
		110: "num_decimal",
		111: "num_divide",
		112: "f1",
		113: "f2",
		114: "f3",
		115: "f4",
		116: "f5",
		117: "f6",
		118: "f7",
		119: "f8",
		120: "f9",
		121: "f10",
		122: "f11",
		123: "f12",
		124: "print",
		144: "num",
		145: "scroll",
		186: ";",
		187: "=",
		188: ",",
		189: "-",
		190: ".",
		191: "/",
		192: "`",
		219: "[",
		220: "\\",
		221: "]",
		222: "\'"
	};
	var secretCodeGuess = [];
	var secretCodeGuessMaxLength = 0;
	var secretCode = [];

	var keyDownGuess = function(event) {
		var charCode = (event.which) ? event.which : event.keyCode;
		var guessKey = (keyValueDictionary[charCode]) ? keyValueDictionary[charCode] : 'unidentified';
		var i = 0;
		var secretCodeGuessStr = '';
		var matchFoundIndexPosition = '';

		secretCodeGuess.push(guessKey);

		// Have any codes been input?
		secretCodeGuessStr = secretCodeGuess.join(' ');
		for(i = 0; i < secretCode.length; i++) {
			matchFoundIndexPosition = secretCodeGuessStr.length - secretCode[i].code.length;
			if(secretCodeGuessStr.lastIndexOf(secretCode[i].code) === matchFoundIndexPosition && matchFoundIndexPosition >= 0) {
				secretCode[i].callback();
			}
		}

		// Keep the guess array as small as possible
		if(secretCodeGuess.length >= secretCodeGuessMaxLength) {
			secretCodeGuess.splice(0, 1);
		}
	};

	var domReady = function(ready) {
		if(/in/.test(document.readyState)) {
			return setTimeout(function() { return domReady(ready); }, 9);
		}
		return ready();
	};

	var init = function() {
		var el = document;
		if(el.addEventListener) {
			el.addEventListener('keydown', keyDownGuess, false);
		} else if(el.attachEvent) {
			el.attachEvent('onkeydown', keyDownGuess);
		}
	};
	domReady(init);

	return {
		addSecretCode: function(codeToSet, callbackWhenPasswordInputted) {
			var codeArr = {code: codeToSet, callback: callbackWhenPasswordInputted};
			secretCode.push(codeArr);

			secretCodeGuessMaxLength = secretCode.reduce(function(a, b) { return a.code.split(' ').length > b.code.split(' ').length ? a : b; }).code.split(' ').length;
		},
		getCurrentGuess: function() {
			return secretCodeGuess.join(' ');
		}
	};
})();