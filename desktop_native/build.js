const process = require("process");
const child_process = require("child_process");

let targets = [];
switch (process.platform) {
    case "win32":
        targets = ["x86_64-pc-windows-msvc", "aarch64-pc-windows-msvc"];
    break;

    case "darwin":
        targets = ["x86_64-apple-darwin", "aarch64-apple-darwin"];
    break;

    default:
        targets = ['x86_64-unknown-linux-gnu'];
    break;
}

targets.forEach(target => {
    child_process.execSync(`npm run build:internal -- --target ${target}`, {stdio: 'inherit'});
});
