package socket

import (
	"encoding/json"
	"errors"
	"fmt"
	"gdlib/adapters/socket/events"
	"gdlib/internal"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/mitchellh/mapstructure"
)

type Message struct {
	Type    int         `json:"type"`
	Id      string      `json:"id"`
	Payload interface{} `json:"payload"`
}

type SocketResponse struct {
	Type      int         `json:"type"`
	Id        string      `json:"id"`
	Timestamp int64       `json:"timestamp"`
	Err       string      `json:"error,omitempty"`
	Data      interface{} `json:"data"`
}

const (
	GET_INSTANCES = iota
)

var shouldQuit = true
var upgrader = websocket.Upgrader{}
var semaphore = make(chan int, 1)

var quitError = make(chan error)

const PORT = 7890

func init() {
	http.HandleFunc("/v1", handleRequest)
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	semaphore <- 1
	fmt.Println("Joined", r.RemoteAddr)
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	c, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Fatal("Upgrade:", err)
	}

	defer c.Close()
	for {
		var message Message
		err := c.ReadJSON(&message)
		if err != nil {
			log.Println("read:", err)
			break
		}
		processEvent(message, c)
	}
	<-semaphore
}

func sendErrorResponse(err error, request Message) []byte {
	resp := SocketResponse{
		Err:       err.Error(),
		Id:        request.Id,
		Data:      1,
		Timestamp: time.Now().Unix(),
		Type:      request.Type,
	}
	fmt.Printf("Response Error: %+v\n", resp)
	errorResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatal("error:", err)
	}
	return errorResp
}

func StartServer() error {
	// If we don't receive a ping signal within 10 seconds, we should quit
	// go func() {
	// 	// Intentionally not passing shouldQuit as parameter because we want to
	// 	// always read the latest value. This should usually be considered a data
	// 	// race but it isn't in this case
	// 	time.Sleep(10 * time.Second)
	// 	if shouldQuit {
	// 		quitError <- errors.New("quitting caused by no ping received within 10s from startup")
	// 	}
	// }()

	fmt.Println("Listening on port", PORT)
	go func() {
		err := http.ListenAndServe(fmt.Sprintf("localhost:%d", PORT), nil)
		quitError <- err
	}()

	err := <-quitError
	return err
}

func processEvent(message Message, c *websocket.Conn) {
	var err error

	fmt.Println("Request:", message)
	payloadData := message.Payload.(map[string]interface{})
	var response int
	// Response should be 0 if the status is ok
	switch message.Type {
	case events.Ping:
		response, err = processPing(payloadData)
	case events.MurmurHash2:
		response, err = processMurmurHash2(payloadData)
	case events.Quit:
		response, err = processQuit(payloadData)
	case events.FSWatcher:
		response, err = processFSWatcher(payloadData, c)
	case events.Instances:
		response, err = processInstances(payloadData, c)
	}

	if err != nil {
		c.WriteJSON(sendErrorResponse(err, message))
		return
	}

	newResp := SocketResponse{
		Data:      response,
		Id:        message.Id,
		Timestamp: time.Now().Unix(),
		Type:      message.Type,
	}

	marshaled, err := json.Marshal(newResp)
	if err != nil {
		c.WriteJSON(sendErrorResponse(err, message))
		return
	}
	fmt.Printf("Response: %+v\n", newResp)
	err = c.WriteJSON([]byte(marshaled))
	if err != nil {
		c.WriteJSON(sendErrorResponse(err, message))
		return
	}
}

func processPing(payload map[string]interface{}) (int, error) {
	fmt.Printf("PING %v\n", payload)
	shouldQuit = false
	return 123456789, nil
}

type murmur2Event struct {
	Path string `mapstructure:",omitempty"`
}

func processMurmurHash2(payload map[string]interface{}) (int, error) {
	var data murmur2Event
	err := mapstructure.Decode(payload, &data)
	if err != nil {
		return 0, err
	}

	murmur2, err := internal.ComputeMurmur2(data.Path)

	if err != nil {
		return 0, err
	}

	return int(murmur2), nil
}

func processQuit(payload map[string]interface{}) (int, error) {
	quitError <- errors.New("quitting")
	return 0, nil
}

type FSWatcherT int

const (
	FS_WATCHER_START FSWatcherT = iota
	FS_WATCHER_STOP
	FS_WATCHER_LIST
)

type fsWatcherEvent struct {
	Path   string     `mapstructure:",omitempty"`
	Action FSWatcherT `mapstructure:",omitempty"`
}

func processFSWatcher(payload map[string]interface{}, c *websocket.Conn) (int, error) {
	var data fsWatcherEvent
	err := mapstructure.Decode(payload, &data)
	if err != nil {
		return 0, err
	}

	updateFunc := func(data internal.FSEvent) {
		fmt.Println(data)
	}

	var done = make(chan error)
	defer close(done)

	switch data.Action {
	default:
	case FS_WATCHER_START:
		go internal.StartFSWatcher(data.Path, updateFunc, done)
	case FS_WATCHER_STOP:
		go internal.StopFSWatcher(data.Path, updateFunc, done)
	case FS_WATCHER_LIST:
		fmt.Println("FSWatcher: List")
	}

	select {
	case v := <-done:
		if v != nil {
			return 1, v
		}
		return 0, nil
	case <-time.After(5 * time.Second):
		return 0, errors.New("timeout waiting for FSWatcher action to finish")
	}
}

func processInstances(payload map[string]interface{}, c *websocket.Conn) (int, error) {
	// Do stuff

	return 0, nil
}
