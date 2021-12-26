package instance

import (
	"fmt"
	"gdl-s/gdlib"
	"log"
	"os"
)

type Modloader int
type Source int

const (
	FORGE Modloader = iota
	FABRIC
	VANILLA
)

const (
	CURSEFORGE Source = iota
	FTB
	MODRINTH
)

type Instance struct {
	Name      string
	Path      string
	Modloader Modloader
	Source    Source
}

var instances = make(map[string]Instance)

const directory = `C:\Users\david\AppData\Roaming\gdlauncher_next\instances`

func InitInstancesListener() {
	res, err := os.ReadDir(directory)
	if err != nil {
		log.Fatal(err)
	}

	for _, v := range res {
		instances[v.Name()] = Instance{
			Name: v.Name(),
		}
	}

	done := make(chan error)
	gdlib.StartFSWatcher(
		directory,
		func(event gdlib.FSEvent) {
			fmt.Println(event)
		},
		done,
	)
}

func GetInstances() map[string]Instance {
	return instances
}
