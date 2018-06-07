export default {
    auth() {
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
    },
    callAPI(method, params) {
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
    },
    rightList: { items: []},
    leftList: {items: []},
    getStorageList(name) {
        return JSON.parse(localStorage.getItem(name));
    }
}