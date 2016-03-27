using Hardcodet.Wpf.TaskbarNotification;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace Twickt_Launcher.Classes
{
    class MinecraftStarter
    {
        public static async void Minecraft_Start()
        {
            string gamedir = await Classes.RemoteModpacks.GetModpacksDir(Pages.Modpacks.singleton.remoteModpacks.SelectedItem.ToString());

            string getForge = await Classes.RemoteModpacks.IsModpackForgeNeeded(Pages.Modpacks.singleton.remoteModpacks.SelectedItem.ToString());
            bool forge;
            if (getForge == "false")
                forge = false;
            else
                forge = true;
            
            List<String[]> urlsforge = await JSON.GetFiles(false, true);
            List<String[]> urlslibraries = await JSON.GetFiles(true, false);
            string launch =@"-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump -Xmx" + Properties.Settings.Default["RAM"] + "G -Xms" + "256" + "M " + ((String.Compare(Properties.Settings.Default["RAM"].ToString(), "3") > 0) ? "-XX:+DisableExplicitGC -XX:+UseConcMarkSweepGC -XX:+UseParNewGC -XX:+UseNUMA -XX:+CMSParallelRemarkEnabled -XX:MaxTenuringThreshold=15 -XX:MaxGCPauseMillis=30 -XX:GCPauseIntervalMillis=150 -XX:+UseAdaptiveGCBoundary -XX:-UseGCOverheadLimit -XX:+UseBiasedLocking -XX:SurvivorRatio=8 -XX:TargetSurvivorRatio=90 -XX:MaxTenuringThreshold=15 -Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true -XX:+UseFastAccessorMethods -XX:+UseCompressedOops -XX:+OptimizeStringConcat -XX:+AggressiveOpts -XX:ReservedCodeCacheSize=2048m -XX:+UseCodeCacheFlushing -XX:SoftRefLRUPolicyMSPerMB=10000 -XX:ParallelGCThreads=10 " : "-XX:+DisableExplicitGC -XX:+UseConcMarkSweepGC -XX:+UseParNewGC -XX:+UseNUMA -XX:+CMSParallelRemarkEnabled -XX:MaxTenuringThreshold=15 -XX:MaxGCPauseMillis=30 -XX:GCPauseIntervalMillis=150 -XX:+UseAdaptiveGCBoundary -XX:-UseGCOverheadLimit -XX:+UseBiasedLocking -XX:SurvivorRatio=8 -XX:TargetSurvivorRatio=90 -XX:MaxTenuringThreshold=15 -Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true -XX:+UseFastAccessorMethods -XX:+UseCompressedOops -XX:+OptimizeStringConcat -XX:+AggressiveOpts -XX:ReservedCodeCacheSize=2048m -XX:+UseCodeCacheFlushing -XX:SoftRefLRUPolicyMSPerMB=2000 -XX:ParallelGCThreads=10 ") +
                           @"-Djava.library.path=" + config.M_F_P + @"natives-win\ " +

                           @"-cp ";
            if (forge == true)
                launch += "\"" + config.M_F_P + @"libraries\net\minecraftforge\forge\" + config.forgeversion + @"\forge-" + config.forgeversion + @".jar" + "\";";
            else
                launch += "\"" + config.M_F_P + @"versions\1.7.10\1.7.10.jar" + "\";";
            if (forge == true)
            {
                foreach (string[] url in urlsforge)
                {
                    if (url[3].Contains("platform"))
                        continue;
                    if (url[3].Contains("https://libraries.minecraft.net"))
                    {
                        string dir = config.M_F_P + @"libraries\" + url[3].Replace("https://libraries.minecraft.net", "");
                        string FileName = Path.GetFileName(dir);
                        dir = Path.GetDirectoryName(@dir);
                        if (!Directory.Exists(@dir))
                        {
                            Directory.CreateDirectory(@dir);
                        }
                        launch = launch + ("\"" + @dir + "\\" + FileName + "\"" + ";");
                    }
                    if (url[3].Contains("http://files.minecraftforge.net/maven/"))
                    {
                        string dir = config.M_F_P + @"libraries\" + url[3].Replace("http://files.minecraftforge.net/maven/", "");
                        string FileName = Path.GetFileName(dir);
                        dir = Path.GetDirectoryName(@dir);
                        if (!Directory.Exists(@dir))
                        {
                            Directory.CreateDirectory(@dir);
                        }
                        launch = launch + ("\"" + @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar") + "\"" + ";");
                    }
                }
            }
            foreach (string[] url in urlslibraries)
            {
                if (url[3].Contains("platform"))
                    continue;
                if (url[3].Contains("https://libraries.minecraft.net"))
                {
                    string dir = config.M_F_P + @"libraries\" + url[3].Replace("https://libraries.minecraft.net", "");
                    string FileName = Path.GetFileName(dir);
                    dir = Path.GetDirectoryName(@dir);
                    if (!Directory.Exists(@dir))
                    {
                        Directory.CreateDirectory(@dir);
                    }
                    launch = launch + ("\"" + @dir + "\\" + FileName + "\"" + ";");
                }
                if (forge == true)
                {
                    if (url[3].Contains("http://files.minecraftforge.net/maven/"))
                    {
                        string dir = config.M_F_P + @"libraries\" + url[3].Replace("http://files.minecraftforge.net/maven/", "");
                        string FileName = Path.GetFileName(dir);
                        dir = Path.GetDirectoryName(@dir);
                        if (!Directory.Exists(@dir))
                        {
                            Directory.CreateDirectory(@dir);
                        }
                        launch = launch + ("\"" + @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar") + "\"" + ";");
                    }
                }
            }
            if (forge == true)
                launch += config.M_F_P + @"versions\1.7.10\1.7.10.jar";



            launch = launch + ((forge == true) ? " net.minecraft.launchwrapper.Launch " : " net.minecraft.client.main.Main ") +
                           "--username " + SessionData.username + " " +
                           //"--accessToken " + MojangLogin.getAccessToken() + " " +
                           //"--username killpowa " +
                           "--accessToken 0 " +
                           "--version " + config.forgeversion + " " +
                           ((forge == true) ? "--gameDir \"" + config.minecraftfolder + "\\instances\\" + gamedir + "\" " : "--gameDir \"" + config.minecraftfolder + "\" ") +
                           "--assetsDir " + config.minecraftfolder + "\\assets\\ " +
                           "--assetIndex 1.7.10 " +
                           "--userProperties {} " +
                           //"--uuid " + MojangLogin.getUUID() + " " +
                           "--uuid 3b40f99969e64dbcabd01f87cddcb1fd " +
                           ((forge == true) ? "--tweakClass cpw.mods.fml.common.launcher.FMLTweaker" : "");
            //string launch = @"-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump -Xmx1G -XX:+UseConcMarkSweepGC -XX:+CMSIncrementalMode -XX:-UseAdaptiveSizePolicy -Xmn128M -Dos.version=10.0 -Djava.library.path=C:\Users\david\AppData\Roaming\.minecraft\versions\1.7.10-Forge10.13.4.1448-1.7.10\1.7.10-Forge10.13.4.1448-1.7.10-natives-260440781397829 -cp C:\Users\david\AppData\Roaming\.minecraft\libraries\net\minecraftforge\forge\1.7.10-10.13.4.1448-1.7.10\forge-1.7.10-10.13.4.1448-1.7.10.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\net\minecraft\launchwrapper\1.11\launchwrapper-1.11.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\ow2\asm\asm-all\5.0.3\asm-all-5.0.3.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\typesafe\akka\akka-actor_2.11\2.3.3\akka-actor_2.11-2.3.3.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\typesafe\config\1.2.1\config-1.2.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\scala-actors-migration_2.11\1.1.0\scala-actors-migration_2.11-1.1.0.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\scala-compiler\2.11.1\scala-compiler-2.11.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\plugins\scala-continuations-library_2.11\1.0.2\scala-continuations-library_2.11-1.0.2.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\plugins\scala-continuations-plugin_2.11.1\1.0.2\scala-continuations-plugin_2.11.1-1.0.2.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\scala-library\2.11.1\scala-library-2.11.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\scala-parser-combinators_2.11\1.0.1\scala-parser-combinators_2.11-1.0.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\scala-reflect\2.11.1\scala-reflect-2.11.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\scala-swing_2.11\1.0.1\scala-swing_2.11-1.0.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\scala-lang\scala-xml_2.11\1.0.2\scala-xml_2.11-1.0.2.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\lzma\lzma\0.0.1\lzma-0.0.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\net\sf\jopt-simple\jopt-simple\4.5\jopt-simple-4.5.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\google\guava\guava\17.0\guava-17.0.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\apache\commons\commons-lang3\3.3.2\commons-lang3-3.3.2.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\mojang\realms\1.3.5\realms-1.3.5.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\apache\commons\commons-compress\1.8.1\commons-compress-1.8.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\apache\httpcomponents\httpclient\4.3.3\httpclient-4.3.3.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\commons-logging\commons-logging\1.1.3\commons-logging-1.1.3.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\apache\httpcomponents\httpcore\4.3.2\httpcore-4.3.2.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\java3d\vecmath\1.3.1\vecmath-1.3.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\net\sf\trove4j\trove4j\3.0.3\trove4j-3.0.3.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\ibm\icu\icu4j-core-mojang\51.2\icu4j-core-mojang-51.2.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\net\sf\jopt-simple\jopt-simple\4.5\jopt-simple-4.5.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\paulscode\codecjorbis\20101023\codecjorbis-20101023.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\paulscode\codecwav\20101023\codecwav-20101023.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\paulscode\libraryjavasound\20101123\libraryjavasound-20101123.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\paulscode\librarylwjglopenal\20100824\librarylwjglopenal-20100824.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\paulscode\soundsystem\20120107\soundsystem-20120107.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\io\netty\netty-all\4.0.10.Final\netty-all-4.0.10.Final.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\google\guava\guava\15.0\guava-15.0.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\apache\commons\commons-lang3\3.1\commons-lang3-3.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\commons-io\commons-io\2.4\commons-io-2.4.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\commons-codec\commons-codec\1.9\commons-codec-1.9.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\net\java\jinput\jinput\2.0.5\jinput-2.0.5.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\net\java\jutils\jutils\1.0.0\jutils-1.0.0.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\google\code\gson\gson\2.2.4\gson-2.2.4.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\com\mojang\authlib\1.5.21\authlib-1.5.21.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\apache\logging\log4j\log4j-api\2.0-beta9\log4j-api-2.0-beta9.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\apache\logging\log4j\log4j-core\2.0-beta9\log4j-core-2.0-beta9.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\lwjgl\lwjgl\lwjgl\2.9.1\lwjgl-2.9.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\org\lwjgl\lwjgl\lwjgl_util\2.9.1\lwjgl_util-2.9.1.jar;C:\Users\david\AppData\Roaming\.minecraft\libraries\tv\twitch\twitch\5.16\twitch-5.16.jar;C:\Users\david\AppData\Roaming\.minecraft\versions\1.7.10\1.7.10.jar net.minecraft.launchwrapper.Launch --username killpowa --version 1.7.10-Forge10.13.4.1448-1.7.10 --gameDir C:\Users\david\AppData\Roaming\.minecraft --assetsDir C:\Users\david\AppData\Roaming\.minecraft\assets --assetIndex 1.7.10 --uuid 3b40f99969e64dbcabd01f87cddcb1fd --accessToken b856b175da4a46e8a85e34f385396157 --userProperties {} --userType legacy --tweakClass cpw.mods.fml.common.launcher.FMLTweaker";
            bool ok = false;

            Process process = new Process();
            
            try
            {
                process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                process.StartInfo.CreateNoWindow = true;
                process.StartInfo.FileName = ComputerInfoDetect.GetJavaInstallationPath() + "//bin//java.exe";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;
                process.StartInfo.Arguments = launch;
                Windows.DebugOutputConsole.singleton.Write(launch);

                process.OutputDataReceived += new DataReceivedEventHandler((s, e) =>
                {
                    if (e.Data != null)
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Windows.DebugOutputConsole.singleton.Write(e.Data.ToString());
                        }));
                    }
                });
                process.ErrorDataReceived += new DataReceivedEventHandler((s, e) =>
                {
                    Window1.singleton.Show();
                    if (e.Data != null)
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Windows.DebugOutputConsole.singleton.Write(e.Data.ToString());
                        }));
                    }
                });

                process.Start();
                var error = new Dialogs.OptionsUpdates("Modpack started, it could take a while!");
                await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                //process.WaitForExit();

                //ok = (process.ExitCode == 0);
            }
            catch(Exception e)
            {
                Windows.DebugOutputConsole.singleton.Write("FATAL ERROR "  + e);
            }

            /*ProcessStartInfo startInfo = new ProcessStartInfo();
            startInfo.FileName = ComputerInfoDetect.GetJavaInstallationPath() + "//bin//java.exe";
            startInfo.Arguments = launch;
            Console.Write(launch);
            Process.Start(startInfo);*/

        }

        private static async void erroropenEvent(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                await Task.Delay(2000);
                eventArgs.Session.Close();
            }
            catch (TaskCanceledException)
            {
                /*cancelled by user...tidy up and dont close as will have already closed */
            }
            catch
            {

            }
        }
    }
}
