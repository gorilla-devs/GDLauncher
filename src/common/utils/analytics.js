import { version } from '../../../package.json';

function queue(...args) {
  if (typeof window !== 'undefined') {
    return window.ga ? window.ga(...args) : null;
  }
  return null;
}

class GAnalytics {
  constructor() {
    this.curPage = 'N/A';
    this.userId = null;
    this.setProperties({
      appVersion: version
    });
  }

  trackPage(page) {
    this.curPage = page;
    this.setProperties({ '&dl': page });
    queue('send', {
      hitType: 'pageview',
      page
    });
  }

  idle(page) {
    this.curPage = page;
    this.setProperties({ page });
    queue('send', 'event', 'idleForFiveMinutes', page);
  }

  sendCustomEvent(eventName) {
    queue('send', 'event', eventName, this.curPage);
  }

  /* eslint-disable */
  setProperties(hash) {
    for (const key in hash) {
      queue('set', key, hash[key]);
    }
  }

  setUserId(userId) {
    this.setProperties({
      userId
    });
  }
  /* eslint-enable */
}

const analytics = new GAnalytics();
export default analytics;
