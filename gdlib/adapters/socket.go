package adapters

import (
	"encoding/json"
	"errors"
	"fmt"
	"gdl-s/gdlib"
	"gdl-s/gdlib/events"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type    int         `json:"type"`
	Id      string      `json:"id"`
	Payload interface{} `json:"payload"`
}

type SocketResponse struct {
	Type int         `json:"type"`
	Id   string      `json:"id"`
	Err  string      `json:"error,omitempty"`
	Data interface{} `json:"data"`
}

const (
	FS_WATCHER_START = iota
	FS_WATCHER_STOP
	FS_WATCHER_LIST
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
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		processEvent(message, mt, c)
	}
	<-semaphore
}

func sendErrorResponse(err error, request Message) []byte {
	resp := SocketResponse{
		Err:  err.Error(),
		Id:   request.Id,
		Data: 1,
		Type: request.Type,
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
	go func() {
		// Intentionally not passing shouldQuit as parameter because we want to
		// always read the latest value. This should usually be considered a data
		// race but it isn't in this case
		time.Sleep(10 * time.Second)
		if shouldQuit {
			quitError <- errors.New("quitting caused by no ping received within 10s from startup")
		}
	}()

	fmt.Println("Listening on port", PORT)
	go func() {
		err := http.ListenAndServe(fmt.Sprintf("localhost:%d", PORT), nil)
		quitError <- err
	}()

	err := <-quitError
	return err
}

func processEvent(payload []byte, mt int, c *websocket.Conn) {
	var err error
	var message Message
	err = json.Unmarshal(payload, &message)
	if err != nil {
		c.WriteMessage(mt, sendErrorResponse(err, message))
		return
	}

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
	}

	if err != nil {
		c.WriteMessage(mt, sendErrorResponse(err, message))
		return
	}

	newResp := SocketResponse{
		Data: response,
		Id:   message.Id,
		Type: message.Type,
	}

	marshaled, err := json.Marshal(newResp)
	if err != nil {
		c.WriteMessage(mt, sendErrorResponse(err, message))
		return
	}
	fmt.Printf("Response: %+v\n", newResp)
	err = c.WriteMessage(mt, []byte(marshaled))
	if err != nil {
		c.WriteMessage(mt, sendErrorResponse(err, message))
		return
	}
}

// Sends an init signal. If none is received within 10 seconds, the program
// will quit
//
// payload: {}
func processPing(payload map[string]interface{}) (int, error) {
	fmt.Printf("PING %v\n", payload)
	shouldQuit = false
	return 123456789, nil
}

// Computes the murmur2 hash of the file at the given path
//
// payload: {
//     path: string - path to the file to calculate the hash for
// }
func processMurmurHash2(payload map[string]interface{}) (int, error) {
	fp, ok := payload["path"]
	if !ok {
		return 1, errors.New("path not specified in payload")
	}

	filePath, ok := fp.(string)
	if !ok {
		return 1, errors.New("path not a string")
	}

	murmur2, err := gdlib.ComputeMurmur2(filePath)

	if err != nil {
		return 0, err
	}

	return int(murmur2), nil
}

// Quits the server
//
// payload: {}
func processQuit(payload map[string]interface{}) (int, error) {
	quitError <- errors.New("quitting")
	return 0, nil
}

// Processes the FS watcher event. The event can have an action which defines the behaviour of this function.
//
// payload: {
//     path: string - path to file / directory to watch
//     action: int  - 0 for start, 1 for stop, 2 for list
// }
func processFSWatcher(payload map[string]interface{}, c *websocket.Conn) (int, error) {
	directoryParam, ok := payload["path"]
	if !ok {
		return 1, errors.New("path not specified in payload")
	}

	directory, ok := directoryParam.(string)
	if !ok {
		return 1, errors.New("path not a string")
	}

	actionParam, ok := payload["action"]
	if !ok {
		return 1, errors.New("path not specified in payload")
	}

	action, ok := actionParam.(float64)
	if !ok {
		return 1, errors.New("path not a float64")
	}

	updateFunc := func(data gdlib.FSEvent) {
		fmt.Println(data)
	}

	var done = make(chan error)
	defer close(done)

	switch action {
	default:
	case FS_WATCHER_START:
		go gdlib.StartFSWatcher(directory, updateFunc, done)
	case FS_WATCHER_STOP:
		go gdlib.StopFSWatcher(directory, updateFunc, done)
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
		return 1, errors.New("timeout waiting for FSWatcher action to finish")
	}
}
