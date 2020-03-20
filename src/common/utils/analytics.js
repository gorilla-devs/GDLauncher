import { ipcRenderer } from "electron";
import { release, arch, type } from "os";
import { version } from "../../../package.json";

function queue(...args) {
  if (typeof window !== "undefined") {
    return window.ga ? window.ga(...args) : null;
  }
  return null;
}

class GAnalytics {
  constructor() {
    this.curPage = "N/A";
    this.userId = null;
  }

  trackPage(page) {
    this.curPage = page;
    this.setProperties({ "&dl": page });
    queue("send", {
      hitType: "pageview",
      page
    });
  }

  idle(page) {
    if (this.userId) {
      this.curPage = page;
      queue("set", "page", page);
      queue("send", "event", "idleForFiveMinutes", page);
    }
  }

  /* eslint-disable */
  setProperties(hash) {
    for (const key in hash) {
      queue("set", key, hash[key]);
    }
  }

  async setUserId(userId) {
    queue("set", "userId", userId);
    // Try to set screen size
    try {
      const { width, height } = await ipcRenderer.invoke(
        "getPrimaryDisplaySizes"
      );
      this.setProperties({
        sr: `${width}x${height}`,
        ds: "app"
      });
      queue("send", "event", "screenSize", `${width}x${height}`);
      queue(
        "send",
        "event",
        "operatingSystem",
        `${type()} - ${release()} - ${arch()}`
      );
    } catch (err) {
      console.error(err);
    }
    this.setProperties({
      appVersion: version
    });
    this.userId = userId;
  }
  /* eslint-enable */
}

const analytics = new GAnalytics();
export default analytics;
