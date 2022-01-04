package minecraft

import (
	"archive/zip"
	"gdlib/internal"
	"os"
	"path"
	"runtime"
)

func IsLibraryNative(lib internal.MojangMetaLibrary) (string, internal.MojangMetaLibraryNative, bool) {
	var natives string
	var nativesData internal.MojangMetaLibraryNative
	switch runtime.GOOS {
	case "darwin":
		natives = lib.Natives.Osx
		nativesData = lib.Downloads.Classifiers.Natives_osx
	case "linux":
		natives = lib.Natives.Linux
		nativesData = lib.Downloads.Classifiers.Natives_linux
	case "windows":
		natives = lib.Natives.Windows
		nativesData = lib.Downloads.Classifiers.Natives_windows
	}

	return natives, nativesData, natives != ""
}

func ExtractNatives(instanceFolderPath string, libraries []internal.MojangMetaLibrary) error {
	nativesPath := path.Join(
		internal.GDL_USER_DATA,
		internal.GDL_INSTANCES_PREFIX,
		instanceFolderPath,
		"natives",
	)
	for _, lib := range libraries {
		natives, _, isNative := IsLibraryNative(lib)

		if isNative {
			libraryPath := []string{}
			libraryPath = append(
				libraryPath,
				internal.GDL_USER_DATA,
				internal.GDL_DATASTORE_PREFIX,
				internal.GDL_LIBRARIES_PREFIX,
			)
			libraryPath = append(libraryPath, internal.ConvertMavenToPath(lib.Name, natives)...)
			archive, err := zip.OpenReader(path.Join(libraryPath...))
			if err != nil {
				return err
			}
			defer archive.Close()

			err = os.MkdirAll(nativesPath, os.ModePerm)
			if err != nil {
				return err
			}

			err = internal.ExtractJar(archive, nativesPath)
			if err != nil {
				return err
			}
		}
	}
	return nil
}
