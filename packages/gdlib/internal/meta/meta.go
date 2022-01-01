package meta

import (
	"bytes"
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"gdlib/internal"
	"io"
	"net/http"
	"os"
	"path"
	"sync"

	"github.com/mitchellh/mapstructure"
)

const META_FOLDER_PREFIX = "meta"

var FORGE_CACHE = ForgeMetaManifest{}
var FABRIC_CACHE = FabricMetaManifest{}
var MOJANG_CACHE = MojangMetaManifest{}

func InitManifests() {
	os.MkdirAll(path.Join(internal.GDL_USER_DATA, META_FOLDER_PREFIX), os.ModePerm)
	funcs := []func(*sync.WaitGroup){
		initForgeManifest,
		initFabricManifest,
		initMojangManifest,
	}

	var wg sync.WaitGroup
	for _, f := range funcs {
		wg.Add(1)
		go f(&wg)
	}

	wg.Wait()
}

type ForgeMetaManifest struct {
	Versions []ForgeMetaVersion `json:"versions"`
}

type ForgeMetaVersion struct {
	MCVersion     string   `json:"mcversion"`
	ForgeVersions []string `json:"forgeVersions"`
}

func initForgeManifest(wg *sync.WaitGroup) {
	res, err := fetchManifest("https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json")
	if err != nil {
		fmt.Println("Failed to fetch forge manifest", err)
		return
	}

	var mappedRes ForgeMetaManifest
	for k, v := range res.(map[string]interface{}) {
		forgeVersions := make([]string, 300)
		for _, vv := range v.([]interface{}) {
			forgeVersions = append(forgeVersions, vv.(string))
		}
		mappedRes.Versions = append(mappedRes.Versions, ForgeMetaVersion{
			MCVersion:     k,
			ForgeVersions: forgeVersions,
		})
	}

	FORGE_CACHE = mappedRes
	wg.Done()
}

type FabricMetaManifest struct {
	Game []struct {
		Version string `json:"version"`
		Stable  bool   `json:"stable"`
	} `json:"game"`
	Mappings []struct {
		GameVersion string `json:"gameVersion"`
		Separator   string `json:"separator"`
		Build       int    `json:"build"`
		Maven       string `json:"maven"`
		Version     string `json:"version"`
		Stable      bool   `json:"stable"`
	} `json:"mappings"`
	Intermediary []struct {
		Maven   string `json:"maven"`
		Version string `json:"version"`
		Stable  bool   `json:"stable"`
	} `json:"intermediary"`
	Loader []struct {
		Separator string `json:"separator"`
		Build     int    `json:"build"`
		Maven     string `json:"maven"`
		Version   string `json:"version"`
		Stable    bool   `json:"stable"`
	} `json:"loader"`
	Installer []struct {
		Url     string `json:"url"`
		Maven   string `json:"maven"`
		Version string `json:"version"`
		Stable  bool   `json:"stable"`
	} `json:"installer"`
}

func initFabricManifest(wg *sync.WaitGroup) {
	res, err := fetchManifest("https://meta.fabricmc.net/v2/versions")
	if err != nil {
		fmt.Println("Failed to fetch fabric manifest", err)
		return
	}

	var mappedRes FabricMetaManifest
	err = mapstructure.Decode(res, &mappedRes)
	if err != nil {
		fmt.Println("Failed to decode fabric manifest", err)
		return
	}

	FABRIC_CACHE = mappedRes
	wg.Done()
}

type MojangMetaManifest struct {
	Latest struct {
		Release  string `json:"release"`
		Snapshot string `json:"snapshot"`
	} `json:"latest"`
	Versions []struct {
		ID          string `json:"id"`
		Type        string `json:"type"`
		Url         string `json:"url"`
		Time        string `json:"time"`
		ReleaseTime string `json:"releaseTime"`
	} `json:"versions"`
}

func initMojangManifest(wg *sync.WaitGroup) {
	res, err := fetchManifest("https://launchermeta.mojang.com/mc/game/version_manifest.json")
	if err != nil {
		fmt.Println("Failed to fetch fabric manifest", err)
		return
	}

	var mappedRes MojangMetaManifest
	err = mapstructure.Decode(res, &mappedRes)
	if err != nil {
		fmt.Println("Failed to decode mojang manifest", err)
		return
	}

	// Ensure data is in correct format
	MOJANG_CACHE = mappedRes
	wg.Done()
}

func fetchManifest(url string) (interface{}, error) {
	// Get url hash
	hash := sha1.New()
	hash.Write([]byte(url))
	hashStr := fmt.Sprintf("%x", hash.Sum(nil))
	cachePath := path.Join(internal.GDL_USER_DATA, META_FOLDER_PREFIX, hashStr)

	var data interface{}

	res, err := http.Get(url)
	// If API call fails, try to load from cache
	if err != nil {
		fmt.Println("Failed to fetch manifest. Trying to load from cache.", err)
		fd, err := os.Open(cachePath)
		if err != nil {
			return nil, err
		}
		defer fd.Close()
		err = json.NewDecoder(fd).Decode(&data)
		if err != nil {
			return nil, err
		}
		fmt.Println("Loaded from cache.", err)
		return data, nil
	}
	defer res.Body.Close()

	// Write to cache
	fd, err := os.Create(cachePath)
	if err != nil {
		return nil, err
	}
	defer fd.Close()

	b, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	buffer := new(bytes.Buffer)
	err = json.Compact(buffer, b)
	if err != nil {
		return nil, err
	}

	_, err = fd.Write(buffer.Bytes())
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(b, &data)
	if err != nil {
		return nil, err
	}
	return data, nil
}
