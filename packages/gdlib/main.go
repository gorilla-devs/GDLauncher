package main

import (
	"gdlib/adapters/socket"
	"gdlib/internal/instance"
	"gdlib/internal/java"
	"gdlib/internal/meta"
	"gdlib/internal/minecraft"
	"gdlib/internal/net"
	"gdlib/internal/settings"
)

func main() {
	settings.Init()
	instance.Init()
	meta.InitManifests()
	java.Init()

	err := net.DownloadClientMC("1.12.2")
	if err != nil {
		panic(err)
	}

	err = minecraft.Launch("hello", "1.12.2")
	if err != nil {
		panic(err)
	}

	socket.StartServer()

}
