export function renderList(friends, list) {
    let template = null;
    list.id == 'right-list' ? template = document.querySelector('#right-template') : template = document.querySelector('#left-template');
    const render = Handlebars.compile(template.textContent);
    const html = render(friends);
    list.innerHTML = html;
}