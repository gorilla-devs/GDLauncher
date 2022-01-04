package instance

import (
	"encoding/json"
	"errors"
	"fmt"
	"gdlib/adapters/socket/events"
	"gdlib/internal"
	"gdlib/internal/minecraft"
	"os"
	"path"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var instances map[string]internal.Instance = make(map[string]internal.Instance, 20)

func Init() {
	instancesPath := path.Join(internal.GDL_USER_DATA, "instances")
	instancesFromDir, err := os.ReadDir(instancesPath)
	if err != nil {
		err = os.MkdirAll(instancesPath, 0755)
		if err != nil {
			panic(err)
		}
	}

	for _, instance := range instancesFromDir {
		config, err := readInstanceConfig(instance.Name())
		if err != nil {
			fmt.Println(err)
			continue
		}
		instances[instance.Name()] = config
	}
}

func GetInstances() map[string]internal.Instance {
	return instances
}

type InstanceFSEvent struct {
	EventType int               `json:"eventType,omitempty"`
	Path      string            `json:"path,omitempty"`
	Instance  internal.Instance `json:"instance,omitempty"`
}

func WatchInstances(c *websocket.Conn) error {
	instancesPath := path.Join(internal.GDL_USER_DATA, "instances")

	updateFunc := func(data internal.FSEvent) {
		respData := InstanceFSEvent{
			EventType: data.Type,
			Path:      data.Path,
		}

		switch data.Type {
		case internal.FS_CREATE:
			instanceConfig, err := readInstanceConfig(path.Base(data.Path))
			if err != nil {
				fmt.Println(err)
				return
			}
			respData.Instance = instanceConfig
			instances[data.Path] = instanceConfig
		case internal.FS_DELETE:
			delete(instances, data.Path)
		}

		newResp := internal.SocketResponse{
			Data:      respData,
			Id:        fmt.Sprint(time.Now().Unix()),
			Timestamp: time.Now().Unix(),
			Type:      events.InstanceUpdate,
		}

		err := c.WriteJSON(newResp)
		if err != nil {
			fmt.Println(err)
		}
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

func CreateInstance(i internal.Instance) error {
	instanceFolderPath := uuid.New().String()

	// Generate instanceFolderPath name
	instancePath := path.Join(internal.GDL_USER_DATA, internal.GDL_INSTANCES_PREFIX, instanceFolderPath)
	// Create instance folder
	err := os.MkdirAll(instancePath, os.ModePerm)
	if err != nil {
		return err
	}

	b, err := json.Marshal(i)
	if err != nil {
		return err
	}

	os.WriteFile(path.Join(instancePath, "config.json"), b, os.ModePerm)

	return nil
}

func StartInstance(instanceFolderPath string) error {
	instance, ok := instances[instanceFolderPath]
	if !ok {
		return errors.New("instance not found")
	}

	if instance.Type == internal.INSTANCE_TYPE_SERVER {
		serverJarPath := path.Join(
			internal.GDL_USER_DATA,
			internal.GDL_DATASTORE_PREFIX,
			internal.GDL_SERVERS_PREFIX,
			fmt.Sprint(instance.Loader.MinecraftVersion, ".jar"),
		)
		return minecraft.StartServer(serverJarPath, instanceFolderPath, instance)
	} else if instance.Type == internal.INSTANCE_TYPE_CLIENT {
		return minecraft.LaunchClient(instanceFolderPath, instance.Loader.MinecraftVersion)
	}

	return nil
}

func readInstanceConfig(instanceName string) (internal.Instance, error) {
	// Read config.json
	instancesPath := path.Join(internal.GDL_USER_DATA, internal.GDL_INSTANCES_PREFIX)
	instanceConfig, err := os.ReadFile(path.Join(instancesPath, instanceName, "config.json"))
	if err != nil {
		fmt.Println(err)
		return internal.Instance{}, err
	}
	// Parse config.json
	var config internal.Instance
	err = json.Unmarshal(instanceConfig, &config)
	if err != nil {
		fmt.Println(err)
		return internal.Instance{}, err
	}

	if config.Name == "" {
		config.Name = instanceName
	}
	if config.Type == internal.INSTANCE_TYPE_UNDEFINED {
		config.Type = internal.INSTANCE_TYPE_CLIENT
	}

	return config, nil
}
