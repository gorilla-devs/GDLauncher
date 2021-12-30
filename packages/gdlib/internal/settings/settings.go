package settings

import (
	"encoding/json"
	"gdlib/internal/account"
	"os"
	"path"
	"strings"
	"sync"

	atom "github.com/natefinch/atomic"
)

type SettingsT struct {
	BasePath         string            `json:"basePath,omitempty"`
	OverrideJavaArgs []string          `json:"overrideJavaArgs,omitempty"`
	OverrideJavaPath string            `json:"overrideJavaPath,omitempty"`
	Language         string            `json:"language,omitempty"`
	Accounts         []account.Account `json:"accounts,omitempty"`
}

var settings SettingsT
var IsInitialized = false
var mux sync.Mutex

func init() {
	if err := os.MkdirAll(getSettingsFilePath(), os.ModePerm); err != nil {
		panic(err)
	}

	settingsBytes, err := os.ReadFile(path.Join(getSettingsFilePath(), "config.json"))
	if err != nil {
		r := strings.NewReader("{}")
		settingsBytes = []byte("{}")
		atom.WriteFile(path.Join(getSettingsFilePath(), "config.json"), r)
	}

	if err = json.Unmarshal(settingsBytes, &settings); err != nil {
		panic(err)
	}
	IsInitialized = true
}

func GetSettings() SettingsT {
	return settings
}

func SetSettings(s SettingsT) error {
	mux.Lock()
	settings = s
	err := writeSettings()
	mux.Unlock()
	return err
}

func writeSettings() error {
	b, err := json.Marshal(settings)
	if err != nil {
		return err
	}

	err = os.MkdirAll(getSettingsFilePath(), os.ModePerm)
	if err != nil {
		return err
	}

	r := strings.NewReader(string(b))
	atom.WriteFile(path.Join(getSettingsFilePath(), "config.json"), r)
	if err != nil {
		return err
	}
	return nil
}

func getSettingsFilePath() string {
	userData, err := os.UserConfigDir()
	if err != nil {
		panic(err)
	}
	return path.Join(userData, "gdlauncher_next")
}
