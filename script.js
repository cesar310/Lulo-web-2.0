document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startGame');
    const gameArea = document.querySelector('.game-area');
    const playerHand = document.querySelector('.player-hand');
    const tableCard = document.querySelector('.table-card');
    const gameStatus = document.getElementById('gameStatus');
    const turnInfo = document.getElementById('turnInfo');
    const opponents = document.querySelectorAll('.opponent');
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    const cardDisplay = document.querySelector('.card-display');
    const palos = ['oros', 'copas', 'bastos', 'espadas'];
    const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    for (let i = 0; i < 5; i++) { // Mostrar 5 cartas aleatorias
        const palo = palos[Math.floor(Math.random() * palos.length)];
        const numero = numeros[Math.floor(Math.random() * numeros.length)];
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url('images/${palo}${numero}.jpg')`;
        card.style.backgroundSize = 'cover';
        cardDisplay.appendChild(card);
    }
    
    let playerCards = [];
    let opponentCards = [[], [], []];
    let currentTurn = 0;
    let roundCards = [];

    startButton.addEventListener('click', startGame);

    function startGame() {
        gameArea.style.display = 'flex';
        startButton.style.display = 'none';
        dealCards();
        updateGameStatus("Selecciona una carta para jugar.");
        updateTurnInfo("Tu turno");
    }

    function dealCards() {
        playerCards = [];
        opponentCards = [[], [], []];
        roundCards = [];

        for (let i = 0; i < 3; i++) {
            playerCards.push(createRandomCard());
            for (let j = 0; j < 3; j++) {
                opponentCards[j].push(createRandomCard());
            }
        }

        const mesaCard = createRandomCard();
        tableCard.innerHTML = '';
        tableCard.appendChild(mesaCard);

        renderPlayerHand();
        renderOpponentHands();
    }

    function createRandomCard(faceDown = false) {
        const palo = palos[Math.floor(Math.random() * palos.length)];
        const numero = numeros[Math.floor(Math.random() * numeros.length)];
        const card = document.createElement('div');
        card.className = 'card';
        if (faceDown) {
            card.style.backgroundImage = `url('images/${palo}${numero}.jpg')`;
        } else {
            card.style.backgroundImage = `url('images/${palo}${numero}.jpg')`;
            card.dataset.palo = palo;
            card.dataset.numero = numero;
        }
        card.style.backgroundSize = 'cover';
        return card;
    }

    function renderPlayerHand() {
        playerHand.innerHTML = '';
        playerCards.forEach(card => {
            card.addEventListener('click', selectCard);
            playerHand.appendChild(card);
        });
    }

    function renderOpponentHands() {
        opponents.forEach((opponent, index) => {
            opponent.innerHTML = '';
            opponentCards[index].forEach(card => {
                opponent.appendChild(card.cloneNode(true));
            });
        });
    }

    function selectCard(event) {
        const selectedCard = event.target;
        playerCards.forEach(card => card.classList.remove('selected'));
        selectedCard.classList.add('selected');

        setTimeout(() => {
            playCard(selectedCard);
        }, 1000);
    }

    function playCard(card) {
        playerHand.removeChild(card);
        playerCards = playerCards.filter(c => c !== card);
        roundCards.push(card);

        updateGameStatus("Carta jugada. Esperando a los oponentes...");

        setTimeout(playOpponentCards, 1000);
    }

    function playOpponentCards() {
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * opponentCards[i].length);
            const card = opponentCards[i][randomIndex];
            card.style.backgroundImage = `url('images/${card.dataset.palo}${card.dataset.numero}.jpg')`;
            roundCards.push(card);
            opponentCards[i].splice(randomIndex, 1);
            opponents[i].removeChild(opponents[i].lastChild);
        }

        setTimeout(evaluateRound, 1000);
    }

    function evaluateRound() {
        // Simplificado: el ganador es la carta más alta
        const winner = roundCards.reduce((prev, current) => 
            (parseInt(current.dataset.numero) > parseInt(prev.dataset.numero)) ? current : prev
        );

        updateGameStatus(`Ronda terminada. Ganador: ${winner.dataset.palo} ${winner.dataset.numero}`);

        roundCards = [];
        currentTurn++;

        if (currentTurn < 3) {
            setTimeout(() => {
                updateGameStatus("Selecciona una carta para la siguiente ronda.");
                updateTurnInfo("Tu turno");
            }, 2000);
        } else {
            setTimeout(() => {
                updateGameStatus("Juego terminado. ¡Gracias por jugar!");
                startButton.style.display = 'block';
                startButton.textContent = 'Jugar de nuevo';
            }, 2000);
        }
    }

    function updateGameStatus(message) {
        gameStatus.textContent = message;
    }

    function updateTurnInfo(message) {
        turnInfo.textContent = message;
    }
});