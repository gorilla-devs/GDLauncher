package settings

import (
	"encoding/json"
	"gdlib/internal/account"
	"os"
	"path"
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
		fd, err := os.Create(path.Join(getSettingsFilePath(), "config_temp.json"))
		if err != nil {
			panic(err)
		}

		if _, err = fd.WriteString(`{}`); err != nil {
			panic(err)
		}

		if err = fd.Sync(); err != nil {
			panic(err)
		}
		settingsBytes = []byte(`{}`)
		defer func() {
			err = fd.Close()
			if err != nil {
				panic(err)
			}
		}()
	}

	// Apply atomic rename
	os.Rename(path.Join(getSettingsFilePath(), "config_temp.json"), path.Join(getSettingsFilePath(), "config.json"))

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
