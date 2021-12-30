package java

import (
	"time"
)

type OpenJDKType struct {
	Os           string `json:"os"`
	Architecture string `json:"architecture"`
	BinaryType   string `json:"binary_type"`
	OpenjdkImpl  string `json:"openjdk_impl"`
	BinaryName   string `json:"binary_name"`
	BinaryLink   string `json:"binary_link"`
	BinarySize   int    `json:"binary_size"`
	ChecksumLink string `json:"checksum_link"`
	Version      string `json:"version"`
	VersionData  struct {
		OpenjdkVersion string `json:"openjdk_version"`
		Semver         string `json:"semver"`
	} `json:"version_data"`
	HeapSize               string    `json:"heap_size"`
	DownloadCount          int       `json:"download_count"`
	UpdatedAt              time.Time `json:"updated_at"`
	Timestamp              time.Time `json:"timestamp"`
	ReleaseName            string    `json:"release_name"`
	ReleaseLink            string    `json:"release_link"`
	InstallerName          string    `json:"installer_name,omitempty"`
	InstallerLink          string    `json:"installer_link,omitempty"`
	InstallerSize          int       `json:"installer_size,omitempty"`
	InstallerChecksumLink  string    `json:"installer_checksum_link,omitempty"`
	InstallerDownloadCount int       `json:"installer_download_count,omitempty"`
}

const LATEST_JAVA_VERSION = 17
const JAVA_MANIFEST_URL = "https://cdn.assets-gdevs.com/openjdk8.json"
const JAVA_LATEST_MANIFEST_URL = "https://cdn.assets-gdevs.com/openjdk17.json"
