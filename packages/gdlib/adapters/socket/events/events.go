package events

// Not using iota intentionally to make this more readable
const (
	Ping        = 0
	MurmurHash2 = 1
	Quit        = 2
	FSWatcher   = 3

	GetAllInstances = 4
	StartInstance   = 5
	StopInstance    = 6
	CreateInstance  = 7
	DeleteInstance  = 8

	JavaDetect  = 100
	JavaInstall = 101
)

// Response events
const (
	InstanceUpdate = 3000
)
