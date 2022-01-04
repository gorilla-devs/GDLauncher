package minecraft

import "gdlib/internal"

func GatherLibraries(libs []internal.MojangMetaLibrary) []internal.MojangMetaLibrary {
	var libraries []internal.MojangMetaLibrary
	for _, v := range libs {
		shouldDownload := AllowLib(v.Rules)
		if shouldDownload {
			libraries = append(libraries, v)
		}
	}

	return libraries
}
