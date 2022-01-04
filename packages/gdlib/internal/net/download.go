package net

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"gdlib/internal"
	"gdlib/internal/meta"
	"gdlib/internal/minecraft"
	"io"
	"net/http"
	"os"
	"path"
	"runtime"
	"sync"
	"time"

	"github.com/mitchellh/mapstructure"
)

var minecraftNetPath = path.Join(
	internal.GDL_USER_DATA,
	internal.GDL_DATASTORE_PREFIX,
	internal.GDL_LIBRARIES_PREFIX,
	"net",
	"minecraft",
)

func DownloadClientMC(mcVersion string) error {
	var url string
	for _, v := range meta.MOJANG_CACHE.Versions {
		if v.ID == mcVersion {
			url = v.Url
			break
		}
	}

	if url == "" {
		return fmt.Errorf("no meta for %s", mcVersion)
	}

	mcMeta, err := downloadVersionInfo(url)
	if err != nil {
		return err
	}

	err = downloadClient(mcMeta.ID, mcMeta.Downloads.Client)
	if err != nil {
		return err
	} else if mcMeta.AssetIndex.URL == "" {
		return fmt.Errorf("no assets index url for %s", mcVersion)
	}

	assetsMeta, err := downloadAssetsIndex(mcMeta.ID, mcMeta.AssetIndex.URL)
	if err != nil {
		return err
	}

	// Retrieve libs and assets
	objects, ok := assetsMeta["objects"]
	if !ok {
		return fmt.Errorf("no objects in assets index for %s", mcVersion)
	}

	var wg sync.WaitGroup
	semaphore := make(chan bool, runtime.NumCPU())
	for _, v := range objects.(map[string]interface{}) {
		semaphore <- true
		wg.Add(1)
		asset := v.(map[string]interface{})
		if asset["hash"].(string) == "" {
			return fmt.Errorf("no hash in asset %s", asset["hash"].(string))
		}

		go func(asset interface{}) {
			var a Asset
			mapstructure.Decode(asset, &a)
			downloadAsset(a)
			wg.Done()
			<-semaphore
		}(asset)
	}

	wg.Wait()

	for _, v := range minecraft.GatherLibraries(mcMeta.Libraries) {
		semaphore <- true
		wg.Add(1)
		go func(v internal.MojangMetaLibrary) {
			downloadLibrary(v)
			wg.Done()
			<-semaphore
		}(v)
	}

	wg.Wait()

	return nil
}

func downloadServerMC(mcVersion string) error {
	return downloadServerClient(mcVersion)
}

func downloadVersionInfo(url string) (internal.MojangMeta, error) {
	var mcMeta internal.MojangMeta
	resp, err := http.Get(url)
	if err != nil {
		return mcMeta, err
	}
	defer resp.Body.Close()
	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return mcMeta, err
	}

	err = json.Unmarshal(respData, &mcMeta)
	if err != nil {
		return mcMeta, err
	}

	err = os.MkdirAll(minecraftNetPath, os.ModePerm)
	if err != nil {
		return mcMeta, err
	}

	// Write json to file
	err = os.WriteFile(
		path.Join(
			minecraftNetPath,
			fmt.Sprint(mcMeta.ID, ".json"),
		),
		respData,
		os.ModePerm,
	)

	if err != nil {
		return mcMeta, err
	}

	if mcMeta.Downloads.Client.URL == "" {
		return mcMeta, fmt.Errorf("no client url for %s", url)
	}

	return mcMeta, nil
}

func downloadClient(mcId string, client internal.MojangMetaDownloadsClient) error {
	return downloadFile(
		path.Join(
			minecraftNetPath,
			fmt.Sprint(mcId, ".jar"),
		),
		client.URL,
		client.Sha1,
		0,
	)
}

func downloadServerClient(mcVersion string) error {
	var url string
	for _, v := range meta.MOJANG_CACHE.Versions {
		if v.ID == mcVersion {
			url = v.Url
			break
		}
	}

	if url == "" {
		return fmt.Errorf("no meta for %s", mcVersion)
	}

	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var mcMeta internal.MojangMeta
	err = json.Unmarshal(respData, &mcMeta)
	if err != nil {
		return err
	}

	// Write json to file
	os.WriteFile(
		path.Join(
			minecraftNetPath,
			fmt.Sprint(mcMeta.ID, ".json"),
		),
		respData,
		os.ModePerm,
	)

	if mcMeta.Downloads.Server.URL == "" {
		return fmt.Errorf("no server url for %s", mcVersion)
	}
	return downloadFile(
		path.Join(
			internal.GDL_USER_DATA,
			internal.GDL_DATASTORE_PREFIX,
			internal.GDL_SERVERS_PREFIX,
			fmt.Sprint(mcMeta.ID, ".jar"),
		),
		mcMeta.Downloads.Server.URL,
		mcMeta.Downloads.Server.Sha1,
		0,
	)
}

func downloadAssetsIndex(mcId, url string) (map[string]interface{}, error) {
	assetsMetaPath := path.Join(
		path.Join(
			internal.GDL_USER_DATA,
			internal.GDL_DATASTORE_PREFIX,
			"assets",
			"indexes",
			fmt.Sprintf("%s.json", mcId),
		),
	)
	var assetIndexMeta map[string]interface{}
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	err = os.MkdirAll(path.Dir(assetsMetaPath), os.ModePerm)
	if err != nil {
		return nil, err
	}

	// Write json to file
	err = os.WriteFile(assetsMetaPath, respData, os.ModePerm)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(respData, &assetIndexMeta)
	if err != nil {
		return nil, err
	}

	return assetIndexMeta, nil
}

type Asset struct {
	Hash string
	Size int
}

func downloadAsset(asset Asset) {
	assetUrl := fmt.Sprintf("https://resources.download.minecraft.net/%s/%s", asset.Hash[:2], asset.Hash)
	assetPath := path.Join(
		internal.GDL_USER_DATA,
		internal.GDL_DATASTORE_PREFIX,
		"assets",
		"objects",
		asset.Hash[:2],
		asset.Hash,
	)
	resp, err := http.Get(assetUrl)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	downloadFile(assetPath, assetUrl, "", asset.Size)
}

func downloadLibrary(lib internal.MojangMetaLibrary) error {

	// call IsLibraryNative
	natives, nativesData, isNative := minecraft.IsLibraryNative(lib)

	var downloadUrl string
	var downloadSize int

	if isNative {
		downloadUrl = nativesData.URL
		downloadSize = nativesData.Size
	} else {
		downloadUrl = lib.Downloads.Artifact.URL
		downloadSize = lib.Downloads.Artifact.Size
	}

	libraryPath := []string{}
	libraryPath = append(
		libraryPath,
		internal.GDL_USER_DATA,
		internal.GDL_DATASTORE_PREFIX,
		internal.GDL_LIBRARIES_PREFIX,
	)
	libraryPath = append(libraryPath, internal.ConvertMavenToPath(lib.Name, natives)...)
	downloadFile(
		path.Join(libraryPath...),
		downloadUrl,
		"",
		downloadSize,
	)

	return nil
}

func downloadFile(filePath string, url string, hash string, size int) error {
	os.MkdirAll(path.Dir(filePath), os.ModePerm)
	h := sha1.New()

	// If sha1 is provided, verify it
	if hash != "" {
		if v, err := os.Open(filePath); err == nil {
			io.Copy(h, v)
			if fmt.Sprintf("%x", h.Sum(nil)) == hash {
				return nil
			}
			v.Close()
		}
	}

	// If size is provided, verify it
	if size > 0 {
		if v, err := os.Stat(filePath); err == nil {
			if v.Size() == int64(size) {
				return nil
			}
		}
	}

	tries := 0
	const MAX_TRIES = 4
	for {
		if tries > MAX_TRIES {
			return fmt.Errorf("failed to download %s", url)
		}
		// Get the data
		resp, err := http.Get(url)
		if err != nil {
			tries++
			time.Sleep(time.Millisecond * 500)
			continue
		}
		defer resp.Body.Close()

		// Create the file
		out, err := os.Create(filePath)
		if err != nil {
			return err
		}
		defer out.Close()

		w := io.MultiWriter(out, h)
		_, err = io.Copy(w, resp.Body)
		if err != nil {
			return err
		}

		// Check the hash
		sha1Hash := hex.EncodeToString(h.Sum(nil))
		if hash != "" && hash != sha1Hash {
			tries++
			time.Sleep(time.Millisecond * 500)
			continue
		}

		return err
	}
}
