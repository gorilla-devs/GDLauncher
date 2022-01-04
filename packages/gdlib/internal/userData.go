package internal

import (
	"fmt"
	"os"
	"path"
)

var GDL_USER_DATA = ""

const GDL_USER_DATA_PREFIX = "gdlauncher_next"

func init() {
	getGDLUserData()
}

func getGDLUserData() {
	userData, err := os.UserConfigDir()
	if err != nil {
		panic(err)
	}

	if err := os.MkdirAll(path.Join(userData, GDL_USER_DATA_PREFIX), os.ModePerm); err != nil {
		panic(err)
	}

	// Check if there is an override for the user data path
	overrideFile, err := os.ReadFile(
		path.Join(userData, GDL_USER_DATA_PREFIX, "override.data"),
	)

	if err == nil {
		fmt.Println("Found override userdata")
		GDL_USER_DATA = string(overrideFile)
	} else {
		GDL_USER_DATA = path.Join(userData, GDL_USER_DATA_PREFIX)
	}

	fmt.Println("Userdata path ->", GDL_USER_DATA)
}
