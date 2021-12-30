package instance

import (
	"encoding/json"
	"errors"
	"fmt"
	"gdlib/internal"
	"gdlib/internal/modloader"
	"gdlib/internal/modplatform"
	"os"
	"path"
	"time"

	"github.com/gorilla/websocket"
)

type Instance struct {
	Name   string `json:"name,omitempty"`
	Loader struct {
		Modloader            modloader.Modloader     `json:"loaderType,omitempty"`
		ModloaderVersion     string                  `json:"loaderVersion,omitempty"`
		Modplatform          modplatform.Modplatform `json:"source,omitempty"`
		ModplatformProjectId int                     `json:"projectID,omitempty"`
		ModplatformFileId    int                     `json:"fileID,omitempty"`
		MinecraftVersion     string                  `json:"mcVersion,omitempty"`
	} `json:"loader,omitempty"`

	ModplatformOverrides    []string `json:"modplatformOverrides,omitempty"`
	OriginalModplatformName string   `json:"originalModplatformName,omitempty"`
	TimePlayed              int      `json:"timePlayed,omitempty"`
	CustomBackground        string   `json:"background,omitempty"`
	OverrideJavaArgs        []string `json:"overrideJavaArgs,omitempty"`
	OverrideJavaPath        string   `json:"overrideJavaPath,omitempty"`
	OverrideMinecraftJar    string   `json:"overrideMinecraftJar,omitempty"`
	// Mods                    []string `json:"mods,omitempty"`
}

const (
	INSTANCE_PATH_NAME = "instance"
)

var instances []Instance

func GetInstances() ([]Instance, error) {
	userData, err := os.UserConfigDir()
	if err != nil {
		panic(err)
	}
	instancesPath := path.Join(userData, "gdlauncher_next", "instances")
	instancesFromDir, err := os.ReadDir(instancesPath)
	if err != nil {
		return instances, err
	}

	for _, instance := range instancesFromDir {
		// Read config.json
		instanceConfig, err := os.ReadFile(path.Join(instancesPath, instance.Name(), "config.json"))
		if err != nil {
			fmt.Println(err)
			continue
		}
		// Parse config.json
		var config Instance
		err = json.Unmarshal(instanceConfig, &config)
		if err != nil {
			fmt.Println(err)
			continue
		}

		if config.Name == "" {
			config.Name = instance.Name()
		}

		instances = append(instances, config)
	}

	return instances, nil
}

func WatchInstances(c *websocket.Conn) error {
	userData, err := os.UserConfigDir()
	if err != nil {
		panic(err)
	}
	instancesPath := path.Join(userData, "gdlauncher_next", "instances")
	updateFunc := func(data internal.FSEvent) {
		fmt.Println(data)
	}

	var errChan = make(chan error)
	defer close(errChan)

	go internal.StartFSWatcher(instancesPath, updateFunc, errChan)

	select {
	case v := <-errChan:
		if v != nil {
			return v
		}
		return nil
	case <-time.After(5 * time.Second):
		return errors.New("timeout waiting for FSWatcher action to finish")
	}
}
