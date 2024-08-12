document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startGame');
    const gameArea = document.querySelector('.game-area');
    const playerHand = document.querySelector('.player-hand');
    const tableCard = document.querySelector('.table-card');
    const playedCards = document.querySelector('.played-cards');
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
    let mesaPalo = '';

    startButton.addEventListener('click', startGame);

    function startGame() {
        // gameTable.style.display = 'flex';
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
        mesaPalo = mesaCard.dataset.palo;
        tableCard.innerHTML = '';
        tableCard.appendChild(mesaCard);

        renderPlayerHand();
        renderOpponentHands();
    }

    function createRandomCard() {
        const palo = palos[Math.floor(Math.random() * palos.length)];
        const numero = numeros[Math.floor(Math.random() * numeros.length)];
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url('images/${palo}${numero}.jpg')`;
        card.dataset.palo = palo;
        card.dataset.numero = numero;
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
            const hand = opponent.querySelector('.opponent-hand');
            hand.innerHTML = '';
            opponentCards[index].forEach(() => {
                const cardBack = document.createElement('div');
                cardBack.className = 'card';
                cardBack.style.backgroundImage = "url('images/card-back.png')";
                hand.appendChild(cardBack);
            });
        });
    }

    function selectCard(event) {
        const selectedCard = event.target;
        if (isValidPlay(selectedCard)) {
            playerCards.forEach(card => card.classList.remove('selected'));
            selectedCard.classList.add('selected');

            setTimeout(() => {
                playCard(selectedCard);
            }, 1000);
        } else {
            updateGameStatus("Jugada no válida. Intenta con otra carta.");
        }
    }

    function isValidPlay(card) {
        if (roundCards.length === 0) {
            // Primera carta de la ronda
            return card.dataset.palo === mesaPalo || !playerCards.some(c => c.dataset.palo === mesaPalo);
        } else {
            // Siguientes cartas
            const firstCardPalo = roundCards[0].dataset.palo;
            return card.dataset.palo === firstCardPalo || card.dataset.palo === mesaPalo || 
                   !playerCards.some(c => c.dataset.palo === firstCardPalo || c.dataset.palo === mesaPalo);
        }
    }

    function playCard(card) {
        playerHand.removeChild(card);
        playerCards = playerCards.filter(c => c !== card);
        roundCards.push(card);

        const playerPlayed = document.querySelector('.player-played');
        playerPlayed.innerHTML = '';
        playerPlayed.appendChild(card);

        updateGameStatus("Carta jugada. Esperando a los oponentes...");

        setTimeout(playOpponentCards, 1000);
    }

    function playOpponentCards() {
        for (let i = 0; i < 3; i++) {
            const validCards = opponentCards[i].filter(card => 
                isValidPlay(card, i === 0 ? roundCards : roundCards.slice(0, -1))
            );
            const card = validCards.length > 0 ? validCards[Math.floor(Math.random() * validCards.length)] : opponentCards[i][0];
            
            roundCards.push(card);
            opponentCards[i] = opponentCards[i].filter(c => c !== card);
            
            const opponentPlayed = opponents[i].querySelector('.opponent-played');
            opponentPlayed.innerHTML = '';
            opponentPlayed.appendChild(card);

            const opponentHand = opponents[i].querySelector('.opponent-hand');
            opponentHand.removeChild(opponentHand.lastChild);
        }

        setTimeout(evaluateRound, 1000);
    }

    function evaluateRound() {
        const winningCard = roundCards.reduce((prev, current) => {
            if (current.dataset.palo === mesaPalo && prev.dataset.palo !== mesaPalo) {
                return current;
            } else if (current.dataset.palo === prev.dataset.palo) {
                return parseInt(current.dataset.numero) > parseInt(prev.dataset.numero) ? current : prev;
            } else {
                return prev;
            }
        });

        const winnerIndex = roundCards.indexOf(winningCard);
        const winner = winnerIndex === 3 ? "Jugador" : `Oponente ${winnerIndex + 1}`;

        updateGameStatus(`${winner} gana la ronda con ${winningCard.dataset.palo} ${winningCard.dataset.numero}`);

        playedCards.innerHTML = '';
        roundCards.forEach(card => playedCards.appendChild(card.cloneNode(true)));

        roundCards = [];
        currentTurn++;

        if (currentTurn < 3) {
            setTimeout(() => {
                playedCards.innerHTML = '';
                document.querySelectorAll('.opponent-played, .player-played').forEach(el => el.innerHTML = '');
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