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
    // Try to set screen size
    try {
      const { width, height } = ipcRenderer.invoke("getPrimaryDisplaySizes");
      this.setProperties({
        sr: `${width}x${height}`,
        vp: `${window.innerWidth}x${window.innerHeight}`,
        ds: "app"
      });
    } catch (err) {
      console.error(err);
    }
    this.setProperties({
      appVersion: version
    });
  }

  trackPage(page) {
    this.curPage = page;
    this.setProperties({ "&dl": page });
    queue("send", {
      hitType: "pageview",
      page,
      dimension1: `${type()} - ${release()} - ${arch()}`
    });
  }

  /* eslint-disable */
  setProperties(hash) {
    for (const key in hash) {
      queue("set", key, hash[key]);
    }
  }

  setUserId(userId) {
    queue("set", "userId", userId);
  }
  /* eslint-enable */
}

const analytics = new GAnalytics();
export default analytics;
