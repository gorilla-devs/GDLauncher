class ClientSocket {
  constructor() {
    this.webSocket = new WebSocket('ws://localhost:7890/v1');
    this.webSocket.onopen = event => {
      console.log('Connected to GDLib', event);

      this.webSocket.send(
        JSON.stringify({
          type: 1,
          payload: Buffer.from(
            JSON.stringify({
              filePath: 'Test Path'
            })
          )
        })
      );
    };
    this.webSocket.onclose = event => {
      console.log('Disconnected from GDLib', event);
    };

    this.webSocket.onmessage = event => {
      console.log('Event from GDLib', JSON.parse(event.data));
    };
  }
}

export default new ClientSocket();
