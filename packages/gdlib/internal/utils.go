package internal

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strings"
)

// com.mojang:blocklist:1.0.6 -> ['com', 'mojang', 'blocklist', '1.0.6', 'blocklist-1.0.6.jar']
func ConvertMavenToPath(maven string, native string) []string {

	slice := strings.Split(maven, ":")

	fileName := ""
	if len(slice) == 4 {
		fileName = fmt.Sprintf("%s-%s.jar", slice[2], slice[3])
	} else {
		fileName = slice[2]
	}

	if strings.Contains(fileName, "@") {
		fileName = strings.ReplaceAll(fileName, "@", ".")
	} else if native != "" {
		fileName = fmt.Sprint(fileName, "-", native, ".jar")
	} else {
		fileName = fmt.Sprint(fileName, ".jar")
	}

	result := strings.Split(slice[0], ".")
	result = append(result, slice[1])
	result = append(result, strings.Split(slice[2], "@")[0])
	result = append(result, fmt.Sprintf("%s-%s", slice[1], fileName))

	return result
}

func ExtractJar(archive *zip.ReadCloser, extractFolder string) error {
	if extractFolder == "" {
		extractFolder = "."
	}
	counter := 0

	for _, f := range archive.File {

		filePath := path.Join(extractFolder, f.Name)
		counter += int(f.UncompressedSize64)

		if f.FileInfo().IsDir() {
			os.MkdirAll(filePath, os.ModePerm)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm); err != nil {
			return err
		}

		dstFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}

		fileInArchive, err := f.Open()
		if err != nil {
			return err
		}

		if _, err := io.Copy(dstFile, fileInArchive); err != nil {
			return err
		}

		dstFile.Close()
		fileInArchive.Close()
	}
	return nil
}

func QuotifyIfHasWhitespace(str string) string {
	// Check if string has whitespace
	if strings.ContainsAny(str, " \t\n\r\f\v") {
		return fmt.Sprintf("\"%s\"", str)
	}
	return str
}

func GetPathDelimiter() string {
	if runtime.GOOS == "windows" {
		return ";"
	}
	return ":"
}
