package minecraft

import (
	"encoding/json"
	"gdlib/internal"
	"io"
	"os"
	"path"
)

func ReadMojangMetaJson(mcVersion string) (internal.MojangMeta, error) {
	jsonPath := path.Join(
		internal.GDL_USER_DATA,
		internal.GDL_DATASTORE_PREFIX,
		internal.GDL_LIBRARIES_PREFIX,
		"net",
		"minecraft",
		mcVersion+".json",
	)

	var meta internal.MojangMeta
	fd, err := os.Open(jsonPath)
	if err != nil {
		return meta, err
	}
	defer fd.Close()

	b, err := io.ReadAll(fd)
	if err != nil {
		return meta, err
	}

	err = json.Unmarshal(b, &meta)
	if err != nil {
		return meta, err
	}

	return meta, nil
}
