class PromiseQueue {
  constructor() {
    this.queue = [];
    this.isPending = false;
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

  async execute() {
    if (this.isPending) return false;
    while (this.queue[0]) {
      const item = this.queue.shift();
      this.isPending = true;
      try {
        // eslint-disable-next-line
        const value = await item.promise();
        item.resolve(value);
      } catch (e) {
        item.reject(e);
      }
      this.isPending = false;
    }
  }
}

export default PromiseQueue;
