package gdlib

import (
	"io/fs"
	"log"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

var dirsToWatch []string

func startFSWatcher(directory string, c *websocket.Conn, done chan<- error) {
	// Check if we're not watching that directory already
	dirsToWatch = append(dirsToWatch, directory)

	for _, dir := range dirsToWatch {
		// This should release the channel as soon as it's done initializing
		go watchDirectory(dir, done)
	}
}

func stopFSWatcher(directory string, c *websocket.Conn, done chan<- error) {

	done <- nil
}

// This function should release the channel as soon as it's done initializing
func watchDirectory(directory string, done chan<- error) {
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

	for {
		filesOnDisk, err := readAllFiles(directory)
		if err != nil {
			log.Fatal(err)
		}

		hashmapLen := len(hashmap)
		renamed := make(map[string]string)

		// TODO: Check whether we can open the file in r+ mode, if not
		// that means that the file is not fully written to disk yet (or is corrupted)
		for _, file := range filesOnDisk {
			if _, ok := hashmap[file.Name()]; !ok {
				if hashmapLen == len(filesOnDisk) {
					log.Println("rename:", file.Name())
					renamed[file.Name()] = file.Name()
				} else {
					log.Println("new file detected:", file.Name())
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
					log.Println("file removed:", v, hashmapLen, len(filesOnDisk))
				}
				delete(hashmap, v)
			}
		}

		time.Sleep(time.Millisecond * 250)
	}
}

func readAllFiles(directory string) ([]fs.DirEntry, error) {
	res, err := os.ReadDir(directory)
	if err != nil {
		log.Fatal(err)
	}
	return res, err
}
