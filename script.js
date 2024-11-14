let correctFile = '';
let currentPhrase = '';
let currentSource = '';
let aciertos = 0;
let errores = 0;
let puntuacion = 0;
let isButtonDisabled = false;

let isInfiniteMode = true;
let phrasesCount = 0;
let vidasNormal = 10;
let vidaInfinito = 5;
let vidas = 0;


// Cargar los sonidos
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');
const resetSound = new Audio('sounds/reset.mp3');
const clickSound = new Audio('sounds/click.mp3');


function loadFrase() {
    const archivos = ['quotes/Shakespeare', 'quotes/Taylor Swift'];
    correctFile = archivos[Math.floor(Math.random() * archivos.length)];

    fetch(correctFile)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            const randomIndex = Math.floor(Math.random() * lines.length);
            const [phrase, source] = lines[randomIndex].split(' – ');
            currentPhrase = phrase.trim();
            currentSource = source ? source.trim() : '';
            document.getElementById('fileContent').innerHTML = currentPhrase;
            document.getElementById('source').style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading file:', error);
        });
}

function checkAnswer(selectedAuthor) {
    let modeText = document.getElementById("mode").innerText;

    if (isButtonDisabled) return;

    isButtonDisabled = true;
    document.getElementById('shakespeareBtn').disabled = true;
    document.getElementById('taylorBtn').disabled = true;

    const result = document.getElementById('result');
    const actualAuthor = correctFile.includes('Shakespeare') ? 'Shakespeare' : 'Taylor Swift';

    if (selectedAuthor === "Skip") {
        puntuacion += 0;
        correctSound.play();
        result.style.color = "#333";

        result.innerHTML = `The quote is from ${actualAuthor}. (0)`;

        updateScoreboard();
        document.getElementById('source').innerHTML = `Source: ${currentSource}`;
        document.getElementById('source').style.display = 'block';

        if (modeText === "Normal Mode") {
            vidas -= 1;
            document.getElementById("vidas").innerText = `Guesses: ${vidas}`;

        }

        if (modeText === "Infinite Mode") {
            vidas -= 1;
            document.getElementById("vidas").innerText = `Lives: ${vidas}`;
            if (vidas === 0) {
                updateScoreboard();
                endGame();
                return;  // Si se acaban las vidas, termina el juego
            }
        }

        phrasesCount++;
        if (isInfiniteMode || phrasesCount < 10) {
            setTimeout(() => {
                resetAnswer();
                loadFrase();
                enableButtons();
            }, 2000);
        } else {
            endGame();
        }
        return;   //Termina la función antes de continuar
    }

    if (selectedAuthor === actualAuthor) {
        result.innerHTML = `Correct! The quote is from ${actualAuthor}. (+1)`;
        result.style.color = "#008f39";
        aciertos++;
        puntuacion += 1;
        correctSound.play();

    } else {
        result.innerHTML = `Wrong! The quote is from ${actualAuthor}. (-1)`;
        result.style.color = "#940b0b";
        errores++;
        puntuacion -= 1;
        wrongSound.play();

        // Restar una vida si es el modo infinito
        if (isInfiniteMode) {
            vidas--;
            if (vidas === 0) {
                updateScoreboard();
                endGame();
                return;  // Si se acaban las vidas, termina el juego
            }
        }

    }
    if (modeText === "Normal Mode") {
        vidas -= 1;
        document.getElementById("vidas").innerText = `Guesses: ${vidas}`;

    }
    updateScoreboard();
    document.getElementById('source').innerHTML = `Source: ${currentSource}`;
    document.getElementById('source').style.display = 'block';

    phrasesCount++;
    if (isInfiniteMode || phrasesCount < 10) {
        setTimeout(() => {
            resetAnswer();
            loadFrase();
            enableButtons();
        }, 2000);
    } else {
        endGame();
    }
}

function resetAnswer() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('source').style.display = 'none';
}

function updateScoreboard() {
    document.getElementById('aciertos').innerText = aciertos;
    document.getElementById('errores').innerText = errores;
    document.getElementById('puntuacion').innerText = puntuacion;
    let modeText = document.getElementById("mode").innerText;
    if (modeText === "Infinite Mode") {
        document.getElementById("vidas").innerText = `Lives: ${vidas}`;
    } else {
        document.getElementById("vidas").innerText = `Guesses: ${vidas}`;
    }
}

function resetGame() {
    aciertos = 0;
    errores = 0;
    puntuacion = 0;
    phrasesCount =0;
    updateScoreboard();
    let modeText = document.getElementById("mode").innerText;
    if (modeText === "Infinite Mode") {
        vidas = vidaInfinito;
        document.getElementById("vidas").innerText = `Lives: ${vidas}`;
    } else {
        vidas = vidasNormal;
        document.getElementById("vidas").innerText = `Guesses: ${vidas}`;

    }

    document.getElementById('result').innerHTML = '';
    document.getElementById('source').style.display = 'none';
    clickSound.play();

    setTimeout(() => {
        enableButtons();
        loadFrase();
    }, 250);
}

function enableButtons() {
    document.getElementById('shakespeareBtn').disabled = false;
    document.getElementById('taylorBtn').disabled = false;
    isButtonDisabled = false;
}

function endGame() {
    document.getElementById("result").innerText = `Game Over! Final Score: ${puntuacion}`;
}

function startGameInfinite() {
    clickSound.play();
    isInfiniteMode = true;
    vidas = vidaInfinito;
    document.getElementById("mode").innerText = "Infinite Mode";
    document.getElementById("vidas").innerText = `Lives: ${vidas}`;
    document.getElementById("help").innerText = 
    `If you choose the correct answer, you will gain 1 point.
    If you choose incorrectly, you will lose 1 point and 1 live.
    If you skip, you will loose 1 live.
    The game ends when you lose all your lives.`
    startGame();
}

function startGameNormal() {
    clickSound.play();
    isInfiniteMode = false;
    phrasesCount = 0;
    vidas = vidasNormal;
    document.getElementById("mode").innerText = "Normal Mode";
    document.getElementById("vidas").innerText = `Guesses: ${vidas}`;
    document.getElementById("help").innerText =
    `If you choose the correct answer, you will gain 1 point.
    If you choose incorrectly, you will lose 1 point.
    If you skip, you neither gain nor lose points.
    The game ends after 10 guesses.`
    startGame();
}

function startGame() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    loadFrase();
}

function backToStart() {
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("game-container").style.display = "none";
    resetGame();
}