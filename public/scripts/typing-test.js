import { getRandomFunction } from "./generator.js";
import { showCompletionPage, hideCompletionPage } from "./main.js"
import { applyTheme } from "./theme.js"

// Contents
const displayArea = document.getElementById('display');
const timeDisplay = document.getElementById('time');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const restartButton = document.getElementById('restart');

// Default game settings
let currentGamemode = "algorithms";
let currentLanguage = "python";
let currentNumOfWords = 25;
let currentTimeAmount = 60;
let currentTheme = "tokyonight dark";
let currentText = "Loading...";

// General
let wpm = 0;
let wpmOverTime = [];
let accuracy = 100
let timer = 0;
let interval;
let words = currentText.split(' ');
let wordsClean = currentText.split(' ');
let currentWordIndex = 0;
let typedText = '';
let totalCharacterCount = 0;
let totalCorrectCharacterCount = 0;

// Apply default theme
applyTheme(currentTheme);

function updateDisplayArea() {
    displayArea.innerHTML = '';
    words.forEach((word, wordIndex) => {
        let wordSpan = document.createElement('span');
        let characters = word.split('');
		let wasEnter = false;
        characters.forEach((char, charIndex) => {
			let wasTab = false;
            if (char === '↵') {
                char = '';  // Later add a /n after checking for extra characters
				wasEnter = true;
            } else if (char === '→') {
				wasTab = true;
				if (words[wordIndex][charIndex-1] === '→') {
					char = '    ';  // Representing tabs visually (2nd+ tab)
				} else {
					char = '   ';  // Representing tabs visually (1st tab)
				}
            }

            let charSpan = document.createElement('span');
            charSpan.textContent = char;

            // Assign IDs based on the character state
            if (wordIndex < currentWordIndex || wasTab) {
                charSpan.id = 'correct';  // Correctly typed in previous words
            } else if (wordIndex === currentWordIndex) {
                if (charIndex < typedText.length) {
                    charSpan.id = typedText[charIndex] === char ? 'correct' : 'incorrect';
                } else {
                    charSpan.id = 'neutral';  // Not yet typed
                }

				// Add a cursor
				if (charIndex === typedText.length) {
					let cursorSpan = document.createElement('span');
					cursorSpan.classList.add('cursor');
					wordSpan.appendChild(cursorSpan);
				}
            } else {
                charSpan.id = 'neutral';  // Future words
            }

            wordSpan.appendChild(charSpan);
        });

		// Add a cursor
        if (wordIndex === currentWordIndex && typedText.length === word.length) {
			let cursorSpan = document.createElement('span');
			cursorSpan.classList.add('cursor');
			wordSpan.appendChild(cursorSpan);
		}

        // Handle extra characters
        if (wordIndex === currentWordIndex && typedText.length > word.length) {
            for (let i = word.length; i < typedText.length; i++) {
                let extraCharSpan = document.createElement('span');
                extraCharSpan.textContent = typedText[i];
                extraCharSpan.id = 'incorrect-extra';  // Lighter red for extra characters
                wordSpan.appendChild(extraCharSpan);
            }

			// Add a cursor
			let cursorSpan = document.createElement('span');
			cursorSpan.classList.add('cursor');
			wordSpan.appendChild(cursorSpan);
        }

		// Account for any ↵ Enters
		// This needs to be done after adding extra characters
		if (wasEnter) {
			let charSpan = document.createElement('span');
			charSpan.id = 'neutral';
			charSpan.textContent = '\n'
			wordSpan.appendChild(charSpan)
		}

        if (wordIndex !== 0) {
            displayArea.appendChild(document.createTextNode(' '));  // Add spaces between words
        }
        displayArea.appendChild(wordSpan);
    });
}

function updateStats() {
	wpm = 0;
	if (timer !== 0) {
		wpm = (totalCorrectCharacterCount / 5) / (timer / 60);
	}
	wpm = Math.round(wpm);
	wpmOverTime.push(wpm);

	accuracy = 100
	if (totalCharacterCount !== 0) {
		accuracy = (totalCorrectCharacterCount / totalCharacterCount) * 100;
	}
	accuracy = Math.round(accuracy);


	wpmDisplay.textContent = wpm;
	accuracyDisplay.textContent = accuracy;
}

async function startTest() {
	currentText = await getRandomFunction(currentGamemode, currentLanguage, currentNumOfWords);
	currentText = currentText.replace(/\n/g, '↵\n').replace(/\t/g, '→');
	words = currentText.split(/[\n ]+/);
	wordsClean = currentText.replace(/→/g, '').split(/[\n ]+/);

	typedText = '';
	currentWordIndex = 0;
	totalCharacterCount = 0;
	totalCorrectCharacterCount = 0;
	timer = 0;
	wpmOverTime = []
	timeDisplay.textContent = timer;
	wpmDisplay.textContent = 0;
	accuracyDisplay.textContent = 100;

	document.getElementById('input').textContent = ''

	updateDisplayArea();
	// updateStats();

	document.addEventListener('keydown', handleTyping);

	interval = setInterval(function () {
		// Only start the timer if the user started typing
		if (totalCharacterCount !== 0) {
			timer++;
			timeDisplay.textContent = timer;

			// Stop the timer when the user reaches the end of the text
			if (currentWordIndex >= words.length - 1 && typedText === wordsClean[currentWordIndex]) {
				clearInterval(interval);
				document.removeEventListener('keydown', handleTyping);

				// Show the completion screen
				showCompletionPage(wpm, accuracy, timer, wpmOverTime);
			}

			updateStats();
		}
    }, 1000);
}

function handleTyping(event) {
	let key = event.key;
	const currentWord = wordsClean[currentWordIndex];
	let preventDefault = false;

	// Disable firefox quick search
	if (key === "'" || key === '/') {
		event.preventDefault();
	}

	if (key === 'Backspace' && typedText.length > 0) { // Add backspace functionality
		typedText = typedText.slice(0, -1);
	} else if (typedText.length < currentWord.length + 10) { // Limit extra characters to 10
		if (key === 'Enter') { // Enter key pressed!
			key = '↵';
			typedText += key;
			if (typedText.trim() !== currentWord) {
				preventDefault = true;
			}
		} else if (key.length === 1) { // Add the typed character to the typed text
			typedText += key;
			if (key === ' ' && typedText.trim() !== currentWord) { // If the word is typed wrong, don't move to next word
				preventDefault = true;
			}
		}

		// Disable space key while requiring an enter key (edge case causes problems)
		const currentWordWithEnters = (words[currentWordIndex]).replace(/\t/g, '→')
		if (typedText.length === currentWordWithEnters.length 
			&& currentWordWithEnters[currentWordWithEnters.length - 1] === '↵' 
			&& key === ' ') {
			preventDefault = true;
			typedText = typedText.slice(0, -1); // Delete pressed space
		}

	} 

	// Disable deletion of tabbed spaces (edge case causes problems)
	const tabCount = words[currentWordIndex].split('→').length - 1
	if (key === 'Backspace' && tabCount > 0 && typedText.length + 1 == tabCount) {
		preventDefault = true;
		typedText += ' ' // Add back deleted tab
	}

	// Move to the next word only if the current word is correctly typed followed by a space
	if (typedText.trim() === currentWord && key === ' ') {
		currentWordIndex++;
		typedText = '';
	}
	if (typedText.trim() === currentWord && key === '↵') {
		currentWordIndex++;
		typedText = ' '.repeat(words[currentWordIndex].split('→').length - 1);
	}

	if (preventDefault) {
		event.preventDefault();
	}

	// Update the display
	updateDisplayArea();

	// Add to allTypedCharacters for accuracy calculation, including spaces as incorrect
	if (key !== 'Backspace' && key !== 'Control' && key !== 'Enter' && key != 'Shift' && key != ' ') {
		totalCharacterCount += 1;

		// If the current character is correct, increment
		if (currentWord.length >= typedText.length && currentWord[typedText.length - 1] === key) {
			totalCorrectCharacterCount += 1;
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
    restartButton.addEventListener('click', function () {
        clearInterval(interval);
        document.removeEventListener('keydown', handleTyping);
        startTest();
    });

	// Always focus onto the input box
	document.addEventListener('keydown', function(event) {
		// Quick restarts with TAB
		if (event.key === 'Tab') {
			event.preventDefault();
			clearInterval(interval);
			document.removeEventListener('keydown', handleTyping);
			hideCompletionPage();
			startTest();
		}

		// Add INSTANT COMPLETE for testing 
		if (event.key === 'Escape') {
			event.preventDefault();
			clearInterval(interval)
			document.removeEventListener('keydown', handleTyping);

			// Create fake data
			wpm = 120
			accuracy = 100
			timer = 60
			wpmOverTime = [110, 120, 124, 128, 124, 127, 114, 131]
			showCompletionPage(wpm, accuracy, timer, wpmOverTime)
		}

		// Focus onto the input box
		if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
			const inputArea = document.getElementById('input');
			inputArea.focus();
		}
	});

    startTest();
});

