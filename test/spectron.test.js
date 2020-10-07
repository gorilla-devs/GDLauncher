const { expect } = require('chai');
const { Application } = require('spectron');

// eslint-disable-next-line
describe('Spectron', function () {
  // Mainly for CI jobs
  this.timeout(100000);

  const app = new Application({
    path: './deploy/a/GDLauncher.exe',
    args: []
  });

  // eslint-disable-next-line
  before('app:start', done => {
    app.start();
    setTimeout(() => {
      done();
    }, 10000);
  });

  // eslint-disable-next-line
  after('app:stop', async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  // eslint-disable-next-line
  describe('Browser Window', () => {
    // eslint-disable-next-line
    it('should open a browser window', async () => {
      // We can't use `isVisible()` here as it won't work inside
      // a Windows Docker container, but we can approximate it
      // with these set of checks:
      const bounds = await app.browserWindow.getBounds();
      expect(bounds.height).to.be.above(0);
      expect(bounds.width).to.be.above(0);
      // eslint-disable-next-line
      expect(await app.browserWindow.isMinimized()).to.be.false;
      // eslint-disable-next-line
      expect(await app.browserWindow.isVisible()).to.be.true;
    });

    // eslint-disable-next-line
    it('should set a proper title', async () => {
      return expect(await app.client.getTitle()).to.equal('GDLauncher');
    });
  });
});
