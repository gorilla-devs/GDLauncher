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
	testPingEvent(t, c)

	// FSWatchStart Event
	testFsWatchStart(t, c)

	// FSWatchStop Event
	testFsWatchStop(t, c)

	// Murmur2 Event
	testCorrectMurmur2(t, c)
	testWrongMurmur2(t, c)
	testFSEvents(t, c)

	// Quit Event
	testQuitEvent(t, c)
}

func testPingEvent(t *testing.T, c *websocket.Conn) {
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

	_, _, err = c.ReadMessage()
	if err != nil {
		t.Error(err)
	}
}

func testCorrectMurmur2(t *testing.T, c *websocket.Conn) {
	murmur2 := Message{
		Type: events.MurmurHash2,
		Id:   "murmur2-test",
		Payload: map[string]interface{}{
			"path": "../test_dir/mock_file",
		},
	}
	b, err := json.Marshal(murmur2)
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
	var res SocketResponse
	err = json.Unmarshal(message, &res)
	if err != nil {
		t.Error(err)
	}

	murmur2hash := int(res.Data.(float64))

	if murmur2hash != 2800884615 {
		t.Error("Murmur2 hash is not correct")
	}
}

func testWrongMurmur2(t *testing.T, c *websocket.Conn) {
	murmur2 := Message{
		Type: events.MurmurHash2,
		Id:   "murmur2-test",
		Payload: map[string]interface{}{
			"path": "../test_dir/not_found_file",
		},
	}
	b, err := json.Marshal(murmur2)
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
	var res SocketResponse
	err = json.Unmarshal(message, &res)
	if err != nil {
		t.Error(err)
	}

	murmur2hash := int(res.Data.(float64))
	respErr := res.Err

	if respErr == "" || murmur2hash != 1 {
		t.Error("Murmur2 hash is not correct")
	}
}

func testQuitEvent(t *testing.T, c *websocket.Conn) {
	quit := Message{
		Type:    events.Quit,
		Id:      "quit-test",
		Payload: map[string]interface{}{},
	}
	b, err := json.Marshal(quit)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}
}
func testFsWatchStart(t *testing.T, c *websocket.Conn) {
	fsWatchStart := Message{
		Type: events.FSWatcher,
		Id:   "fswatchstart-test",
		Payload: map[string]interface{}{
			"path":   ".",
			"action": FS_WATCHER_START,
		},
	}
	b, err := json.Marshal(fsWatchStart)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}

	_, _, err = c.ReadMessage()
	if err != nil {
		t.Error(err)
	}
}

func testFsWatchStop(t *testing.T, c *websocket.Conn) {
	fsWatchStop := Message{
		Type: events.FSWatcher,
		Id:   "fswatchstop-test",
		Payload: map[string]interface{}{
			"path":   ".",
			"action": FS_WATCHER_STOP,
		},
	}
	b, err := json.Marshal(fsWatchStop)
	if err != nil {
		t.Error(err)
	}
	err = c.WriteMessage(websocket.TextMessage, b)
	if err != nil {
		t.Error(err)
	}

	_, _, err = c.ReadMessage()
	if err != nil {
		t.Error(err)
	}
}

func testFSEvents(t *testing.T, c *websocket.Conn) {

	// go func() {
	// 	time.Sleep(time.Second * 15)
	// 	os.WriteFile(fmt.Sprintf("./data/%d", 1), []byte("Hello World"), 0644)
	// 	os.WriteFile(fmt.Sprintf("./data/%d", 2), []byte("Hello World"), 0644)

	// 	os.Rename("./data/New Text Document.txt", "./data/New Text Document1.txt")

	// }()

	// _, message, err := c.ReadMessage()
	// if err != nil {
	// 	t.Error(err)
	// }

	// var res SocketResponse
	// err = json.Unmarshal(message, &res)
	// if err != nil {
	// 	t.Error(err)
	// }

	// t.Log(res)
}
