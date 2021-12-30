package socket

import (
	"encoding/json"
	"errors"
	"fmt"
	"gdlib/adapters/socket/events"
	"gdlib/internal"
	"gdlib/internal/instance"
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

	go func() {
		err := instance.WatchInstances(c)
		if err != nil {
			log.Println("Error watching instances:", err)
		}
	}()
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
	resp := internal.SocketResponse{
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
	// If we don't receive a signal within 60 seconds, we should quit
	go func() {
		shouldQuit = true
		// Intentionally not passing shouldQuit as parameter because we want to
		// always read the latest value. This should usually be considered a data
		// race but it isn't in this case
		time.Sleep(60 * time.Second)
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

func processEvent(message Message, c *websocket.Conn) {
	var err error
	shouldQuit = false
	fmt.Println("Request:", message)
	if message.Payload == nil {
		return
	}
	payloadData := message.Payload.(map[string]interface{})
	var response interface{}
	// Response should be 0 if the status is ok
	switch message.Type {
	case events.Ping:
		response, err = processPing(payloadData)
	case events.MurmurHash2:
		response, err = processMurmurHash2(payloadData)
	case events.Quit:
		response, err = processQuit(payloadData)
	case events.Instances:
		response, err = processInstances(payloadData, c)
	}

	if err != nil {
		c.WriteJSON(sendErrorResponse(err, message))
		return
	}

	newResp := internal.SocketResponse{
		Data:      response,
		Id:        message.Id,
		Timestamp: time.Now().Unix(),
		Type:      message.Type,
	}
	fmt.Printf("Response")
	err = c.WriteJSON(newResp)
	if err != nil {
		c.WriteJSON(sendErrorResponse(err, message))
		return
	}
}

func processPing(payload map[string]interface{}) (int, error) {
	fmt.Printf("PING %v\n", payload)
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

type InstanceEventTypes int

const (
	GET_ALL_INSTANCES InstanceEventTypes = iota
)

type instanceEvent struct {
	Action InstanceEventTypes `mapstructure:",omitempty"`
}

func processInstances(payload map[string]interface{}, c *websocket.Conn) (map[string]instance.Instance, error) {
	var data instanceEvent
	err := mapstructure.Decode(payload, &data)
	if err != nil {
		return map[string]instance.Instance{}, err
	}

	switch data.Action {
	case GET_ALL_INSTANCES:
		return instance.GetInstances(), nil
	}

	return map[string]instance.Instance{}, nil
}
