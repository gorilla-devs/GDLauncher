package gdlib

import (
	"encoding/json"
	"errors"
	"fmt"
	"gdl-s/gdlib/events"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type    int            `json:"type"`
	Id      string         `json:"id"`
	Payload PayloadRequest `json:"payload"`
}

type PayloadRequest struct {
	Data []byte `json:"data"`
}

type SocketResponse struct {
	Type int         `json:"type"`
	Id   string      `json:"id"`
	Err  string      `json:"error,omitempty"`
	Data interface{} `json:"data"`
}

const (
	FS_START = iota
	FS_STOP
	FS_LIST
)

var shouldQuit = true
var upgrader = websocket.Upgrader{}
var semaphore = make(chan int, 1)

const PORT = 7890

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

func StartServer() {
	// If we don't receive a ping signal within 10 seconds, we should quit
	go func() {
		// Intentionally not passing shouldQuit as parameter because we want to
		// always read the latest value. This should usually be considered a data
		// race but it isn't in this case
		time.Sleep(10 * time.Second)
		if shouldQuit {
			fmt.Println("Quitting caused by no ping received within 10s from startup")
			os.Exit(0)
		}
	}()

	http.HandleFunc("/v1", handleRequest)
	fmt.Println("Listening on port", PORT)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("localhost:%d", PORT), nil))
}

func processEvent(payload []byte, mt int, c *websocket.Conn) {
	var err error
	var message Message
	err = json.Unmarshal(payload, &message)
	if err != nil {
		c.WriteMessage(mt, sendErrorResponse(err, message))
		return
	}

	fmt.Println("Request:", message.Id, "event of type", message.Type)
	var response int
	// Response should be 0 if the status is ok
	switch message.Type {
	case events.Ping:
		response, err = processPing(message.Payload.Data)
	case events.MurmurHash2:
		response, err = processMurmurHash2(message.Payload.Data)
	case events.Quit:
		response, err = processQuit(message.Payload.Data)
	case events.FSWatcher:
		response, err = processFSWatcher(message.Payload.Data, c)
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
func processPing(payload []byte) (int, error) {
	fmt.Printf("PING %v\n", payload)
	shouldQuit = false
	return 123456789, nil
}

// Computes the murmur2 hash of the file at the given path
//
// payload: {
//     path: string - path to the file to calculate the hash for
// }
func processMurmurHash2(payload []byte) (int, error) {
	hashmap := make(map[string]string)
	err := json.Unmarshal(payload, &hashmap)
	if err != nil {
		return 0, err
	}

	filePath := hashmap["path"]
	fd, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	stat, err := fd.Stat()
	if err != nil {
		return 0, err
	}
	defer fd.Close()
	buffer := make([]byte, stat.Size())
	_, err = fd.Read(buffer)
	if err != nil {
		return 0, err
	}

	res := buffer[:0]
	for _, v := range buffer {
		if v != 9 && v != 10 && v != 13 && v != 32 {
			res = append(res, v)
		}
	}

	murmur2 := MurmurHash2(res)

	return int(murmur2), nil
}

// Quits the server
//
// payload: {}
func processQuit(payload []byte) (int, error) {
	fmt.Println("Quitting")
	os.Exit(0)
	return 0, nil
}

// Processes the FS watcher event. The event can have an action which defines the behaviour of this function.
//
// payload: {
//     path: string - path to file / directory to watch
//     action: int  - 0 for start, 1 for stop, 2 for list
// }
func processFSWatcher(payload []byte, c *websocket.Conn) (int, error) {
	hashmap := make(map[string]interface{})
	err := json.Unmarshal(payload, &hashmap)
	if err != nil {
		return 0, err
	}

	if err != nil {
		return 0, err
	}

	directory := hashmap["path"].(string)

	var done = make(chan error)
	switch hashmap["action"].(float64) {
	default:
	case FS_START:
		go startFSWatcher(directory, c, done)
	case FS_STOP:
		go stopFSWatcher(directory, c, done)
	case FS_LIST:
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
