import log from 'electron-log';
import { remote } from 'electron';
import { release, arch, type } from 'os';
import { version } from '../package.json';

function queue(...args) {
  if (typeof window !== 'undefined') {
    return window.ga ? window.ga(...args) : null;
  }
  return null;
}

class GAnalytics {
  constructor() {
    this.curPage = 'N/A';
    // Try to set screen size
    try {
      const { width, height } = remote.screen.getPrimaryDisplay().bounds;
      this.setProperties({
        sr: `${width}x${height}`,
        vp: `${window.innerWidth}x${window.innerHeight}`,
        ds: 'app'
      });
    } catch (err) {
      log.error(err);
    }
    this.setProperties({
      appVersion: version
    });
  }

  trackPage(page) {
    this.curPage = page;
    this.setProperties({ '&dl': page });
    queue('send', {
      hitType: 'pageview',
      page,
      dimension1: `${type()} - ${release()} - ${arch()}`
    });
  }

  setProperties(hash) {
    for (const key in hash) {
      queue('set', key, hash[key]);
    }
  }

  setUserId(userId) {
    queue('set', 'userId', userId);
  }
}

const analytics = new GAnalytics();
export default analytics;
