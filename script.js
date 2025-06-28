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

// URLs de las APIs
const SHAKESPEARE_API = "https://shakespeare-quotes-api.onrender.com/quotes/random";
const TAYLOR_SWIFT_API = "https://taylor-swift-api.vercel.app/api/quotes?album=1989";

async function loadFrase() {
    // Elegir aleatoriamente entre Shakespeare y Taylor Swift
    const isShakespeare = Math.random() < 0.5;

    try {
        if (isShakespeare) {
            correctFile = 'Shakespeare';
            const response = await fetch(SHAKESPEARE_API);
            const data = await response.json();
            currentPhrase = data.quote;
            currentSource = data.play || 'Unknown work';
        } else {
            correctFile = 'Taylor Swift';
            const response = await fetch(TAYLOR_SWIFT_API);
            const data = await response.json();

            // Verificar si la cita contiene '/' y buscar otra si es necesario
            if (data.quote.includes('/')) {
                loadFrase();
                return;
            }

            currentPhrase = data.quote;
            currentSource = '1989 (Taylor\'s Version)';
        }

        document.getElementById('fileContent').innerHTML = currentPhrase;
        document.getElementById('source').style.display = 'none';
    } catch (error) {
        console.error('Error loading quote:', error);
        document.getElementById('fileContent').innerHTML = "Error loading quote. Trying again...";
        setTimeout(loadFrase, 1000);
    }
}

function checkAnswer(selectedAuthor) {
    let modeText = document.getElementById("mode").innerText;

    if (isButtonDisabled) return;

    isButtonDisabled = true;
    document.getElementById('shakespeareBtn').disabled = true;
    document.getElementById('taylorBtn').disabled = true;
    document.getElementById('skipBtn').disabled = true;

    const result = document.getElementById('result');
    const actualAuthor = correctFile;

    if (selectedAuthor === "Skip") {
        puntuacion += 0;
        correctSound.play();
        result.style.color = "var(--text-dark)";

        result.innerHTML = `The quote is from <strong>${actualAuthor}</strong>. <span style="color: var(--text-light)">(0)</span>`;

        updateScoreboard();
        document.getElementById('source').innerHTML = `<i class="fas fa-book"></i> Source: ${currentSource}`;
        document.getElementById('source').style.display = 'block';

        if (modeText === "Normal Mode") {
            vidas -= 1;
            document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
        }

        if (modeText === "Infinite Mode") {
            vidas -= 1;
            document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
            if (vidas === 0) {
                updateScoreboard();
                endGame();
                return;
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
        return;
    }

    if (selectedAuthor === actualAuthor) {
        result.innerHTML = `<span style="color: var(--correct-green);"><i class="fas fa-check-circle"></i> Correct!</span> The quote is from <strong>${actualAuthor}</strong>. <span style="color: var(--correct-green)">(+1)</span>`;
        aciertos++;
        puntuacion += 1;
        correctSound.play();
    } else {
        result.innerHTML = `<span style="color: var(--wrong-red);"><i class="fas fa-times-circle"></i> Wrong!</span> The quote is from <strong>${actualAuthor}</strong>. <span style="color: var(--wrong-red)">(-1)</span>`;
        errores++;
        puntuacion -= 1;
        wrongSound.play();

        if (isInfiniteMode) {
            vidas--;
            if (vidas === 0) {
                updateScoreboard();
                endGame();
                return;
            }
        }
    }

    if (modeText === "Normal Mode") {
        vidas -= 1;
        document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
    }

    updateScoreboard();
    document.getElementById('source').innerHTML = `<i class="fas fa-book"></i> Source: ${currentSource}`;
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
        document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
    } else {
        document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
    }
}

function resetGame() {
    aciertos = 0;
    errores = 0;
    puntuacion = 0;
    phrasesCount = 0;
    updateScoreboard();
    let modeText = document.getElementById("mode").innerText;
    if (modeText === "Infinite Mode") {
        vidas = vidaInfinito;
        document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
    } else {
        vidas = vidasNormal;
        document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
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
    document.getElementById('skipBtn').disabled = false;
    isButtonDisabled = false;
}

function endGame() {
    const result = document.getElementById("result");
    if (puntuacion > 0) {
        result.innerHTML = `<span style="color: var(--correct-green);"><i class="fas fa-trophy"></i> Game Over! Final Score: ${puntuacion}</span>`;
    } else if (puntuacion < 0) {
        result.innerHTML = `<span style="color: var(--wrong-red);"><i class="fas fa-sad-tear"></i> Game Over! Final Score: ${puntuacion}</span>`;
    } else {
        result.innerHTML = `<span style="color: var(--text-dark);"><i class="fas fa-meh"></i> Game Over! Final Score: ${puntuacion}</span>`;
    }
    document.getElementById('shakespeareBtn').disabled = true;
    document.getElementById('taylorBtn').disabled = true;
    document.getElementById('skipBtn').disabled = true;
}

function startGameInfinite() {
    clickSound.play();
    isInfiniteMode = true;
    vidas = vidaInfinito;
    document.getElementById("mode").innerText = "Infinite Mode";
    document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
    document.getElementById("help").innerHTML =
        `<strong>Infinite Mode Rules:</strong><br><br>
                <i class="fas fa-check-circle" style="color: var(--correct-green);"></i> Correct guess: +1 point<br>
                <i class="fas fa-times-circle" style="color: var(--wrong-red);"></i> Wrong guess: -1 point & lose 1 life<br>
                <i class="fas fa-forward" style="color: #6c757d;"></i> Skip: lose 1 life<br>
                <i class="fas fa-heart" style="color: var(--wrong-red);"></i> Game ends when you lose all 5 lives`;
    startGame();
}

function startGameNormal() {
    clickSound.play();
    isInfiniteMode = false;
    phrasesCount = 0;
    vidas = vidasNormal;
    document.getElementById("mode").innerText = "Normal Mode";
    document.getElementById("vidas").innerHTML = `<i class="fas fa-heart" style="color: var(--wrong-red);"></i> ${vidas}`;
    document.getElementById("help").innerHTML =
        `<strong>Normal Mode Rules:</strong><br><br>
                <i class="fas fa-check-circle" style="color: var(--correct-green);"></i> Correct guess: +1 point<br>
                <i class="fas fa-times-circle" style="color: var(--wrong-red);"></i> Wrong guess: -1 point<br>
                <i class="fas fa-forward" style="color: #6c757d;"></i> Skip: no points gained or lost<br>
                <i class="fas fa-heart" style="color: var(--wrong-red);"></i> 10 guesses total`;
    startGame();
}

function startGame() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    resetGame();
}

function backToStart() {
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("game-container").style.display = "none";
    resetGame();
}
