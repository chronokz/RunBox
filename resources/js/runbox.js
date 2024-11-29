const N = Neutralino;
const filePath = 'data';
const appsPath = `${filePath}/apps.json`;
let appList = [];

N.init();
async function getApps() {
    const data = await N.filesystem.readFile(appsPath);
    if (data) {
        appList = JSON.parse(data).apps;
    } else {
        appList = [];
    }
    return appList;
}
async function saveApps(apps) {
    await N.filesystem.writeFile(appsPath, JSON.stringify({ apps }));
}
function getApp(index) {
    if (!index) {
        return {name: '', command: ''};
    }
    const app = appList[index];
    return app;
}

// Функция для чтения списка приложений из файла
async function loadApps() {
    try {
        const apps = await getApps();
        console.log(apps);
        renderAppList(apps);
    } catch (error) {
        console.error('Ошибка при загрузке списка приложений:', error);
    }
}

// Функция для отображения списка приложений
function renderAppList(apps) {
    const appListElement = document.getElementById('appList');
    appListElement.innerHTML = '';
    console.log(apps);

    apps.forEach((app, index) => {
        const appItem = document.createElement('div');
        appItem.classList.add('tile');
        appItem.addEventListener('click', function() {
            runApp(index);
        });
        appItem.innerHTML = `
            <div class="actions">
                <button onclick="openModal(event, ${index})" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteApp(event, ${index})" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
            <i class="fa-solid fa-shuttle-space icon"></i>
            <div class="name">${app.name}</div>
        `;
        appListElement.appendChild(appItem);
    });
    const addItem = document.createElement('div');
    addItem.classList.add('tile');
    addItem.addEventListener('click', function(){ openModal(event) });
    addItem.innerHTML = `<i class="fa-solid fa-circle-plus icon"></i>`;
    appListElement.appendChild(addItem);
}

// Функция для добавления нового приложения
async function addApp(name, command) {
    const newApp = { name, command };

    try {
        const apps = await getApps();
        apps.push(newApp);
        await saveApps(apps);
        loadApps();
    } catch (error) {
        console.error('Ошибка при добавлении приложения:', error);
    }
}

async function saveApp() {
    const apps = await getApps();
    const app = {
        name: document.getElementById('name').value.trim(),
        command: document.getElementById('command').value.trim(),
    };
    if (!currentEditIndex) {
        apps.push(app);
    } else {
        apps[index] = app;
    }
    await saveApps(apps);
    loadApps();
    closeModal();
}

// Функция для редактирования приложения
async function editApp(index) {
    const app = getApp(index);

    const newName = prompt('Enter new name:', app.name);
    const newCommand = prompt('Enter new exec command:', app.Command);

    if (newName && newCommand) {
        apps[index] = { name: newName, Command: newCommand };
        await saveApps(apps);
        loadApps();
    }
}

// Функция для удаления приложения
async function deleteApp(event, index) {
    event.stopPropagation();
    const apps = await getApps();
    apps.splice(index, 1); // Удаляем приложение по индексу
    await saveApps(apps);
    loadApps();
}

function addAppFromInput() {
    const name = document.getElementById('appName').value;
    const command = document.getElementById('command').value;

    if (name && command) {
        addApp(name, command);
        document.getElementById('appName').value = '';
        document.getElementById('command').value = '';
    } else {
        alert('Please enter both name and exec command');
    }
}

// Функция для запуска приложения по индексу
function runApp(index) {
    const app = appList[index];
    if (app && app.command) {
        Neutralino.os.execCommand(app.command)
            .then(() => {
                console.log(`Запуск приложения: ${app.name}`);
            })
            .catch(err => {
                console.error('Ошибка при запуске приложения:', err);
            });
    } else {
        console.error('Приложение не найдено или не указана команда');
    }
}


loadApps();