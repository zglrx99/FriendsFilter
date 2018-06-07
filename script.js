import {
    renderList
} from './view.js';
import Model from './model.js';
import Control from './controller.js';

const leftFilter = document.querySelector('#left-filter');
const leftList = document.querySelector('#left-list');
const rightFilter = document.querySelector('#right-filter');
const rightList = document.querySelector('#right-list');
const manipulate = document.querySelector('.row');
const saver = document.querySelector('#save');

(async () => {
    try {
        await Model.auth();
        const [me] = await Model.callAPI('users.get', {
            name_case: 'gen'
        });
        const headerInfo = document.querySelector('#header');

        headerInfo.textContent = `Друзья ${me.first_name} ${me.last_name}`;
        const friends = await Model.callAPI('friends.get', {
            fields: 'city, country, photo_100, id'
        });
        if (Model.getStorageList('left-list') !== null && Model.getStorageList('right-list') !== null) {
            Model.leftList = Model.getStorageList('left-list');
            Model.rightList = Model.getStorageList('right-list');
            renderList(Model.leftList, leftList);
            renderList(Model.rightList, rightList);
        } else {
            Model.leftList = friends;
            renderList(Model.leftList, leftList);
        }
    } catch (e) {
        console.error(e);
    }
})();

leftFilter.addEventListener('keyup', () => Control.filterIt(leftFilter.value, leftList))
rightFilter.addEventListener('keyup', () => Control.filterIt(rightFilter.value, rightList))
manipulate.addEventListener('click', (e) => Control.transferItem(e))
manipulate.addEventListener('mousedown', (e) => Control.dragAndDrop(e))
saver.addEventListener('click', () => Control.saveLists())