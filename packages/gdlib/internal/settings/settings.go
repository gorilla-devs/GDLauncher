package settings

import (
	"encoding/json"
	"gdlauncher/internal/account"
	"os"
	"path"
)

type Settings struct {
	BasePath         string
	OverrideJavaArgs []string
	OverrideJavaPath string
	Language         string
	Accounts         []account.Account
}

var settings Settings
var IsInitialized = false

func init() {
	if err := os.MkdirAll(getSettingsFilePath(), os.ModePerm); err != nil {
		panic(err)
	}

	settingsBytes, err := os.ReadFile(getSettingsFilePath())
	if err != nil {
		// TODO: Create settings file
		panic(err)
	}

	if err = json.Unmarshal(settingsBytes, &settings); err != nil {
		panic(err)
	}
	IsInitialized = true
}

func UpdateSettings() error {
	b, err := json.Marshal(settings)
	if err != nil {
		return err
	}

	err = os.MkdirAll(getSettingsFilePath(), os.ModePerm)
	if err != nil {
		return err
	}

	err = os.WriteFile(getSettingsFilePath(), b, os.ModePerm)
	if err != nil {
		return err
	}
	return nil
}

func GetSettings() Settings {
	return settings
}

func getSettingsFilePath() string {
	userData, err := os.UserConfigDir()
	if err != nil {
		panic(err)
	}
	return path.Join(userData, "gdlauncher_next")
}
