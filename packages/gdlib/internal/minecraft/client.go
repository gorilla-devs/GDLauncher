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

func LaunchClient(instanceUUID string, mcVersion string) error {

	mcMeta, err := ReadMojangMetaJson(mcVersion)

	if err != nil {
		return err
	}

	libraries := GatherLibraries(mcMeta.Libraries)
	instancePath := path.Join(internal.GDL_USER_DATA, internal.GDL_INSTANCES_PREFIX, instanceUUID)

	// Extract natives
	err = ExtractNatives(instanceUUID, libraries)

	if err != nil {
		return err
	}

	defer func() {
		err = os.RemoveAll(path.Join(instancePath, "natives"))
		if err != nil {
			fmt.Println(err)
		}
	}()

	startupString := []string{}
	startupString = append(
		startupString,
		"-cp",
	)

	libs := []string{}
	for _, lib := range libraries {
		if _, _, ok := IsLibraryNative(lib); !ok {
			libPath := []string{
				internal.GDL_USER_DATA,
				internal.GDL_DATASTORE_PREFIX,
				internal.GDL_LIBRARIES_PREFIX,
			}
			libPath = append(libPath, internal.ConvertMavenToPath(lib.Name, "")...)
			libs = append(libs, path.Join(libPath...))
		}
	}

	// Push main jar
	libs = append(
		libs,
		path.Join(
			internal.GDL_USER_DATA,
			internal.GDL_DATASTORE_PREFIX,
			internal.GDL_LIBRARIES_PREFIX,
			"net",
			"minecraft",
			mcVersion+".jar",
		),
	)

	startupString = append(startupString, strings.Join(libs, internal.GetPathDelimiter()))

	startupString = append(
		startupString,
		"-Xmx4096m",
		"-Xms4096m",
		"-Djava.library.path="+path.Join(instancePath, "natives"),
		"-Dminecraft.applet.TargetDirectory="+path.Join(instancePath),
		"-Dfml.ignorePatchDiscrepancies=true",
		"-Dfml.ignoreInvalidMinecraftCertificates=true",
	)

	startupString = append(
		startupString,
		GetVanillaJVMArgs()...,
	)

	// Check for logging
	if mcMeta.Logging.Client.File.ID != "" {
		startupString = append(
			startupString,
			strings.ReplaceAll(
				mcMeta.Logging.Client.Argument,
				"${path}",
				path.Join(
					internal.GDL_USER_DATA,
					internal.GDL_DATASTORE_PREFIX,
					"assets",
					"objects",
					mcMeta.Logging.Client.File.Sha1[:2],
					mcMeta.Logging.Client.File.ID,
				),
			),
		)
	}

	startupString = append(startupString, mcMeta.MainClass)

	assetsPath := path.Join(
		internal.GDL_USER_DATA,
		internal.GDL_DATASTORE_PREFIX,
		"assets",
	)
	mcArgs := []string{}

	releaseTime113, err := time.Parse(time.RFC3339, "2018-07-18T15:11:46+00:00")
	if err != nil {
		return err
	}
	mcMetaReleaseTime, err := time.Parse(time.RFC3339, mcMeta.ReleaseTime)
	if err != nil {
		return err
	}

	if mcMetaReleaseTime.Sub(releaseTime113) > 0 {
		// >= 1.13
		for _, arg := range mcMeta.Arguments.Game.([]interface{}) {
			// try to convert to string
			argString, ok := arg.(string)
			if !ok {
				continue
			}
			mcArgs = append(mcArgs, argString)
		}
	} else {
		// < 1.13
		mcArgs = strings.Split(mcMeta.MinecraftArguments, " ")
	}

	for _, arg := range mcArgs {
		// Skip microsoft madness
		// clientId is a unique ID of the launcher install
		// xuid is the Xbox ID
		if arg == "--clientId" || arg == "${clientid}" || arg == "--xuid" || arg == "${auth_xuid}" {
			continue
		}

		if strings.Contains(arg, "${auth_player_name}") {
			startupString = append(startupString, strings.Replace(arg, "${auth_player_name}", "XYZ", 1))
		} else if strings.Contains(arg, "${version_name}") {
			startupString = append(startupString, strings.Replace(arg, "${version_name}", mcVersion, 1))
		} else if strings.Contains(arg, "${game_directory}") {
			startupString = append(startupString, strings.Replace(arg, "${game_directory}", instancePath, 1))
		} else if strings.Contains(arg, "${assets_root}") {
			startupString = append(startupString, strings.Replace(arg, "${assets_root}", assetsPath, 1))
		} else if strings.Contains(arg, "${assets_index_name}") {
			startupString = append(startupString, strings.Replace(arg, "${assets_index_name}", mcMeta.Assets, 1))
		} else if strings.Contains(arg, "${auth_uuid}") {
			startupString = append(startupString, strings.Replace(arg, "${auth_uuid}", "XYZ", 1))
		} else if strings.Contains(arg, "${auth_access_token}") {
			startupString = append(startupString, strings.Replace(arg, "${auth_access_token}", "XYZ", 1))
		} else if strings.Contains(arg, "${user_type}") {
			startupString = append(startupString, strings.Replace(arg, "${user_type}", "mojang", 1))
		} else if strings.Contains(arg, "${version_type}") {
			startupString = append(startupString, strings.Replace(arg, "${version_type}", mcMeta.Type, 1))
		} else {
			startupString = append(startupString, arg)
		}
	}

	ps := exec.Command("java", startupString...)
	fmt.Println(ps.Args)
	ps.Stdout = os.Stdout
	ps.Stderr = os.Stderr
	ps.Dir = instancePath
	err = ps.Run()
	if err != nil {
		return err
	}

	return nil
}
