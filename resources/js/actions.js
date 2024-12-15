function actionLock() {
    action("rundll32.exe user32.dll,LockWorkStatio");
}

function actionLogout() {
    action("shutdown /l");
}

function actionPower() {
    action("shutdown /s");
}

async function actionFullscreen() {
    const isFullScreen = await Neutralino.window.isFullScreen();
    const icon = document.getElementById('fullscreenIcon');
    if (isFullScreen) {
        await Neutralino.window.exitFullScreen();
        icon.classList.remove('fa-minimize');
        icon.classList.add('fa-maximize');
    } else {
        await Neutralino.window.setFullScreen();
        icon.classList.remove('fa-maximize');
        icon.classList.add('fa-minimize');
    }
}

async function actionExit() {
    await Neutralino.app.exit();
}

function actionScreenConfig() {
    action("start ms-settings:display");
}

function action(cmd) {
    Neutralino.os.execCommand(cmd);
}