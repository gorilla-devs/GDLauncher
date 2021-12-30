package main

import (
	"gdlib/adapters/socket"
	"gdlib/internal"
	"gdlib/internal/instance"
	"gdlib/internal/java"
	"gdlib/internal/settings"
)

func main() {
	internal.GetGDLUserData()
	settings.Init()
	instance.Init()
	java.Init()

	socket.StartServer()

}
