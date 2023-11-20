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

// generalna funkcja do cooldownu
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
const throttleShooting = throttle(shot, 1200);

// obsługa utraty żyć jeśli zombie dojdzie na koniec mapy
const heartLoss = () => {
    lives -= 1;
    
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
const randomizeSpeed = (zombie) => {
    const walkTime = randInt()%12001 + 3000;
    zombie.style.animationDuration = '1s, ' + walkTime + 'ms'; 
}


// funkcja randomizująca pozycję zombie na osi pionowej
const randomizeVert = (zombie) => {
    const position = randInt()%101;
    zombie.style.top = position + '%';
}

// funkcja tworząca zombie i wrzucająca go na arenę
const createZombie = () => {
    const zombie = document.createElement('div');
    zombie.classList.add('zombie');
    randomizeScale(zombie);
    randomizeSpeed(zombie);
    randomizeVert(zombie);
    zombie.addEventListener('animationend', heartLoss);
    arena.appendChild(zombie);
}

// funkcja generująca zombie w losowych odstępach czasu (0.5 do 2.5 sekundy)
const generateEnemy = async () => {
    let sleepDuration;
    while (lives > 0) {
        sleepDuration = randInt()%2001+500;
        await sleep(sleepDuration);
        createZombie();
    }
    removeHeartLoss();
    finishGame();
}

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
    removeAllEnemies();
    initGame();
    generateEnemy();
}

initPage();
