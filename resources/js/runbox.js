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
        appItem.classList.add('app-item');
        appItem.innerHTML = `
            <b onclick="runApp(${index})">${app.name}</b> 
            <button onclick="editApp(${index})">Edit</button>
            <button onclick="deleteApp(${index})">Delete</button>
        `;
        appListElement.appendChild(appItem);
    });
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

// Функция для редактирования приложения
async function editApp(index) {
    const apps = await getApps();
    const app = apps[index];

    const newName = prompt('Enter new name:', app.name);
    const newCommand = prompt('Enter new exec command:', app.Command);

    if (newName && newCommand) {
        apps[index] = { name: newName, Command: newCommand };
        await saveApps(apps);
        loadApps();
    }
}

// Функция для удаления приложения
async function deleteApp(index) {
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
    console.log(app);
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

const cmd = 'C:\Users\chrono\AppData\Local\Programs\Evernote\Evernote.exe';
document.getElementById('openCalculator').addEventListener('click', () => {
    N.os.execCommand(cmd).then(() => {
        console.log('Calculator opened successfully.');
    }).catch((err) => {
        console.error('Failed to open calculator:', err);
    });
});



loadApps();