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

	// Ping Event
	ping := Message{
		Type:    events.Ping,
		Id:      "ping-test",
		Payload: map[string]interface{}{},
	}
	b, err := json.Marshal(ping)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}

	_, message, err := c.ReadMessage()
	if err != nil {
		t.Error(err)
	}

	// FSWatchStart Event
	fsWatchStart := Message{
		Type: events.FSWatcher,
		Id:   "fswatchstart-test",
		Payload: map[string]interface{}{
			"path":   ".",
			"action": FS_WATCHER_START,
		},
	}
	b, err = json.Marshal(fsWatchStart)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}

	_, message, err = c.ReadMessage()
	if err != nil {
		t.Error(err)
	}

	// FSWatchStop Event
	fsWatchStop := Message{
		Type: events.FSWatcher,
		Id:   "fswatchstop-test",
		Payload: map[string]interface{}{
			"path":   ".",
			"action": FS_WATCHER_STOP,
		},
	}
	b, err = json.Marshal(fsWatchStop)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}

	_, message, err = c.ReadMessage()
	if err != nil {
		t.Error(err)
	}

	// Murmur2 Event
	murmur2 := Message{
		Type: events.MurmurHash2,
		Id:   "murmur2-test",
		Payload: map[string]interface{}{
			"path": "../test_dir/mock_file",
		},
	}
	b, err = json.Marshal(murmur2)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}

	_, message, err = c.ReadMessage()
	if err != nil {
		t.Error(err)
	}

	payload := SocketResponse{}
	err = json.Unmarshal(message, &payload)
	if err != nil {
		t.Error(err)
	} else if int(payload.Data.(float64)) != 2800884615 {
		t.Error("Murmur2 result is not correct")
	}

	// Quit Event
	quit := Message{
		Type:    events.Quit,
		Id:      "quit-test",
		Payload: map[string]interface{}{},
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
