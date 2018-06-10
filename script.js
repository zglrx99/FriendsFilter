import {
    renderList
} from './view.js';
import Model from './model.js';
import {
    filterIt,
    saveLists,
    transferItem,
    dragAndDrop,
    init
} from './controller.js';

const leftFilter = document.querySelector('#left-filter');
const leftList = document.querySelector('#left-list');
const rightFilter = document.querySelector('#right-filter');
const rightList = document.querySelector('#right-list');
const manipulate = document.querySelector('.row');
const saver = document.querySelector('#save');

init(leftList, rightList);
leftFilter.addEventListener('keyup', () => filterIt(leftFilter.value, leftList))
rightFilter.addEventListener('keyup', () => filterIt(rightFilter.value, rightList))
manipulate.addEventListener('click', (e) => transferItem(e))
manipulate.addEventListener('mousedown', (e) => dragAndDrop(e))
saver.addEventListener('click', () => saveLists())