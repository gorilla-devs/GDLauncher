package main

import (
	"gdlib/adapters/socket"
	"gdlib/internal/instance"
	"gdlib/internal/java"
	"gdlib/internal/meta"
	"gdlib/internal/settings"
)

func main() {
	settings.Init()
	instance.Init()
	meta.InitManifests()
	java.Init()

	// for i := 0; i < 100; i++ {
	// 	instance.CreateInstance(internal.Instance{
	// 		Name: "test",
	// 		Type: internal.INSTANCE_TYPE_CLIENT,
	// 		Loader: internal.InstanceLoader{
	// 			Modloader:        modloader.Vanilla,
	// 			MinecraftVersion: "1.12.2",
	// 		},
	// 	})
	// }

	socket.StartServer()

}
