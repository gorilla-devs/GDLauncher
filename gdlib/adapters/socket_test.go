package adapters

import (
	"encoding/json"
	"fmt"
	"gdl-s/gdlib/events"
	"net/url"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestSocket(t *testing.T) {
	var err error

	err = StartServer()

	if err == nil {
		t.Error(err)
	}

	time.Sleep(200 * time.Millisecond)

	go func() {
		err := StartServer()
		if err != nil {
			fmt.Println("Main server closed")
		}
	}()

	time.Sleep(200 * time.Millisecond)

	u := url.URL{Scheme: "ws", Host: "127.0.0.1:7890", Path: "/v1"}

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)

	if err != nil {
		t.Error(err)
	}
	defer c.Close()

	ping := Message{
		Type:    events.Ping,
		Id:      "ping-test",
		Payload: PayloadRequest{},
	}
	b, err := json.Marshal(ping)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}

	quit := Message{
		Type:    events.Quit,
		Id:      "quit-test",
		Payload: PayloadRequest{},
	}
	b, err = json.Marshal(quit)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}
}
