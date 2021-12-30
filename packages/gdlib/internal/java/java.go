package java

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
)

func Init() {

}

// Detect java version based on os the system is running on,
// For linux check into jvm folder and makes a java -version cli command
// With windows just the java -version command so far
func JavaDetect(result chan string, e chan error, done chan bool) {

	if runtime.GOOS == "linux" {

		path := "/usr/lib/jvm"
		out, err := ioutil.ReadDir(path)
		if err != nil {
			result <- ""
			e <- err
		}

		re := regexp.MustCompile(`^(j|J)ava`)

		for _, f := range out {

			// cmd := exec.Command("java", "-version")
			// if err := cmd.Run(); err != nil {
			// 	result <- ""
			// 	e <- err
			// }
			matched := re.MatchString(f.Name())
			//got the response
			if matched {
				result <- path + "/" + f.Name()
				e <- nil
			}
		}
		done <- true

	} else if runtime.GOOS == "windows" {
		//Probe #1
		cmd := exec.Command("java", "-version")
		var errb bytes.Buffer

		//Java prints the output into the Stderr
		cmd.Stderr = &errb

		if err := cmd.Run(); err != nil {
			result <- ""
			e <- err
		}
		result <- errb.String()
		e <- nil
		done <- true
		//Probe #2
		// check system registry
	}
}

func GetOpenJDKManifest(s string) ([]OpenJDKType, error) {

	var toDownload string
	var jdk []OpenJDKType

	if s == "java8" {
		toDownload = JAVA_MANIFEST_URL
	} else {
		toDownload = JAVA_LATEST_MANIFEST_URL
	}

	resp, err := http.Get(toDownload)
	if err != nil {
		return jdk, err
	}

	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return jdk, err
	}

	err = json.Unmarshal(bodyBytes, &jdk)
	if err != nil {
		return jdk, err
	}

	return jdk, nil
}

func JavaInstall(e chan<- error, updateProgress func(int), javaVersions ...string) {

	var jdk []OpenJDKType
	fmt.Println("Installing ", javaVersions)

	// Get manifest from json
	for i := range javaVersions {
		jdk, _ = GetOpenJDKManifest(javaVersions[i])
	}

	var url string
	var arch string

	if runtime.GOARCH == "amd64" {
		arch = "x64"
	}
	// Lookup for the url for the jre version compatible for
	// the machine the launcher is running on
	for i := range jdk {
		if runtime.GOOS == jdk[i].Os && arch == jdk[i].Architecture {
			url = jdk[i].BinaryLink
		}
	}

	fmt.Println(url)

	err := getPacket(url)
	if err != nil {
		e <- err
	}

	if runtime.GOOS == "linux" || runtime.GOOS == "darwin" {

		r, err := os.Open("./tmp.tar.gz")
		if err != nil {

			fmt.Println("error")
		}

		err = ExtractTarGz(updateProgress, r)

		e <- err
	} else if runtime.GOOS == "windows" {
		archive, err := zip.OpenReader("./tmp.zip")
		if err != nil {
			log.Fatal("File not found")
		}
		defer archive.Close()
		ExtractZip(e, updateProgress, archive)
	}
}

//maybe the error handling is wrong
func getPacket(url string) error {

	opSys := runtime.GOOS

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return err
	}

	if opSys == "linux" {
		f, err := os.Create("tmp.tar.gz")
		if err != nil {
			fmt.Println("could not create file")
			return err
		}

		_, err = io.Copy(f, res.Body)
		fmt.Println("Helloworld")
		if err != nil {
			fmt.Println("Error in copying file")
		}
	} else if opSys == "windows" {

		f, err := os.Create("tmp.zip")
		if err != nil {
			return err
		}

		io.Copy(f, res.Body)

	} else {
		fmt.Println("OS not recognized")
		return err
	}

	return nil
}

func Clean() {
	if _, err := os.Stat("./tmp.tar.gz"); err == nil {
		os.Remove("./tmp.tar.gz")
	}

	if _, err := os.Stat("./tmp.tar"); err == nil {
		os.Remove("./tmp.tar")
	}
}

func ExtractZip(status chan<- error, updateProgress func(int), archive *zip.ReadCloser) error {

	// stat, err := os.Lstat("./tmp.zip")
	// if err != nil {
	// 	return err
	// }

	// size := stat.Size()
	// bar := progressbar.Default(int64(stat.Size()))
	counter := 0

	for _, f := range archive.File {

		filePath := f.Name
		// bar.Add(int(f.UncompressedSize64))
		counter += int(f.UncompressedSize64)
		updateProgress(counter)

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
		// bar.Finish()
	}
	return nil
}

func ExtractTarGz(updateProgress func(int), gzipStream io.Reader) error {

	uncompressedStream, err := gzip.NewReader(gzipStream)
	if err != nil {
		fmt.Println(err)
		return err
	}

	tarReader := tar.NewReader(uncompressedStream)

	counter := 0
	stat, err := os.Lstat("./tmp.tar.gz")
	if err != nil {
		return err
	}

	size := stat.Size()
	fmt.Println("SIZE TAR.GZ", size)
	// bar := progressbar.Default(size)

	for {

		header, err := tarReader.Next()
		if err == io.EOF {
			counter = int(size)
			updateProgress(counter)
			fmt.Println("FINAL COUNTER VALUE:", counter)
			// bar.Finish()
			return nil
		}

		fmt.Println("COUNTER VALUE:", counter)
		counter += int(header.Size)
		updateProgress(counter)

		// bar.Add(int(header.Size))
		if err != nil {
			return err
		}

		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.Mkdir(header.Name, 0755); err != nil {
				// log.Fatalf("ExtractTarGz: Mkdir() failed: %s", err.Error())
				return err
			}
		case tar.TypeReg:
			outFile, err := os.Create(header.Name)
			if err != nil {
				// log.Fatalf("ExtractTarGz: Create() failed: %s", err.Error())
				return err
			}
			if _, err := io.Copy(outFile, tarReader); err != nil {
				// e <- errors.New("ExtractTarGz: Copy() failed"")"
				return err
			}
			outFile.Close()
		case tar.TypeSymlink:
			outFile, err := os.Create(header.Name)
			if err != nil {
				return err
			}
			path, err := filepath.EvalSymlinks(header.Name)
			if err != nil {
				return err
			}
			fmt.Println(outFile, path)
		default:
			fmt.Printf("ExtractTarGz: uknown type: %v in %s", string(header.Typeflag), string(header.Name))
			return errors.New("ExtractTarGz: uknown type")
		}

	}
}

// func unzip(ext string) error {

// 	var out bytes.Buffer

// 	exePath := "./executables/7z-" + runtime.GOOS + "-" + runtime.GOARCH
// 	file := "tmp." + ext
// 	cmd := exec.Command(exePath, "x", file)
// 	cmd.Stderr = &out

// 	err := cmd.Run()
// 	if err != nil {
// 		fmt.Println(err)
// 		return err
// 	}

// 	time.Sleep(1 * time.Second)

// 	if runtime.GOOS == "windows" {
// 		return nil
// 	} else {
// 		cmd = exec.Command(exePath, "x", "./tmp.tar")

// 		err = cmd.Run()
// 		if err != nil {
// 			return err
// 		}

// 		return nil
// 	}
// }
