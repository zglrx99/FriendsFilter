import Model from './model.js';
import {
    renderList
} from './view.js';

export function filterIt(filterName, domElement) {
    let list;
    domElement.id == 'right-list' ? list = Model.rightList : list = Model.leftList;
    let filterList = {
        items: []
    };
    for (let item of list['items']) {
        if (item['first_name'].toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
            item['last_name'].toLowerCase().indexOf(filterName.toLowerCase()) !== -1) {
            filterList['items'].push(item);
        }
    }
    renderList(filterList, domElement);
}

export function saveLists() {
    console.log(JSON.stringify(Model.leftList))
    localStorage.setItem('left-list', JSON.stringify(Model.leftList));
    localStorage.setItem('right-list', JSON.stringify(Model.rightList));
}
export function transferItem(e) {
    if (e.target.nodeName === 'BUTTON' &&
        e.originalTarget.parentElement.parentElement.id === 'left-list') {
        for (let i = 0; i < Model.leftList['items'].length; i++) {
            if (Model.leftList['items'][i]['id'] == e.target.parentElement.id) {
                Model.rightList['items'].push(Model.leftList['items'][i]);
                Model.leftList['items'].splice(i, 1);
                renderList(Model.rightList, document.querySelector('#right-list'))
                renderList(Model.leftList, document.querySelector('#left-list'))
            }
        };
    } else if (e.target.nodeName === 'BUTTON' &&
        e.originalTarget.parentElement.parentElement.id === 'right-list') {
        for (let i = 0; i < Model.rightList['items'].length; i++) {
            if (Model.rightList['items'][i]['id'] == e.target.parentElement.id) {
                Model.leftList['items'].push(Model.rightList['items'][i]);
                Model.rightList['items'].splice(i, 1);
                renderList(Model.rightList, document.querySelector('#right-list'))
                renderList(Model.leftList, document.querySelector('#left-list'))
            }
        };
    }
}
export function dragAndDrop(e) {
    var friend = null;
    if (e.originalTarget.classList.contains('friend')) {
        friend = e.target;
    }
    if (e.originalTarget.parentElement.classList.contains('friend') &&
        e.target.nodeName !== 'BUTTON') {
        friend = e.originalTarget.parentElement;
    }
    if (friend !== null) {
        let mappedList;
        friend.parentElement.id === 'left-list' ? mappedList = document.querySelector('#right-list') : mappedList = document.querySelector('#left-list');
        friend.classList.add('dragElement');
        var coords = getCoords(friend);
        var shiftX = e.pageX - coords.left;
        var shiftY = e.pageY - coords.top;

        friend.style.position = 'absolute';
        moveAt(e);
        friend.style.zIndex = 1000;

        friend.ondragstart = function () {
            return false;
        };

        document.onmousemove = function (e) {
            moveAt(e);
        }

        document.onmouseup = function (e) {
            let list = mappedList.getBoundingClientRect();
            if (e.clientY > list.top && e.clientY < list.bottom && e.clientX > list.left && e.clientX < list.right) {
                if (mappedList.id == 'right-list') {
                    for (let i = 0; i < Model.leftList['items'].length; i++) {
                        if (Model.leftList['items'][i]['id'] == friend.id) {
                            Model.rightList['items'].push(Model.leftList['items'][i]);
                            Model.leftList['items'].splice(i, 1);
                            renderList(Model.rightList, document.querySelector('#right-list'))
                            renderList(Model.leftList, document.querySelector('#left-list'))
                        }
                    };
                } else {
                    for (let i = 0; i < Model.rightList['items'].length; i++) {
                        if (Model.rightList['items'][i]['id'] == friend.id) {
                            Model.leftList['items'].push(Model.rightList['items'][i]);
                            Model.rightList['items'].splice(i, 1);
                            renderList(Model.rightList, document.querySelector('#right-list'))
                            renderList(Model.leftList, document.querySelector('#left-list'))
                        }
                    };
                }
            }
            document.onmousemove = null;
            document.onmouseup = null;
            friend.style = null;
            friend.classList.remove('dragElement');
        }

        function moveAt(e) {
            friend.style.left = e.pageX - shiftX + 'px';
            friend.style.top = e.pageY - shiftY + 'px';
        }

        function getCoords(elem) {
            var box = elem.getBoundingClientRect();
            return {
                top: box.top + pageYOffset,
                left: box.left + pageXOffset
            }
        }
    }

}

export async function init(leftList, rightList) {
    try {
        await auth();
        [Model.me] = await callAPI('users.get', {
            name_case: 'gen'
        });
        const headerInfo = document.querySelector('#header');

        headerInfo.textContent = `Друзья ${Model.me.first_name} ${Model.me.last_name}`;
        Model.friends = await callAPI('friends.get', {
            fields: 'city, country, photo_100, id'
        });
        if (Model.getStorageList('left-list') !== null && Model.getStorageList('right-list') !== null) {
            Model.leftList = Model.getStorageList('left-list');
            Model.rightList = Model.getStorageList('right-list');
            renderList(Model.leftList, leftList);
            renderList(Model.rightList, rightList);
        } else {
            Model.leftList = Model.friends;
            renderList(Model.leftList, leftList);
        }
    } catch (e) {
        console.error(e);
    }
}

function auth() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 6497462
        });
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.76';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    })
}