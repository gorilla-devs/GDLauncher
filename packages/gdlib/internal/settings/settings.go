package settings

import (
	"encoding/json"
	"gdlib/internal/account"
	"os"
	"path"
	"strings"

	"github.com/natefinch/atomic"
)

type Settings struct {
	BasePath         string            `json:"basePath"`
	OverrideJavaArgs []string          `json:"overrideJavaArgs"`
	OverrideJavaPath string            `json:"overrideJavaPath"`
	Language         string            `json:"language"`
	Accounts         []account.Account `json:"accounts"`
}

var settings Settings
var IsInitialized = false

func init() {
	if err := os.MkdirAll(getSettingsFilePath(), os.ModePerm); err != nil {
		panic(err)
	}

	settingsBytes, err := os.ReadFile(path.Join(getSettingsFilePath(), "config.json"))
	if err != nil {
		r := strings.NewReader("{}")
		settingsBytes = []byte("{}")
		atomic.WriteFile(path.Join(getSettingsFilePath(), "config.json"), r)
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
