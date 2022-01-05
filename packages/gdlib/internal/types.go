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
	AssetIndex      MojangMetaIndex     `json:"assetIndex"`
	Assets          string              `json:"assets"`
	ComplianceLevel int64               `json:"complianceLevel"`
	Downloads       MojangMetaDownloads `json:"downloads"`
	ID              string              `json:"id"`
	JavaVersion     struct {
		Component    string `json:"component"`
		MajorVersion int64  `json:"majorVersion"`
	} `json:"javaVersion"`
	Libraries              []MojangMetaLibrary      `json:"libraries"`
	Logging                MojangMetaLibraryLogging `json:"logging"`
	MainClass              string                   `json:"mainClass"`
	MinecraftArguments     string                   `json:"minecraftArguments"`
	MinimumLauncherVersion int64                    `json:"minimumLauncherVersion"`
	ReleaseTime            string                   `json:"releaseTime"`
	Time                   string                   `json:"time"`
	Type                   string                   `json:"type"`
}

type MojangMetaDownloads struct {
	Client         MojangMetaDownloadsClient `json:"client"`
	ClientMappings struct {
		Sha1 string `json:"sha1"`
		Size int64  `json:"size"`
		URL  string `json:"url"`
	} `json:"client_mappings"`
	Server         MojangMetaDownloadsServer `json:"server"`
	ServerMappings struct {
		Sha1 string `json:"sha1"`
		Size int64  `json:"size"`
		URL  string `json:"url"`
	} `json:"server_mappings"`
}

type MojangMetaDownloadsClient struct {
	Sha1 string `json:"sha1"`
	Size int64  `json:"size"`
	URL  string `json:"url"`
}

type MojangMetaIndex struct {
	ID        string `json:"id"`
	Sha1      string `json:"sha1"`
	Size      int64  `json:"size"`
	TotalSize int64  `json:"totalSize"`
	URL       string `json:"url"`
}

type MojangMetaLibrary struct {
	Downloads struct {
		Artifact struct {
			Path string `json:"path"`
			Sha1 string `json:"sha1"`
			Size int    `json:"size"`
			URL  string `json:"url"`
		} `json:"artifact"`
		Classifiers struct {
			Javadoc         MojangMetaLibraryEntity `json:"javadoc"`
			Natives_linux   MojangMetaLibraryEntity `json:"natives-linux"`
			Natives_macos   MojangMetaLibraryEntity `json:"natives-macos"`
			Natives_osx     MojangMetaLibraryEntity `json:"natives-osx"`
			Natives_windows MojangMetaLibraryEntity `json:"natives-windows"`
			Sources         MojangMetaLibraryEntity `json:"sources"`
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
	Rules []MojangMetaLibraryRule `json:"rules"`
}

type MojangMetaLibraryEntity struct {
	Path string `json:"path"`
	Sha1 string `json:"sha1"`
	Size int    `json:"size"`
	URL  string `json:"url"`
}

type MojangMetaLibraryRule struct {
	Action string `json:"action"`
	Os     struct {
		Name string `json:"name"`
	} `json:"os"`
}

type MojangMetaDownloadsServer struct {
	Sha1 string `json:"sha1"`
	Size int64  `json:"size"`
	URL  string `json:"url"`
}

type MojangMetaLibraryLogging struct {
	Client struct {
		Argument string `json:"argument"`
		File     struct {
			ID   string `json:"id"`
			Sha1 string `json:"sha1"`
			Size int    `json:"size"`
			URL  string `json:"url"`
		} `json:"file"`
		Type string `json:"type"`
	} `json:"client"`
}

type InstanceType string

const (
	INSTANCE_TYPE_UNDEFINED InstanceType = ""
	INSTANCE_TYPE_SERVER    InstanceType = "server"
	INSTANCE_TYPE_CLIENT    InstanceType = "client"
)

type InstanceLoader struct {
	Modloader modloader.Modloader `json:"loaderType,omitempty"`
	// If modloader is vanilla, ModloaderVersion should be empty
	ModloaderVersion     string                  `json:"loaderVersion,omitempty"`
	Modplatform          modplatform.Modplatform `json:"source,omitempty"`
	ModplatformProjectId int                     `json:"projectID,omitempty"`
	ModplatformFileId    int                     `json:"fileID,omitempty"`
	MinecraftVersion     string                  `json:"mcVersion,omitempty"`
}

type Instance struct {
	Name   string         `json:"name,omitempty"`
	Type   InstanceType   `json:"type,omitempty"`
	Loader InstanceLoader `json:"loader,omitempty"`

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
