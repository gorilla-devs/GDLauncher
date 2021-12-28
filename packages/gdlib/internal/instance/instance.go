package instance

import (
	"gdlauncher/internal/modloader"
	"gdlauncher/internal/modplatform"
)

type Instance struct {
	Name                    string
	Modloader               modloader.Modloader
	ModloaderVersion        string
	Modplatform             modplatform.Modplatform
	ModplatformProjectId    int
	ModplatformFileId       int
	ModplatformOverrides    []string
	OriginalModplatformName string
	MinecraftVersion        string
	TimePlayed              int
	CustomBackground        string
	OverrideJavaArgs        []string
	OverrideJavaPath        string
	OverrideMinecraftJar    string
	Mods                    []string
}

const (
	INSTANCE_PATH_NAME = "instance"
)

func GetInstances() []Instance {

}
