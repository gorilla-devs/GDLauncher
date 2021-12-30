package internal

type SocketResponse struct {
	Type      int         `json:"type"`
	Id        string      `json:"id"`
	Timestamp int64       `json:"timestamp"`
	Err       string      `json:"error,omitempty"`
	Data      interface{} `json:"data"`
}
