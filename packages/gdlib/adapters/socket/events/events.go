package events

// Not using iota intentionally to make this more readable
const (
	Ping        = 0
	MurmurHash2 = 1
	Quit        = 2
	FSWatcher   = 3
	Instances   = 4
	JavaDetect  = 5
	JavaInstall = 6
)
