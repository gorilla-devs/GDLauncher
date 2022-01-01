package main

import (
	"gdlib/adapters/socket"
	"gdlib/internal"
	"gdlib/internal/instance"
	"gdlib/internal/java"
	"gdlib/internal/meta"
	"gdlib/internal/settings"
)

func main() {
	internal.GetGDLUserData()
	settings.Init()
	instance.Init()
	meta.InitManifests()
	java.Init()

	socket.StartServer()

}
