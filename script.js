const aim = document.getElementById('aim');
const board = document.getElementById('board');
const body = document.querySelector('body');
const counter = document.getElementById('points-counter');
const arena = document.querySelector('.arena');

const zombie = document.querySelector('.zombie');
let points;
let pointsStr = '';
let lives;

const init = () => {
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach((heart) => {
        heart.setAttribute('draggable', false);
        if(heart.classList.contains('empty')) {
            heart.style.display = 'none';
        }
        aim.style.top = '50vh';
        aim.style.left = '50vw';
        aim.setAttribute('draggable', false);
        points = 30;
        lives = 3;
        counter.innerText = '00' + points;
    });

}

document.addEventListener('mousemove', (e) => {
    aim.style.top = e.clientY+'px';
    aim.style.left = e.clientX+'px';
});

board.addEventListener('click', (e) => {
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
});

const heartLoss = () => {
    lives -= 1;
    
    let heart;
    let emptyHeart;
    switch (lives) {
        case 2:
            heart = board.querySelector('#right-full');
            emptyHeart = board.querySelector('#right-empty');
            break;
        case 1:
            heart = board.querySelector('#mid-full');
            emptyHeart = board.querySelector('#mid-empty');
            break;
        case 0:
            return;
    }

    heart.style.display = 'none';
    emptyHeart.style.display = '';
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const generateEnemy = async () => {
    let sleepDuration;
    while (lives > 0) {
        sleepDuration = Math.floor(Math.random()*2000+500);
        await sleep(sleepDuration);
        const zombie = document.createElement('div');
        zombie.classList.add('zombie');
        zombie.addEventListener('animationend', heartLoss);
        arena.appendChild(zombie);

    }
}

const game = () => {
    init();
    generateEnemy();
}

game();