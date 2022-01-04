package events

// Not using iota intentionally to make this more readable
const (
	Ping            = 0
	MurmurHash2     = 1
	Quit            = 2
	FSWatcher       = 3
	GetAllInstances = 4
	JavaDetect      = 5
	JavaInstall     = 6
)

// Response events
const (
	InstanceUpdate = 3000
)
