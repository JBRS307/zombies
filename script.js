const aim = document.getElementById('aim');
const body = document.querySelector('body');
const counter = document.getElementById('points-counter');
const arena = document.querySelector('.arena');
const gameOver = document.getElementById('gameover');
const board = document.getElementById('board');
const restart = document.getElementById('restart');

// const zombie = document.querySelector('.zombie');
let points;
let pointsStr = '';
let lives;


const randInt = () => {
    return Math.floor(Math.random()*1000000000);
}

const init = () => {
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart) => {
        heart.setAttribute('draggable', false);
        if(heart.classList.contains('empty')) {
            heart.style.display = 'none';
        } else {
            heart.style.display = '';
        }
    });
    aim.style.top = '50vh';
    aim.style.left = '50vw';
    aim.setAttribute('draggable', false);
    points = 30;
    lives = 3;
    counter.innerText = '00' + points;
    gameOver.style.display = 'none';
    gameOver.style.animationPlayState = 'paused';
}

const aimMovement = (e) => {
    aim.style.top = e.clientY+'px';
    aim.style.left = e.clientX+'px';
}

const shot = (e) => {
    if (points < 0 || lives <= 0) {
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
            removeAllEnemies();
    }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// funckaj jest wywołana dwa razy, żeby uniknąć sytuacji,
// w której zombie pojawia się po końcu żyć
const removeAllEnemies = () => {
    const enemies = arena.querySelectorAll('.zombie');
    enemies.forEach((zombie) => {
        zombie.remove();
    });
}

const finishGame = () => {
    // const main = document.getElementById('board');
    // board.style.backgroundImage = 'none';
    // board.style.backgroundColor = 'black';
    gameOver.style.display = 'flex';
    gameOver.style.animationPlayState = 'running';
}

const generateEnemy = async () => {
    let sleepDuration;
    while (lives > 0) {
        sleepDuration = randInt()%1500+500;
        await sleep(sleepDuration);
        const zombie = document.createElement('div');
        zombie.classList.add('zombie');
        zombie.addEventListener('animationend', heartLoss);
        arena.appendChild(zombie);
    }
    removeAllEnemies();
    finishGame();
}

const startGame = () => {
    init();
    generateEnemy();
}

startGame();

document.addEventListener('mousemove', (e) => aimMovement(e));
board.addEventListener('click', (e) => shot(e));
restart.addEventListener('click', () => startGame());
