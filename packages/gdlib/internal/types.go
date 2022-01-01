package internal

import (
	"gdlib/internal/modloader"
	"gdlib/internal/modplatform"
)

type SocketResponse struct {
	Type      int         `json:"type"`
	Id        string      `json:"id"`
	Timestamp int64       `json:"timestamp"`
	Err       string      `json:"error,omitempty"`
	Data      interface{} `json:"data"`
}

type MojangMeta struct {
	Arguments struct {
		Game []interface{} `json:"game"`
		Jvm  []struct {
			Rules []struct {
				Action string `json:"action"`
				Os     struct {
					Name string `json:"name"`
				} `json:"os"`
			} `json:"rules"`
			Value []string `json:"value"`
		} `json:"jvm"`
	} `json:"arguments"`
	AssetIndex struct {
		ID        string `json:"id"`
		Sha1      string `json:"sha1"`
		Size      int64  `json:"size"`
		TotalSize int64  `json:"totalSize"`
		URL       string `json:"url"`
	} `json:"assetIndex"`
	Assets          string `json:"assets"`
	ComplianceLevel int64  `json:"complianceLevel"`
	Downloads       struct {
		Client struct {
			Sha1 string `json:"sha1"`
			Size int64  `json:"size"`
			URL  string `json:"url"`
		} `json:"client"`
		ClientMappings struct {
			Sha1 string `json:"sha1"`
			Size int64  `json:"size"`
			URL  string `json:"url"`
		} `json:"client_mappings"`
		Server struct {
			Sha1 string `json:"sha1"`
			Size int64  `json:"size"`
			URL  string `json:"url"`
		} `json:"server"`
		ServerMappings struct {
			Sha1 string `json:"sha1"`
			Size int64  `json:"size"`
			URL  string `json:"url"`
		} `json:"server_mappings"`
	} `json:"downloads"`
	ID          string `json:"id"`
	JavaVersion struct {
		Component    string `json:"component"`
		MajorVersion int64  `json:"majorVersion"`
	} `json:"javaVersion"`
	Libraries []struct {
		Downloads struct {
			Artifact struct {
				Path string `json:"path"`
				Sha1 string `json:"sha1"`
				Size int64  `json:"size"`
				URL  string `json:"url"`
			} `json:"artifact"`
			Classifiers struct {
				Javadoc struct {
					Path string `json:"path"`
					Sha1 string `json:"sha1"`
					Size int64  `json:"size"`
					URL  string `json:"url"`
				} `json:"javadoc"`
				Natives_linux struct {
					Path string `json:"path"`
					Sha1 string `json:"sha1"`
					Size int64  `json:"size"`
					URL  string `json:"url"`
				} `json:"natives-linux"`
				Natives_macos struct {
					Path string `json:"path"`
					Sha1 string `json:"sha1"`
					Size int64  `json:"size"`
					URL  string `json:"url"`
				} `json:"natives-macos"`
				Natives_osx struct {
					Path string `json:"path"`
					Sha1 string `json:"sha1"`
					Size int64  `json:"size"`
					URL  string `json:"url"`
				} `json:"natives-osx"`
				Natives_windows struct {
					Path string `json:"path"`
					Sha1 string `json:"sha1"`
					Size int64  `json:"size"`
					URL  string `json:"url"`
				} `json:"natives-windows"`
				Sources struct {
					Path string `json:"path"`
					Sha1 string `json:"sha1"`
					Size int64  `json:"size"`
					URL  string `json:"url"`
				} `json:"sources"`
			} `json:"classifiers"`
		} `json:"downloads"`
		Extract struct {
			Exclude []string `json:"exclude"`
		} `json:"extract"`
		Name    string `json:"name"`
		Natives struct {
			Linux   string `json:"linux"`
			Osx     string `json:"osx"`
			Windows string `json:"windows"`
		} `json:"natives"`
		Rules []struct {
			Action string `json:"action"`
			Os     struct {
				Name string `json:"name"`
			} `json:"os"`
		} `json:"rules"`
	} `json:"libraries"`
	Logging struct {
		Client struct {
			Argument string `json:"argument"`
			File     struct {
				ID   string `json:"id"`
				Sha1 string `json:"sha1"`
				Size int64  `json:"size"`
				URL  string `json:"url"`
			} `json:"file"`
			Type string `json:"type"`
		} `json:"client"`
	} `json:"logging"`
	MainClass              string `json:"mainClass"`
	MinimumLauncherVersion int64  `json:"minimumLauncherVersion"`
	ReleaseTime            string `json:"releaseTime"`
	Time                   string `json:"time"`
	Type                   string `json:"type"`
}

type InstanceType string

const (
	INSTANCE_TYPE_UNDEFINED InstanceType = ""
	INSTANCE_TYPE_SERVER    InstanceType = "server"
	INSTANCE_TYPE_CLIENT    InstanceType = "client"
)

type Instance struct {
	Name   string       `json:"name,omitempty"`
	Type   InstanceType `json:"type,omitempty"`
	Loader struct {
		Modloader            modloader.Modloader     `json:"loaderType,omitempty"`
		ModloaderVersion     string                  `json:"loaderVersion,omitempty"`
		Modplatform          modplatform.Modplatform `json:"source,omitempty"`
		ModplatformProjectId int                     `json:"projectID,omitempty"`
		ModplatformFileId    int                     `json:"fileID,omitempty"`
		MinecraftVersion     string                  `json:"mcVersion,omitempty"`
	} `json:"loader,omitempty"`

	ModplatformOverrides    []string `json:"modplatformOverrides,omitempty"`
	OriginalModplatformName string   `json:"originalModplatformName,omitempty"`
	TimePlayed              int      `json:"timePlayed,omitempty"`
	CustomBackground        string   `json:"background,omitempty"`
	OverrideJavaArgs        []string `json:"overrideJavaArgs,omitempty"`
	OverrideJavaPath        string   `json:"overrideJavaPath,omitempty"`
	OverrideMinecraftJar    string   `json:"overrideMinecraftJar,omitempty"`
	Mods                    []struct {
		DisplayName         string   `json:"displayName,omitempty"`
		FileName            string   `json:"fileName,omitempty"`
		FileDate            string   `json:"fileDate,omitempty"`
		DownloadUrl         string   `json:"downloadUrl,omitempty"`
		PackageFingerprint  uint64   `json:"packageFingerprint,omitempty"`
		GameVersion         []string `json:"gameVersion,omitempty"`
		SortableGameVersion []struct {
			GameVersion            string `json:"gameVersion,omitempty"`
			GameVersionReleaseDate string `json:"gameVersionReleaseDate,omitempty"`
			GameVersionName        string `json:"gameVersionName,omitempty"`
		} `json:"sortableGameVersion,omitempty"`
		CategorySectionPackageType uint   `json:"categorySectionPackageType,omitempty"`
		ProjectStatus              uint   `json:"projectStatus,omitempty"`
		ProjectId                  uint   `json:"projectId,omitempty"`
		FileId                     uint   `json:"fileId,omitempty"`
		IsServerPack               bool   `json:"isServerPack,omitempty"`
		ServerPackFileId           uint   `json:"serverPackFileId,omitempty"`
		DownloadCount              uint   `json:"downloadCount,omitempty"`
		Name                       string `json:"name,omitempty"`
	} `json:"mods,omitempty"`
}
