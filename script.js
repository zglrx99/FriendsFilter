// 1) регистрация приложения -> получение api id
// 2) авторизоваться на сайте
//   - открыть окно с запросом прав
//   - разрешить выполнять действия от нашего имени

const leftFilter = document.querySelector('#left-filter');
const leftList = document.querySelector('#left-list');
const rightFilter = document.querySelector('#right-filter');
const rightList = document.querySelector('#right-list');
const manipulate = document.querySelector('.row');
const saver = document.querySelector('#save')

VK.init({
    apiId: 6497462
});

function auth() {
    return new Promise((resolve, reject) => {
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

(async () => {
    try {
        await auth();
        const [me] = await callAPI('users.get', {
            name_case: 'gen'
        });
        const headerInfo = document.querySelector('#header');

        headerInfo.textContent = `Друзья ${me.first_name} ${me.last_name}`;
        const friends = await callAPI('friends.get', {
            fields: 'city, country, photo_100'
        });
        let storage = localStorage;
        if (storage['left-list'] !== undefined && storage['right-list'] !== undefined) {
            leftList.innerHTML = storage['left-list'];
            rightList.innerHTML = storage['right-list'];
        } else {
            drawList(friends, leftList);
        }
    } catch (e) {
        console.error(e);
    }
})();

function drawList(friends, list) {
    const render = Handlebars.compile(document.querySelector('#user-template').textContent);
    const html = render(friends);
    list.innerHTML = html;
}

function filterIt(list, filter) {
    for (item of list.children) {
        const fullName = item.children[1].childNodes[0].nodeValue.toLowerCase();
        if (fullName.indexOf(filter.value.toLowerCase()) === -1) {
            item.classList.add('hide');
        } else {
            item.classList.remove('hide');
        }
    }

}

leftFilter.addEventListener('keyup', () => {
    filterIt(leftList, leftFilter)
})

rightFilter.addEventListener('keyup', () => {
    filterIt(rightList, rightFilter)
})

manipulate.addEventListener('click', (e) => {
    if (e.target.nodeName === 'BUTTON' &&
        e.originalTarget.parentElement.parentElement.id === 'left-list') {
        e.originalTarget.lastChild.data = '-';
        rightList.appendChild(e.originalTarget.parentElement);
    } else if (e.target.nodeName === 'BUTTON' &&
        e.originalTarget.parentElement.parentElement.id === 'right-list') {
        e.originalTarget.lastChild.data = '+';
        leftList.appendChild(e.originalTarget.parentElement);
    }
})

manipulate.addEventListener('mousedown', (e) => {
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
        friend.parentElement.id === 'left-list' ? mappedList = rightList : mappedList = leftList;
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
            if(e.clientY > list.top && e.clientY < list.bottom && e.clientX > list.left && e.clientX < list.right) {
                mappedList.id === 'left-list' ? friend.children[2].innerText = "+" : friend.children[2].innerText = "-";
                mappedList.appendChild(friend);
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
});

saver.addEventListener('click', ()=>{
    let storage = localStorage;
    rightFilter.value = '';
    leftFilter.value = '';
    filterIt(rightList, rightFilter);
    filterIt(leftList, leftFilter);
    storage['left-list'] = leftList.innerHTML;
    storage['right-list'] = rightList.innerHTML;
})