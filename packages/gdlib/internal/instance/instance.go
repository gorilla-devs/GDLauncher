package instance

import (
	"encoding/json"
	"gdlib/internal/modloader"
	"gdlib/internal/modplatform"
	"os"
	"path"
)

type Instance struct {
	Name                    string                  `json:"name,omitempty"`
	Modloader               modloader.Modloader     `json:"modloader,omitempty"`
	ModloaderVersion        string                  `json:"modloaderVersion,omitempty"`
	Modplatform             modplatform.Modplatform `json:"modplatform,omitempty"`
	ModplatformProjectId    int                     `json:"modplatformProjectId,omitempty"`
	ModplatformFileId       int                     `json:"modplatformFileId,omitempty"`
	ModplatformOverrides    []string                `json:"modplatformOverrides,omitempty"`
	OriginalModplatformName string                  `json:"originalModplatformName,omitempty"`
	MinecraftVersion        string                  `json:"minecraftVersion,omitempty"`
	TimePlayed              int                     `json:"timePlayed,omitempty"`
	CustomBackground        string                  `json:"customBackground,omitempty"`
	OverrideJavaArgs        []string                `json:"overrideJavaArgs,omitempty"`
	OverrideJavaPath        string                  `json:"overrideJavaPath,omitempty"`
	OverrideMinecraftJar    string                  `json:"overrideMinecraftJar,omitempty"`
	Mods                    []string                `json:"mods,omitempty"`
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
	instancePath := path.Join(userData, "gdlauncher_next", "instances")
	instancesFromDir, err := os.ReadDir(instancePath)
	if err != nil {
		return instances, err
	}

	for _, instance := range instancesFromDir {
		// Read config.json
		instanceConfig, err := os.ReadFile(path.Join(instancePath, instance.Name(), "config.json"))
		if err != nil {
			continue
		}
		// Parse config.json
		var config Instance
		err = json.Unmarshal(instanceConfig, &config)
		if err != nil {
			continue
		}

		instances = append(instances, config)
	}

	return instances, nil
}
