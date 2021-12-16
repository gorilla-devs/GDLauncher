class ClientSocket {
  constructor() {
    this.webSocket = new WebSocket('ws://localhost:7890/v1');
    this.webSocket.onopen = () => {
      console.log('Connected to gdlib');
    };
    this.webSocket.onclose = () => {
      console.log('Disconnected from gdlib');
    };

    this.webSocket.onmessage = ev => {
      console.log('Received message from gdlib');
      const { data } = ev;
      const message = JSON.parse(data);
      const event = new CustomEvent('_GDLIB_MESSAGE_', {
        detail: {
          id: message.id,
          value: message.data
        }
      });
      window.dispatchEvent(event);
    };
  }

  async sendMessage(socketEvent, payload) {
    if (!this.webSocket.OPEN) {
      return;
    }

    const messageId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    this.webSocket.send(
      JSON.stringify({
        type: socketEvent,
        id: messageId,
        payload: Buffer.from(JSON.stringify(payload))
      })
    );

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timed out'));
      }, 15000);
      window.addEventListener('_GDLIB_MESSAGE_', event => {
        if (event.detail.id === messageId) {
          clearTimeout(timer);
          resolve(event.detail.value);
        }
      });
    });
  }
}

export const events = {
  ping: 0,
  murmur2: 1,
  quit: 2
};

export default new ClientSocket();
