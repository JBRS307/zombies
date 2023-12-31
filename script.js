const aim = document.getElementById('aim');
const counter = document.getElementById('points-counter');
const arena = document.querySelector('.arena');
const gameOver = document.getElementById('gameover');
const restart = gameOver.querySelector('button');
const board = document.getElementById('board');
const menu = document.getElementById('menu');
const startButton = menu.querySelector('button');


let points;
let pointsStr = '';
let lives;



const randInt = () => {
    return Math.floor(Math.random()*1000000000);
}

// funkcja odpala się raz na załadowanie strony
// wyłącza możliwość przeciągania serc oraz celownika
// ustawia listner na celowniku, żeby podążał za myszką
const initPage = () => {
    startButton.addEventListener('click', startFromMenu);
    document.addEventListener('mousemove', aimMovement);
    const hearts = board.querySelectorAll('.heart');
    hearts.forEach((heart) => {
        heart.setAttribute('draggable', false);
    });
    aim.style.top = '50vh';
    aim.style.left = '50vw';
    aim.setAttribute('draggable', false);
}

// funkcja wczytuje się na początku każdej rundy
// resetuje życia, punktację, listener na strzelanie
const initGame = () => {
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart) => {
        if(heart.classList.contains('empty')) {
            heart.style.display = 'none';
        } else {
            heart.style.display = '';
        }
    });
    points = 30;
    lives = 3;
    counter.innerText = '00' + points;
    gameOver.style.display = 'none';
    gameOver.style.animationPlayState = 'paused';
    board.addEventListener('click', throttleShooting);
}

// listener na celownik
const aimMovement = (e) => {
    aim.style.top = e.clientY+'px';
    aim.style.left = e.clientX+'px';
}

// generalna funkcja do cooldownu broni
const throttle = (func, delay) => {
    let timerFlag = null;
    
    return (...args) => {
        if (timerFlag === null) {
            func(...args);
            timerFlag = setTimeout(() => {
                timerFlag = null;
            }, delay);
        }
    }
}

// funkcja obsługująca strzelanie, listener ustawiony na planszy 'board'
// przyznaje punkty jeśli targetem jest zombie, jeśli nie, zabiera
const shot = (e) => {
    if (points < 0) {
        return;
    }

    if (e.target.classList.contains('zombie')) {
        // console.log('boom');
        e.target.remove();
        points += 10;
        pointsStr = points + '';
    } else {
        points -= 3;
        pointsStr = points + '';
    }

    if (points < 0) {
        counter.innerText = points + '';
    } else if (pointsStr.length < 4) {
        pointsStr = '0'.repeat(4 - pointsStr.length) + pointsStr;
        counter.innerText = pointsStr;
    } else {
        counter.innerText = pointsStr;
    }
}

// cooldown na strzelanie
const throttleShooting = throttle(shot, 500);

// obsługa utraty żyć jeśli zombie dojdzie na koniec mapy
const heartLoss = (e) => {
    lives -= 1;
    e.target.remove();
    let heart;
    let emptyHeart;
    switch (lives) {
        case 2:
            heart = document.getElementById('right-full');
            emptyHeart = document.getElementById('right-empty');
            heart.style.display = 'none';
            emptyHeart.style.display = '';
            break;
        case 1:
            heart = document.getElementById('mid-full');
            emptyHeart = document.getElementById('mid-empty');
            heart.style.display = 'none';
            emptyHeart.style.display = '';
            break;
        case 0:
            heart = document.getElementById('left-full');
            emptyHeart = document.getElementById('left-empty');
            heart.style.display = 'none';
            emptyHeart.style.display = '';
            board.removeEventListener('click', throttleShooting);
            removeHeartLoss();
    }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// funckaj jest wywołana dwa razy, żeby uniknąć sytuacji,
// w której zombie pojawia się po końcu żyć
// wywala listenera na stratę żyć, żeby nie robił się śmietnik, bo
// switch nie ma default case'a
const removeHeartLoss = () => {
    const enemies = arena.querySelectorAll('.zombie');
    enemies.forEach((zombie) => {
        zombie.removeEventListener('animationend', heartLoss);
    });
}

// zombie nie zostają usunięte kiedy przegramy, wyłączany jest jedynie spawn
// funkcja wywoływana jest w startGame()
const removeAllEnemies = () => {
    const enemies = arena.querySelectorAll('.zombie');
    enemies.forEach((zombie) => {
        zombie.remove();
    });
}

// game over, wyświetla ekran game over
const finishGame = () => {
    restart.addEventListener('click', restartGame);
    gameOver.style.display = 'flex';
    gameOver.style.animationPlayState = 'running';
}


// funkcja randomizująca rozmiar zombie
const randomizeScale = (zombie) => {
    const ratio = 200/312; // szerokość/wysokość
    const width = randInt()%131 + 70;
    const height = width/ratio;
    zombie.style.width = width + 'px';
    zombie.style.height = height + 'px';
}

// funkcja randomizująca szybkość poruszania zombie
const randomizeSpeed = (zombie, difficulty) => {
    const walkTime = randInt()%(12001 - difficulty.speed) + 3000;
    zombie.style.animationDuration = '1s, ' + walkTime + 'ms'; 
}


// funkcja randomizująca pozycję zombie na osi pionowej
const randomizeVert = (zombie) => {
    const position = randInt()%101;
    zombie.style.top = position + '%';
    zombie.style.zIndex = 1+position+''; // dzięki temu zombie nie będą na siebie dziwnie nachodzić
}

// funkcja tworząca zombie i wrzucająca go na arenę
const createZombie = (difficulty) => {
    const zombie = document.createElement('div');
    zombie.classList.add('zombie');
    randomizeScale(zombie);
    randomizeSpeed(zombie, difficulty);
    randomizeVert(zombie);
    zombie.addEventListener('animationend', heartLoss);
    // zombie.addEventListener('animationend', zombieTester); // używane w celu testowania poziomu trudności
    arena.appendChild(zombie);
}

// funkcja generująca zombie w losowych odstępach czasu
const generateEnemy = async (difficulty) => {
    let sleepDuration;
    while (lives > 0) {
        sleepDuration = randInt()%(1501 - difficulty.freqUpper) + (1000 - difficulty.freqLower);
        await sleep(sleepDuration);
        createZombie(difficulty);
    }
    removeHeartLoss();
    finishGame();
}

// wywala zombie, żeby nie stackowało się milion divów, kiedy wyłączona jest
// utrata żyć do testów
// const zombieTester = (e) => {
//     e.target.remove();
// }

// restart gry
const restartGame = (e) => {
    e.stopPropagation();
    restart.removeEventListener('click', restartGame);
    startGame();
}

// pierwszy start gry
const startFromMenu = (e) => {
    e.stopPropagation();
    menu.style.display = 'none';
    startButton.removeEventListener('click', startFromMenu);
    startGame();
}

// początek rundy
const startGame = () => {
    const difficulty = {
        freqLower: 0,
        freqUpper: 0,
        speed: 0,
        changeSpeed: async function() {
            while (lives > 0 && this.speed < 11000) {
                await sleep(30000);
                this.speed += 2250;
                // console.log(this.speed);
            }
        },
        changeFreq: async function() {
            while (lives > 0 && this.freqLower < 600) {
                await sleep(30000);
                this.freqLower += 120;
                this.freqUpper += 200;
                // console.log(this.freqLower);
            }
        }
    };

    removeAllEnemies();
    initGame();
    difficulty.changeFreq();
    difficulty.changeSpeed();
    generateEnemy(difficulty);
}

initPage();
