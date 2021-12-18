package gdlib

import (
	"errors"
	"fmt"
	"io/fs"
	"log"
	"os"
	"time"
)

const (
	FS_CREATE = iota
	FS_DELETE
	FS_RENAME
)

type FSEvent struct {
	Type int
	Path string
}

var dirsToWatch []string
var stopChans = make(map[string](chan bool), 20)

func StartFSWatcher(directory string, updateFunc func(FSEvent), done chan<- error) {
	alreadyWatching := false
	for _, v := range dirsToWatch {
		if v == directory {
			alreadyWatching = true
			break
		}
	}
	if alreadyWatching {
		done <- errors.New("directory already being watched")
		return
	}

	// Check if we're not watching that directory already
	dirsToWatch = append(dirsToWatch, directory)
	// This should release the channel as soon as it's done initializing
	watchDirectory(directory, updateFunc, done)
}

func StopFSWatcher(directory string, updateFunc func(FSEvent), done chan<- error) {
	stopChans[directory] <- true
	delete(stopChans, directory)
	fmt.Println("Stopped watching directory:", directory)
	done <- nil
}

// This function should release the channel as soon as it's done initializing
func watchDirectory(directory string, updateFunc func(FSEvent), done chan<- error) {
	hashmap := make(map[string]string)
	res, err := readAllFiles(directory)
	if err != nil {
		done <- err
	}
	for _, v := range res {
		hashmap[v.Name()] = v.Name()
	}

	// Return status to the outside world
	done <- nil
	fmt.Println("Watching directory:", directory)

	stopChans[directory] = make(chan bool)

	for {
		select {
		case <-stopChans[directory]:
			delete(stopChans, directory)
			return
		case <-time.After(200 * time.Millisecond):
			{
				filesOnDisk, err := readAllFiles(directory)
				if err != nil {
					log.Fatal(err) // TODO: FIX
				}

				hashmapLen := len(hashmap)
				renamed := make(map[string]string)

				// TODO: Check whether we can open the file in r+ mode, if not
				// that means that the file is not fully written to disk yet (or is corrupted)
				for _, file := range filesOnDisk {
					if _, ok := hashmap[file.Name()]; !ok {
						if hashmapLen == len(filesOnDisk) {
							updateFunc(FSEvent{FS_RENAME, file.Name()})
							renamed[file.Name()] = file.Name()
						} else {
							updateFunc(FSEvent{FS_CREATE, file.Name()})
						}
						hashmap[file.Name()] = file.Name()
					}
				}

				for _, v := range hashmap {
					found := false
					for _, v2 := range filesOnDisk {
						if v == v2.Name() {
							found = true
							break
						}
					}
					if !found {
						if hashmapLen != len(filesOnDisk) {
							updateFunc(FSEvent{FS_DELETE, v})
						}
						delete(hashmap, v)
					}
				}
			}
		}
	}
}

func readAllFiles(directory string) ([]fs.DirEntry, error) {
	res, err := os.ReadDir(directory)
	if err != nil {
		log.Fatal(err)
	}
	return res, err
}
