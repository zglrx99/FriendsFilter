export default {
    me: null,
    friends: null,
    rightList: { items: []},
    leftList: {items: []},
    getStorageList(name) {
        return JSON.parse(localStorage.getItem(name));
    }
}