document.addEventListener('DOMContentLoaded', () => {
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

    // Cargar cartas en la pantalla de inicio
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

    // Simulación de juego
    const dealButton = document.getElementById('dealCards');
    const playerHands = document.querySelector('.player-hands');
    const tableCard = document.querySelector('.table-card');

    dealButton.addEventListener('click', () => {
        playerHands.innerHTML = '';
        tableCard.innerHTML = '';

        // Repartir cartas a los jugadores
        for (let i = 0; i < 4; i++) { // 4 jugadores
            const playerHand = document.createElement('div');
            playerHand.className = 'player-hand';
            for (let j = 0; j < 3; j++) { // 3 cartas por jugador
                const card = createRandomCard();
                playerHand.appendChild(card);
            }
            playerHands.appendChild(playerHand);
        }

        // Carta de la mesa
        const mesaCard = createRandomCard();
        tableCard.appendChild(mesaCard);
    });

    function createRandomCard() {
        const palo = palos[Math.floor(Math.random() * palos.length)];
        const numero = numeros[Math.floor(Math.random() * numeros.length)];
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundImage = `url('images/${palo}${numero}.jpg')`;
        card.style.backgroundSize = 'cover';
        return card;
    }
});