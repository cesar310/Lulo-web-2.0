document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const startButton = document.getElementById('startGame');
    const playerHand = document.querySelector('.player-hand');
    const tableCard = document.querySelector('.table-card');
    const playedCardsArea = document.getElementById('playedCardsArea');
    const gameStatus = document.getElementById('gameStatus');
    const turnInfo = document.getElementById('turnInfo');
    const opponents = document.querySelectorAll('.opponent');
    const gameContainer = document.querySelector('.game-container');
    const swapSevenContainer = document.getElementById('swapSevenContainer');

    // Navegación móvil
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        burger.classList.toggle('toggle');
    });

    // Cartas decorativas en la sección de inicio
    const cardDisplay = document.querySelector('.card-display');
    const palos = ['oros', 'copas', 'bastos', 'espadas'];
    const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // PUNTOS de las cartas según las reglas
    const CARD_POINTS = {
        1: 11,   // As = 11 puntos
        3: 10,   // Tres = 10 puntos
        12: 4,   // Rey = 4 puntos
        11: 3,   // Caballo = 3 puntos
        10: 2,   // Sota = 2 puntos
        // El resto = 0 puntos
    };

    // JERARQUÍA para ganar manos
    // Las cartas con puntos van primero en orden de puntos: 1 > 3 > 12 > 11 > 10
    // Las cartas sin puntos van por número mayor: 9 > 8 > 7 > 6 > 5 > 4 > 2
    const CARD_HIERARCHY = {
        1: 100,   // As - el más alto (11 pts)
        3: 90,    // Tres (10 pts)
        12: 80,   // Rey (4 pts)
        11: 70,   // Caballo (3 pts)
        10: 60,   // Sota (2 pts)
        // Cartas sin puntos - ordenadas por número mayor
        9: 9,
        8: 8,
        7: 7,
        6: 6,
        5: 5,
        4: 4,
        2: 2
    };

    // Mostrar cartas decorativas en la sección de inicio
    for (let i = 0; i < 5; i++) {
        const palo = palos[Math.floor(Math.random() * palos.length)];
        const numero = numeros[Math.floor(Math.random() * numeros.length)];
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url('images/${palo}${numero}.jpg')`;
        cardDisplay.appendChild(card);
    }

    // Estado del juego
    let deck = [];
    let playerCards = [];
    let opponentCards = [[], [], []];
    let mesaCard = null;
    let mesaPalo = '';
    let currentRound = 0;
    let currentPlayerTurn = 0; // 0 = jugador, 1-3 = oponentes
    let roundCards = []; // Cartas jugadas en la ronda actual
    let roundWins = [0, 0, 0, 0]; // Manos ganadas por cada jugador (0 = jugador)
    let playerPoints = [0, 0, 0, 0]; // Puntos acumulados
    let wonCards = [[], [], [], []]; // Cartas ganadas por cada jugador
    let isFirstRoundOfGame = true;
    let leadPalo = ''; // Palo que manda (segundo palo ganador)
    let gameInProgress = false;
    let waitingForPlayer = false;
    let inSwapPhase = false; // Fase de cambio de cartas
    let cardsToSwap = []; // Índices de cartas marcadas para cambiar

    startButton.addEventListener('click', startGame);
    
    // Botones de cambio de cartas
    document.getElementById('confirmSwap').addEventListener('click', performSwap);
    document.getElementById('skipSwap').addEventListener('click', skipSwap);

    function createDeck() {
        deck = [];
        for (const palo of palos) {
            for (const numero of numeros) {
                deck.push({ palo, numero });
            }
        }
        // Barajar
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function drawCard() {
        return deck.pop();
    }

    function createCardElement(cardData, faceDown = false) {
        const card = document.createElement('div');
        card.className = 'card';
        if (faceDown) {
            card.style.backgroundImage = "url('images/card-back.png')";
        } else {
            card.style.backgroundImage = `url('images/${cardData.palo}${cardData.numero}.jpg')`;
        }
        card.dataset.palo = cardData.palo;
        card.dataset.numero = cardData.numero;
        return card;
    }

    function createMiniCard(cardData) {
        const card = document.createElement('div');
        card.className = 'mini-card';
        card.style.backgroundImage = `url('images/${cardData.palo}${cardData.numero}.jpg')`;
        card.title = getNombreCarta(cardData);
        return card;
    }

    function startGame() {
        createDeck();
        
        // Reiniciar estado
        playerCards = [];
        opponentCards = [[], [], []];
        roundWins = [0, 0, 0, 0];
        playerPoints = [0, 0, 0, 0];
        wonCards = [[], [], [], []];
        currentRound = 0;
        isFirstRoundOfGame = true;
        gameInProgress = true;
        cardsToSwap = [];
        
        // Repartir cartas
        for (let i = 0; i < 3; i++) {
            playerCards.push(drawCard());
            for (let j = 0; j < 3; j++) {
                opponentCards[j].push(drawCard());
            }
        }
        
        // Carta de la mesa
        mesaCard = drawCard();
        mesaPalo = mesaCard.palo;
        
        // Mostrar interfaz
        gameContainer.style.display = 'block';
        startButton.style.display = 'none';
        
        // Limpiar área de cartas jugadas
        if (playedCardsArea) {
            playedCardsArea.innerHTML = '';
        }
        
        // Limpiar indicadores de lulo y cartas ganadas
        ['player', 'opp1', 'opp2', 'opp3'].forEach(id => {
            document.getElementById(`${id}Lulo`).textContent = '';
            document.getElementById(`${id}WonCards`).innerHTML = '';
        });
        
        renderTableCard();
        renderOpponentHands();
        updateScores();
        
        // Iniciar fase de cambio de cartas
        startSwapPhase();
    }
    
    function startSwapPhase() {
        inSwapPhase = true;
        cardsToSwap = [];
        document.getElementById('swapPhase').style.display = 'block';
        updateGameStatus("Fase de cambio: selecciona las cartas que quieres cambiar");
        updateTurnInfo("Puedes cambiar de 0 a 3 cartas");
        renderPlayerHandForSwap();
    }
    
    function renderPlayerHandForSwap() {
        playerHand.innerHTML = '';
        playerCards.forEach((cardData, index) => {
            const card = createCardElement(cardData);
            card.dataset.index = index;
            
            if (cardsToSwap.includes(index)) {
                card.classList.add('marked-for-swap');
            }
            
            card.addEventListener('click', () => toggleCardForSwap(index));
            playerHand.appendChild(card);
        });
    }
    
    function toggleCardForSwap(index) {
        if (!inSwapPhase) return;
        
        const idx = cardsToSwap.indexOf(index);
        if (idx === -1) {
            cardsToSwap.push(index);
        } else {
            cardsToSwap.splice(idx, 1);
        }
        
        renderPlayerHandForSwap();
        updateTurnInfo(`${cardsToSwap.length} carta(s) seleccionada(s) para cambiar`);
    }
    
    function performSwap() {
        if (!inSwapPhase) return;
        
        // Cambiar las cartas seleccionadas
        cardsToSwap.sort((a, b) => b - a); // Ordenar de mayor a menor para no afectar índices
        
        cardsToSwap.forEach(index => {
            playerCards[index] = drawCard();
        });
        
        // Los oponentes también cambian cartas (IA simple: cambian cartas bajas)
        opponentCards.forEach((hand, oppIndex) => {
            const cardsToChange = [];
            hand.forEach((card, idx) => {
                // Cambiar cartas con valor bajo (menos de 60 en jerarquía y no del palo de mesa)
                if (CARD_HIERARCHY[card.numero] < 60 && card.palo !== mesaPalo) {
                    if (Math.random() > 0.4) { // 60% de probabilidad de cambiar
                        cardsToChange.push(idx);
                    }
                }
            });
            
            cardsToChange.forEach(idx => {
                opponentCards[oppIndex][idx] = drawCard();
            });
        });
        
        finishSwapPhase();
    }
    
    function skipSwap() {
        if (!inSwapPhase) return;
        
        // Los oponentes también pueden cambiar aunque el jugador no lo haga
        opponentCards.forEach((hand, oppIndex) => {
            const cardsToChange = [];
            hand.forEach((card, idx) => {
                if (CARD_HIERARCHY[card.numero] < 60 && card.palo !== mesaPalo) {
                    if (Math.random() > 0.5) {
                        cardsToChange.push(idx);
                    }
                }
            });
            
            cardsToChange.forEach(idx => {
                opponentCards[oppIndex][idx] = drawCard();
            });
        });
        
        finishSwapPhase();
    }
    
    function finishSwapPhase() {
        inSwapPhase = false;
        cardsToSwap = [];
        document.getElementById('swapPhase').style.display = 'none';
        
        renderPlayerHand();
        renderOpponentHands();
        
        // Determinar quién empieza
        currentPlayerTurn = 0;
        startRound();
    }

    function renderTableCard() {
        tableCard.innerHTML = '';
        const cardEl = createCardElement(mesaCard);
        tableCard.appendChild(cardEl);
        
        // Actualizar etiqueta del palo
        const mesaLabel = document.querySelector('.mesa-label');
        const paloNames = { 'oros': 'OROS', 'copas': 'COPAS', 'espadas': 'ESPADAS', 'bastos': 'BASTOS' };
        mesaLabel.textContent = `PALO DE LA MESA: ${paloNames[mesaPalo]}`;
    }

    function renderPlayerHand() {
        playerHand.innerHTML = '';
        playerCards.forEach((cardData, index) => {
            const card = createCardElement(cardData);
            card.dataset.index = index;
            
            if (waitingForPlayer) {
                if (canPlayCard(cardData, 0)) {
                    card.addEventListener('click', () => selectCard(index));
                } else {
                    card.classList.add('disabled');
                }
            }
            
            playerHand.appendChild(card);
        });
        
        // Verificar si tiene el 7 del palo de la mesa
        checkSevenSwap();
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

    function checkSevenSwap() {
        swapSevenContainer.innerHTML = '';
        
        if (!waitingForPlayer || currentPlayerTurn !== 0) return;
        
        // Buscar si el jugador tiene el 7 del palo de la mesa
        const sevenIndex = playerCards.findIndex(c => c.numero === 7 && c.palo === mesaPalo);
        
        if (sevenIndex !== -1) {
            // Caso especial: primera ronda y el as está en la mesa, obligatorio cambiar
            if (isFirstRoundOfGame && roundCards.length === 0 && mesaCard.numero === 1) {
                const hasAce = playerCards.some(c => c.numero === 1 && c.palo === mesaPalo);
                if (!hasAce) {
                    const btn = document.createElement('button');
                    btn.className = 'swap-seven-btn';
                    btn.textContent = '🔄 Cambiar 7 por carta de mesa (As)';
                    btn.addEventListener('click', () => performSevenSwap(sevenIndex));
                    swapSevenContainer.appendChild(btn);
                }
            } else if (roundCards.length === 0 || canPlayCardOfPalo(mesaPalo)) {
                const btn = document.createElement('button');
                btn.className = 'swap-seven-btn';
                btn.textContent = `🔄 Cambiar 7 de ${mesaPalo} por carta de mesa`;
                btn.addEventListener('click', () => performSevenSwap(sevenIndex));
                swapSevenContainer.appendChild(btn);
            }
        }
    }

    function canPlayCardOfPalo(palo) {
        if (roundCards.length === 0) return true;
        return leadPalo === palo || leadPalo === mesaPalo;
    }

    function performSevenSwap(sevenIndex) {
        const seven = playerCards[sevenIndex];
        const oldMesaCard = { ...mesaCard };
        
        // Intercambiar
        mesaCard = seven;
        playerCards[sevenIndex] = oldMesaCard;
        
        // Actualizar visualización
        renderTableCard();
        renderPlayerHand();
        
        updateGameStatus(`¡Cambiaste el 7 por ${getNombreCarta(oldMesaCard)}!`);
    }

    function getNombreCarta(card) {
        const nombres = {
            1: 'As', 2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco',
            6: 'Seis', 7: 'Siete', 8: 'Ocho', 9: 'Nueve', 10: 'Sota',
            11: 'Caballo', 12: 'Rey'
        };
        const palosNombres = { 'oros': 'Oros', 'copas': 'Copas', 'espadas': 'Espadas', 'bastos': 'Bastos' };
        return `${nombres[card.numero]} de ${palosNombres[card.palo]}`;
    }

    function getCardPoints(card) {
        return CARD_POINTS[card.numero] || 0;
    }

    function startRound() {
        currentRound++;
        roundCards = [];
        leadPalo = '';
        playedCardsArea.innerHTML = '';
        
        if (currentPlayerTurn === 0) {
            waitingForPlayer = true;
            renderPlayerHand();
            updateTurnInfo("Tu turno - Selecciona una carta");
            
            // Verificar si es primera ronda y tiene el As del palo de la mesa
            if (isFirstRoundOfGame) {
                const hasAce = playerCards.some(c => c.numero === 1 && c.palo === mesaPalo);
                if (hasAce) {
                    updateGameStatus("¡Tienes el As del palo de la mesa! Debes jugarlo obligatoriamente.");
                } else {
                    updateGameStatus("Mano " + currentRound + " - Juega una carta");
                }
            } else {
                updateGameStatus("Mano " + currentRound + " - Juega una carta");
            }
        } else {
            playOpponentTurn();
        }
    }

    function canPlayCard(card, playerIndex) {
        const hand = playerIndex === 0 ? playerCards : opponentCards[playerIndex - 1];
        
        // Primera carta de la primera ronda: debe ser el As del palo de la mesa si lo tiene
        if (isFirstRoundOfGame && roundCards.length === 0) {
            const hasAce = hand.some(c => c.numero === 1 && c.palo === mesaPalo);
            if (hasAce) {
                return card.numero === 1 && card.palo === mesaPalo;
            }
        }
        
        // Primera carta de la ronda (no primera del juego): cualquier carta
        if (roundCards.length === 0) {
            return true;
        }
        
        // Siguientes cartas: seguir el palo que manda o el palo de la mesa
        const hasLeadPalo = hand.some(c => c.palo === leadPalo);
        const hasMesaPalo = hand.some(c => c.palo === mesaPalo);
        
        if (hasLeadPalo) {
            return card.palo === leadPalo;
        } else if (hasMesaPalo) {
            return card.palo === mesaPalo;
        }
        
        // Si no tiene ninguno, puede jugar cualquier carta
        return true;
    }

    function selectCard(index) {
        if (!waitingForPlayer) return;
        
        const card = playerCards[index];
        
        if (!canPlayCard(card, 0)) {
            updateGameStatus("¡No puedes jugar esa carta! Debes seguir el palo.");
            return;
        }
        
        // Marcar como seleccionada
        const cardElements = playerHand.querySelectorAll('.card');
        cardElements.forEach(el => el.classList.remove('selected'));
        cardElements[index].classList.add('selected');
        
        waitingForPlayer = false;
        
        setTimeout(() => {
            playCard(0, index);
        }, 500);
    }

    function playCard(playerIndex, cardIndex) {
        let card;
        
        if (playerIndex === 0) {
            card = playerCards.splice(cardIndex, 1)[0];
            // Actualizar la mano del jugador (sin mostrar carta jugada aparte)
            renderPlayerHand();
        } else {
            card = opponentCards[playerIndex - 1].splice(cardIndex, 1)[0];
            // Actualizar mano del oponente
            const oppHand = opponents[playerIndex - 1].querySelector('.opponent-hand');
            if (oppHand.lastChild) oppHand.removeChild(oppHand.lastChild);
        }
        
        // Registrar primera carta jugada (palo que manda - segundo palo ganador)
        if (roundCards.length === 0) {
            leadPalo = card.palo;
            isFirstRoundOfGame = false;
        }
        
        roundCards.push({ card, playerIndex });
        
        // Añadir a las cartas jugadas en el centro (única visualización)
        addToPlayedCards(card, playerIndex);
        
        // Siguiente turno o evaluar ronda
        if (roundCards.length === 4) {
            setTimeout(evaluateRound, 1000);
        } else {
            currentPlayerTurn = (currentPlayerTurn + 1) % 4;
            
            if (currentPlayerTurn === 0) {
                waitingForPlayer = true;
                renderPlayerHand();
                updateTurnInfo("Tu turno");
            } else {
                updateTurnInfo(`Turno del Oponente ${currentPlayerTurn}`);
                setTimeout(playOpponentTurn, 800);
            }
        }
    }

    function addToPlayedCards(card, playerIndex) {
        const wrapper = document.createElement('div');
        wrapper.className = 'played-card-wrapper';
        
        const cardEl = createCardElement(card);
        wrapper.appendChild(cardEl);
        
        const label = document.createElement('div');
        label.className = 'played-card-label';
        label.textContent = playerIndex === 0 ? 'Tú' : `Oponente ${playerIndex}`;
        wrapper.appendChild(label);
        
        playedCardsArea.appendChild(wrapper);
    }

    function playOpponentTurn() {
        const oppIndex = currentPlayerTurn - 1;
        const hand = opponentCards[oppIndex];
        
        // Verificar regla del 7 para oponentes ANTES de jugar
        const sevenIndex = hand.findIndex(c => c.numero === 7 && c.palo === mesaPalo);
        if (sevenIndex !== -1 && roundCards.length === 0 && Math.random() > 0.5) {
            // Oponente decide cambiar el 7 (50% de probabilidad)
            const oldMesaCard = { ...mesaCard };
            mesaCard = hand[sevenIndex];
            hand[sevenIndex] = oldMesaCard;
            renderTableCard();
            updateGameStatus(`Oponente ${currentPlayerTurn} cambió el 7 por la carta de la mesa`);
        }
        
        // Encontrar cartas válidas
        let validCards = [];
        hand.forEach((card, index) => {
            if (canPlayCard(card, currentPlayerTurn)) {
                validCards.push({ card, index });
            }
        });
        
        if (validCards.length === 0) {
            validCards = hand.map((card, index) => ({ card, index }));
        }
        
        // Estrategia: jugar la carta más alta válida del palo de la mesa si es posible
        let bestCard = validCards[0];
        
        for (const vc of validCards) {
            // Priorizar cartas del palo de la mesa
            if (vc.card.palo === mesaPalo && bestCard.card.palo !== mesaPalo) {
                bestCard = vc;
            } else if (vc.card.palo === mesaPalo && bestCard.card.palo === mesaPalo) {
                // Ambas son del palo de la mesa, elegir la más alta
                if (CARD_HIERARCHY[vc.card.numero] > CARD_HIERARCHY[bestCard.card.numero]) {
                    bestCard = vc;
                }
            } else if (vc.card.palo !== mesaPalo && bestCard.card.palo !== mesaPalo) {
                // Ninguna es del palo de la mesa
                if (vc.card.palo === leadPalo && bestCard.card.palo !== leadPalo) {
                    bestCard = vc;
                } else if (vc.card.palo === bestCard.card.palo) {
                    if (CARD_HIERARCHY[vc.card.numero] > CARD_HIERARCHY[bestCard.card.numero]) {
                        bestCard = vc;
                    }
                }
            }
        }
        
        playCard(currentPlayerTurn, bestCard.index);
    }

    function getCardValue(card) {
        return CARD_HIERARCHY[card.numero] || 0;
    }

    function evaluateRound() {
        // Determinar ganador según las reglas:
        // 1. Carta más alta del palo de la mesa (SIEMPRE gana)
        // 2. Si no hay cartas del palo de la mesa, gana la más alta del palo que manda (leadPalo)
        // 3. Si no hay ninguno de los dos, gana la primera carta jugada
        
        let winner = null;
        
        // Buscar cartas del palo de la mesa
        const mesaCards = roundCards.filter(rc => rc.card.palo === mesaPalo);
        
        if (mesaCards.length > 0) {
            // Gana la más alta del palo de la mesa
            winner = mesaCards.reduce((prev, curr) => 
                getCardValue(curr.card) > getCardValue(prev.card) ? curr : prev
            );
        } else {
            // No hay cartas del palo de la mesa
            // El palo que manda (leadPalo) es el segundo palo ganador
            const leadCards = roundCards.filter(rc => rc.card.palo === leadPalo);
            if (leadCards.length > 0) {
                winner = leadCards.reduce((prev, curr) => 
                    getCardValue(curr.card) > getCardValue(prev.card) ? curr : prev
                );
            } else {
                // Fallback: primera carta (no debería pasar)
                winner = roundCards[0];
            }
        }
        
        const winningCard = winner.card;
        const winnerIndex = winner.playerIndex;
        
        // Marcar carta ganadora
        const playedWrappers = playedCardsArea.querySelectorAll('.played-card-wrapper');
        const winnerWrapperIndex = roundCards.findIndex(rc => rc === winner);
        if (playedWrappers[winnerWrapperIndex]) {
            playedWrappers[winnerWrapperIndex].querySelector('.card').classList.add('winning');
        }
        
        // Registrar victoria de mano
        roundWins[winnerIndex]++;
        
        // Calcular puntos de las cartas ganadas en esta mano
        let handPoints = 0;
        roundCards.forEach(rc => {
            const pts = getCardPoints(rc.card);
            handPoints += pts;
            // Guardar la carta en las cartas ganadas del jugador
            wonCards[winnerIndex].push(rc.card);
        });
        playerPoints[winnerIndex] += handPoints;
        
        updateScores();
        renderWonCards();
        
        const winnerName = winnerIndex === 0 ? "Tú" : `Oponente ${winnerIndex}`;
        const pointsText = handPoints > 0 ? ` (+${handPoints} puntos)` : '';
        updateGameStatus(`${winnerName} gana la mano con ${getNombreCarta(winningCard)}${pointsText}`);
        
        // Siguiente ronda o fin del juego
        if (currentRound < 3) {
            setTimeout(() => {
                // El ganador de la mano empieza la siguiente
                currentPlayerTurn = winnerIndex;
                startRound();
            }, 2000);
        } else {
            setTimeout(endGame, 2000);
        }
    }

    function updateScores() {
        document.getElementById('playerScore').textContent = playerPoints[0];
        document.getElementById('opp1Score').textContent = playerPoints[1];
        document.getElementById('opp2Score').textContent = playerPoints[2];
        document.getElementById('opp3Score').textContent = playerPoints[3];
    }

    function renderWonCards() {
        const containers = ['playerWonCards', 'opp1WonCards', 'opp2WonCards', 'opp3WonCards'];
        containers.forEach((containerId, index) => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            wonCards[index].forEach(card => {
                container.appendChild(createMiniCard(card));
            });
        });
    }

    function endGame() {
        gameInProgress = false;
        
        // Determinar quién es LULO (quien no ganó ninguna mano)
        const lulos = [];
        const names = ['Tú', 'Oponente 1', 'Oponente 2', 'Oponente 3'];
        
        roundWins.forEach((wins, index) => {
            const luloEl = document.getElementById(
                index === 0 ? 'playerLulo' : `opp${index}Lulo`
            );
            
            if (wins === 0) {
                lulos.push(names[index]);
                luloEl.textContent = '¡LULO!';
            } else {
                luloEl.textContent = '';
            }
        });
        
        // Encontrar al ganador por puntos
        const maxPoints = Math.max(...playerPoints);
        const winners = [];
        playerPoints.forEach((pts, idx) => {
            if (pts === maxPoints) winners.push(names[idx]);
        });
        
        let finalMessage = '¡Juego terminado! ';
        finalMessage += `Ganador: ${winners.join(', ')} con ${maxPoints} puntos. `;
        
        if (lulos.length > 0) {
            finalMessage += `LULOS: ${lulos.join(', ')}`;
            if (lulos.includes('Tú')) {
                finalMessage += ' - ¡Debes pagar el case!';
            }
        } else {
            finalMessage += 'Nadie quedó lulo.';
        }
        
        updateGameStatus(finalMessage);
        updateTurnInfo('');
        
        // Mostrar botón para jugar de nuevo
        startButton.style.display = 'block';
        startButton.textContent = 'Jugar de Nuevo';
    }

    function updateGameStatus(message) {
        gameStatus.textContent = message;
    }

    function updateTurnInfo(message) {
        turnInfo.textContent = message;
    }
});