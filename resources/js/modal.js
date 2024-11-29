let currentEditIndex = null;

function openModal(event, index = null) {
    event.stopPropagation();
    currentEditIndex = index;
    const app = getApp(index);

    document.getElementById('name').value = app.name;
    document.getElementById('command').value = app.command;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}
