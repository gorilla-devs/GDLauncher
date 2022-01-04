package minecraft

import (
	"gdlib/internal"
	"runtime"
)

func convertOsToMCOS(os string) string {
	switch os {
	case "windows":
		return "windows"
	case "linux":
		return "linux"
	case "darwin":
		return "osx"
	default:
		return ""
	}
}

func AllowLib(rules []internal.MojangMetaLibraryRule) bool {
	if len(rules) == 0 {
		return true
	}

	action := false
	for _, rule := range rules {
		os := rule.Os.Name
		if rule.Action == "allow" && (os == "" || os == convertOsToMCOS(runtime.GOOS)) {
			action = true
		} else if rule.Action == "disallow" && (os == "" || os == convertOsToMCOS(runtime.GOOS)) {
			action = false
		}
	}

	return action
}
