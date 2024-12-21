const N = Neutralino;
const appsPath = 'resources/apps.json';
const coversPath = 'resources/covers';
const RAWG_API_KEY = '01ea42e82fd04299b3c8ba5a5df817aa';
let appList = [];

N.init();
async function getApps() {
    let data = null;
    try {
        data = await N.filesystem.readFile(appsPath);
    } catch (error) {
        if (error.code === 'NE_FS_FILRDER') {
            data = '{"apps": []}';
            await Neutralino.filesystem.writeFile(appsPath, data);
        }
    }
    appList = JSON.parse(data).apps;
    return appList;
}

async function saveApps(apps) {
    await N.filesystem.writeFile(appsPath, JSON.stringify({ apps }));
}

function getApp(index) {
    if (index === null) {
        return {name: '', command: ''};
    }
    const app = appList[index];
    return app;
}

async function loadApps() {
    const exists = await Neutralino.filesystem.readDirectory(coversPath)
        .then(() => true)
        .catch(() => false);

    if (!exists) {
        await Neutralino.filesystem.createDirectory(coversPath);
    }

    try {
        const apps = await getApps();
        renderAppList(apps);
    } catch (error) {
        console.error('Ошибка при загрузке списка приложений:', error);
    }
}

function renderAppList(apps) {
    const appListElement = document.getElementById('appList');
    appListElement.innerHTML = '';

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
            </div>`;
        if (app.cover) {
            appItem.style.backgroundImage = `url(./covers/${app.cover})`;
        } else {
            appItem.innerHTML += `<i class="fa-solid fa-shuttle-space icon"></i>`;
        }
        appItem.innerHTML += `<div class="name">${app.name}</div>`;
        appListElement.appendChild(appItem);
    });
    const addItem = document.createElement('div');
    addItem.classList.add('tile');
    addItem.addEventListener('click', function(){ openModal(event) });
    addItem.innerHTML = `<i class="fa-solid fa-circle-plus icon"></i>`;
    appListElement.appendChild(addItem);
}

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
    document.getElementById('isSaving').style.display = 'inline-block';
    const apps = await getApps();
    const name = document.getElementById('name').value.trim();
    const command = document.getElementById('command').value.trim();
    const image = await getGameCover(name);
    let cover = '';
    if (image) {
        cover = await saveGameCover(image);
    }
    const app = { name, command, cover };
    if (currentEditIndex === null) {
        apps.push(app);
    } else {
        apps[currentEditIndex] = app;
    }
    await saveApps(apps);
    loadApps();
    document.getElementById('isSaving').style.display = 'none';
    closeModal();
}

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

async function deleteApp(event, index) {
    event.stopPropagation();
    const apps = await getApps();
    apps.splice(index, 1);
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

async function getGameCover(gameName) {
    const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(gameName)}&platforms=4`;
    try {
        const response = await Neutralino.os.execCommand(`curl -X GET "${url}"`);
        const data = JSON.parse(response.stdOut);
        if (data.results && data.results.length > 0) {
            return data.results[0].background_image;
        } else {
            return '';
        }
    } catch (error) {
        console.error('Ошибка при выполнении команды:', error);
    }
}

async function saveGameCover(imageUrl) {
    console.log(imageUrl);
    const fileName = imageUrl.split('/').pop();
    const filePath = `${coversPath}/${fileName}`;

    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageArrayBuffer = await imageBlob.arrayBuffer();

    try {  
        await Neutralino.filesystem.writeBinaryFile(filePath, new Uint8Array(imageArrayBuffer));
        console.log(`Изображение сохранено как ${filePath}`);
        return fileName;
    } catch (err) {
        console.error('Ошибка при сохранении изображения:', err);
    }
}

function getFileName(imageUrl) {
    return imageUrl.split('/').pop();
}


loadApps();