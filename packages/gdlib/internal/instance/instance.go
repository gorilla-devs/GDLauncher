package instance

import (
	"encoding/json"
	"errors"
	"fmt"
	"gdlib/adapters/socket/events"
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
	Mods                    []struct {
		DisplayName         string   `json:"displayName,omitempty"`
		FileName            string   `json:"fileName,omitempty"`
		FileDate            string   `json:"fileDate,omitempty"`
		DownloadUrl         string   `json:"downloadUrl,omitempty"`
		PackageFingerprint  uint64   `json:"packageFingerprint,omitempty"`
		GameVersion         []string `json:"gameVersion,omitempty"`
		SortableGameVersion []struct {
			GameVersion            string `json:"gameVersion,omitempty"`
			GameVersionReleaseDate string `json:"gameVersionReleaseDate,omitempty"`
			GameVersionName        string `json:"gameVersionName,omitempty"`
		} `json:"sortableGameVersion,omitempty"`
		CategorySectionPackageType uint   `json:"categorySectionPackageType,omitempty"`
		ProjectStatus              uint   `json:"projectStatus,omitempty"`
		ProjectId                  uint   `json:"projectId,omitempty"`
		FileId                     uint   `json:"fileId,omitempty"`
		IsServerPack               bool   `json:"isServerPack,omitempty"`
		ServerPackFileId           uint   `json:"serverPackFileId,omitempty"`
		DownloadCount              uint   `json:"downloadCount,omitempty"`
		Name                       string `json:"name,omitempty"`
	} `json:"mods,omitempty"`
}

const (
	INSTANCE_PATH_NAME = "instance"
)

var instances map[string]Instance = make(map[string]Instance, 20)

func Init() {
	instancesPath := path.Join(internal.GDL_USER_DATA, "instances")
	instancesFromDir, err := os.ReadDir(instancesPath)
	if err != nil {
		panic(err)
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

func GetInstances() map[string]Instance {
	return instances
}

type InstanceFSEvent struct {
	EventType int      `json:"eventType,omitempty"`
	Path      string   `json:"path,omitempty"`
	Instance  Instance `json:"instance,omitempty"`
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
			Type:      events.Instances,
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

func readInstanceConfig(instanceName string) (Instance, error) {
	// Read config.json
	instancesPath := path.Join(internal.GDL_USER_DATA, "instances")
	instanceConfig, err := os.ReadFile(path.Join(instancesPath, instanceName, "config.json"))
	if err != nil {
		fmt.Println(err)
		return Instance{}, err
	}
	// Parse config.json
	var config Instance
	err = json.Unmarshal(instanceConfig, &config)
	if err != nil {
		fmt.Println(err)
		return Instance{}, err
	}

	if config.Name == "" {
		config.Name = instanceName
	}

	return config, nil
}
