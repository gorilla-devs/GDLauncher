// This class is used to create a queue of operations when working with instances configs, to avoid data corruption.
// Each instance will have its own queue. This can also be used in more generic situations where a queue structure is needed
class PromiseQueue {
  constructor() {
    this.queue = [];
    this.isPending = false;
    this.listeners = {};
  }

  add(promise) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promise,
        resolve,
        reject
      });
      this.execute();
    });
  }

  on(eventName, handler) {
    switch (eventName) {
      case 'executed':
        this.listeners.executed = () => handler(this.queue.length + 1);
        break;
      case 'start':
        this.listeners.start = () => handler(this.queue.length + 1);
        break;
      case 'end':
        this.listeners.end = () => handler();
        break;
      default:
        return null;
    }
    return null;
  }

  async execute() {
    const startHandler = this.listeners.start;
    if (this.isPending) return false;
    if (startHandler) {
      setTimeout(startHandler, 0);
    }
    while (this.queue[0]) {
      const item = this.queue.shift();
      this.isPending = true;
      try {
        // eslint-disable-next-line
        const value = await item.promise();
        const executedHandler = this.listeners.executed;
        if (executedHandler) {
          setTimeout(executedHandler, 0);
        }
        item.resolve(value);
      } catch (e) {
        item.reject(e);
      }
      this.isPending = false;
    }
    const endHandler = this.listeners.end;
    if (endHandler) {
      setTimeout(endHandler, 0);
    }
    return null;
  }
}

export default PromiseQueue;
