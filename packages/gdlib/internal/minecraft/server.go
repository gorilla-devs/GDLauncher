package minecraft

import (
	"fmt"
	"gdlib/internal"
	"os"
	"os/exec"
	"path"
	"strings"
	"time"
)

func StartServer(serverJarPath string, instanceFolderName string, instance internal.Instance) error {
	cwd := path.Join(
		internal.GDL_USER_DATA,
		internal.GDL_INSTANCES_PREFIX,
		instanceFolderName,
	)

	eulaPath := path.Join(cwd, "eula.txt")

	fd, err := os.Open(serverJarPath)
	if err != nil {
		return err
	}
	fd.Close()

	proc, err := executeServerProcess(serverJarPath, cwd)

	if err != nil {
		return err
	}

	_, err = os.Open(eulaPath)

	if err != nil {
		proc.Wait()
		time.Sleep(time.Second * 1)
	} else {
		fd.Close()
	}

	b, err := os.ReadFile(eulaPath)

	if err != nil {
		return err
	}

	var found = false
	lines := strings.Split(string(b), "\n")
	for i, line := range lines {
		if strings.Contains(line, "eula=false") {
			found = true
			lines[i] = "eula=true"
		}
	}

	if found {
		fmt.Println("Updating EULA")
		output := strings.Join(lines, "\n")
		err = os.WriteFile(eulaPath, []byte(output), 0644)
		if err != nil {
			return err
		}
		_, err = executeServerProcess(serverJarPath, cwd)

		if err != nil {
			return err
		}
	}

	return nil

}

func executeServerProcess(serverJarPath string, cwd string) (*exec.Cmd, error) {
	proc := exec.Command("java", "-Xmx1024M", "-Xms1024M", "-jar", serverJarPath, "nogui")
	proc.Dir = cwd
	proc.Stdout = os.Stdout
	err := proc.Start()

	if err != nil {
		return nil, err
	}

	return proc, nil
}
