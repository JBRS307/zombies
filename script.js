const aim = document.getElementById('aim');
const board = document.getElementById('board');
const body = document.querySelector('body');

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
    });

}

document.addEventListener('mousemove', (e) => {
    aim.style.top = e.clientY+'px';
    aim.style.left = e.clientX+'px';
});

document.addEventListener('click', () => {
    console.log('doc clicked');
});

aim.addEventListener('click', () => {
    console.log('aim clicked');
});

board.addEventListener('click', () => {
    console.log('board clicked');
});



init();