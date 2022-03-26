import { NativeMessagingProxy } from "./proxy/native-messaging-proxy";

// We need to import the other dependencies using `require` since `import` will
// generate `Error: Cannot find module 'electron'`. The cause of this error is
// due to native messaging setting the ELECTRON_RUN_AS_NODE env flag on windows
// which removes the electron module. This flag is needed for stdin/out to work
// properly on Windows.

if (
  process.argv.some((arg) => arg.indexOf("chrome-extension://") !== -1 || arg.indexOf("{") !== -1)
) {
  if (process.platform === "darwin") {
    // eslint-disable-next-line
    const app = require("electron").app;

    app.on("ready", () => {
      app.dock.hide();
    });
  }

  process.stdout.on("error", (e) => {
    if (e.code === "EPIPE") {
      process.exit(0);
    }
  });

  const proxy = new NativeMessagingProxy();
  proxy.run();
} else {
  // eslint-disable-next-line
  const Main = require("./main").Main;

  const main = new Main();
  main.bootstrap();
}
