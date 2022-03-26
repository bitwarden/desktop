import { powerMonitor } from "electron";

import { isSnapStore } from "jslib-electron/utils";

import { Main } from "../main";

// tslint:disable-next-line
const IdleLockSeconds = 5 * 60; // 5 minutes
const IdleCheckInterval = 30 * 1000; // 30 seconds

export class PowerMonitorMain {
  private idle = false;

  constructor(private main: Main) {}

  init() {
    // ref: https://github.com/electron/electron/issues/13767
    if (!isSnapStore()) {
      // System sleep
      powerMonitor.on("suspend", () => {
        this.main.messagingService.send("systemSuspended");
      });
    }

    if (process.platform !== "linux") {
      // System locked
      powerMonitor.on("lock-screen", () => {
        this.main.messagingService.send("systemLocked");
      });
    }

    // System idle
    global.setInterval(() => {
      const idleSeconds: number = powerMonitor.getSystemIdleTime();
      const idle = idleSeconds >= IdleLockSeconds;
      if (idle) {
        if (this.idle) {
          return;
        }

        this.main.messagingService.send("systemIdle");
      }

      this.idle = idle;
    }, IdleCheckInterval);
  }
}
