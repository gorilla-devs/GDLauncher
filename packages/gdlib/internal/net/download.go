package net

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"gdlib/internal"
	"gdlib/internal/meta"
	"io"
	"net/http"
	"os"
	"path"
	"time"
)

func DownloadVersionInfo() {

}

func DownloadClient() {

}

func DownloadServerClient(mcVersion string) error {
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
	)
}

func DownloadAssetsIndex() {

}

func DownloadAssets() {

}

func downloadAsset() {

}

func DownloadLibraries() {

}

func downloadLibrary() {

}

func downloadLibraryJar() {

}

func downloadNative() {

}

func downloadFile(filePath string, url string, hash string) error {
	os.MkdirAll(path.Dir(filePath), os.ModePerm)
	h := sha1.New()

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
