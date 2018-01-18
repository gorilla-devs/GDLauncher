// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Avvia il gioco*/
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace GDLauncher.Classes
{
    class MinecraftStarter
    {
        public static Dialogs.ModpackLoading loading;
        public static async void Minecraft_Start(string dir)
        {
            loading = new Dialogs.ModpackLoading(true, Pages.SplashScreen.singleton.manager.GetString("starting") + "...");
                        MaterialDesignThemes.Wpf.DialogHost.Show(loading, "RootDialog", OpenEvent);
            loading.forgeProgress.Value = 15;
            await Task.Delay(1000);
            var json = File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
            dynamic decoded = JsonConvert.DeserializeObject(json);
            var forge = decoded.forgeVersion;

            string launch =@"-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump -Xmx" + Properties.Settings.Default["RAM"] + "G -Xms" + "256" + "M " + ((String.Compare(Properties.Settings.Default["RAM"].ToString(), "3") > 0) ? "-XX:+DisableExplicitGC -XX:+UseConcMarkSweepGC -XX:+UseParNewGC -XX:+UseNUMA -XX:+CMSParallelRemarkEnabled -XX:MaxTenuringThreshold=15 -XX:MaxGCPauseMillis=30 -XX:GCPauseIntervalMillis=150 -XX:+UseAdaptiveGCBoundary -XX:-UseGCOverheadLimit -XX:+UseBiasedLocking -XX:SurvivorRatio=8 -XX:TargetSurvivorRatio=90 -XX:MaxTenuringThreshold=15 -Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true -XX:+UseFastAccessorMethods -XX:+UseCompressedOops -XX:+OptimizeStringConcat -XX:+AggressiveOpts -XX:ReservedCodeCacheSize=2048m -XX:+UseCodeCacheFlushing -XX:SoftRefLRUPolicyMSPerMB=10000 -XX:ParallelGCThreads=10 " : "-XX:+DisableExplicitGC -XX:+UseConcMarkSweepGC -XX:+UseParNewGC -XX:+UseNUMA -XX:+CMSParallelRemarkEnabled -XX:MaxTenuringThreshold=15 -XX:MaxGCPauseMillis=30 -XX:GCPauseIntervalMillis=150 -XX:+UseAdaptiveGCBoundary -XX:-UseGCOverheadLimit -XX:+UseBiasedLocking -XX:SurvivorRatio=8 -XX:TargetSurvivorRatio=90 -XX:MaxTenuringThreshold=15 -Dfml.ignorePatchDiscrepancies=true -Dfml.ignoreInvalidMinecraftCertificates=true -XX:+UseFastAccessorMethods -XX:+UseCompressedOops -XX:+OptimizeStringConcat -XX:+AggressiveOpts -XX:ReservedCodeCacheSize=2048m -XX:+UseCodeCacheFlushing -XX:SoftRefLRUPolicyMSPerMB=2000 -XX:ParallelGCThreads=10 ") +
                           "\"-Djava.library.path=" + dir + "\\\\natives-win\\\\\" " +

                           @"-cp ";
            if (forge != "false")
                launch += "\"" + dir + @"\\libraries\net\minecraftforge\forge\" + decoded.forgeFileName + @"\\forge-" + decoded.forgeFileName + @".jar" + ";";
            else
                launch += "\"" + dir + @"\\versions\\" + decoded.mc_version + "\\\\" + decoded.mc_version + ".jar" + ";";

            foreach(var lib in decoded.libs)
            {
                launch += config.M_F_P + lib.path + ";";
            }
            
            if (forge != "false")
                launch += dir + @"\\versions\\" + decoded.mc_version + "\\\\" + decoded.mc_version + ".jar";


            if (forge == "false")
            {
                string args = decoded.arguments;
                string arguments = args.Replace("${auth_player_name}", SessionData.username).Replace(
                        "${version_name}", (string)decoded.mc_version + " "
                        ).Replace(
                        "${game_directory}", dir
                        ).Replace(
                        "${assets_root}", dir + "\\assets\\"
                        ).Replace(
                        "${assets_index_name}", (string)decoded.mc_version
                        ).Replace(
                        "${auth_uuid}", "0"
                        ).Replace(
                        "${auth_access_token}", "0"
                        ).Replace(
                        "${user_properties}", "{}"
                        ).Replace(
                        "${user_type}", "legacy"
                        ).Replace(
                        "${version_type}", (string)decoded.version_type
                        );

                launch = launch + "\" " + (string)decoded.mainClass + " " + arguments;
            }
            else
            {
                string args = decoded.arguments;
                string arguments = args.Replace(
                        "${auth_player_name}", SessionData.username
                        ).Replace(
                        "${version_name}", (string)decoded.mc_version + "-forge" + (string)decoded.mc_version + "-" + forge + "-" + (string)decoded.mc_version + " "
                        ).Replace(
                        "${game_directory}", dir
                        ).Replace(
                        "${assets_root}", dir + "\\assets\\"
                        ).Replace(
                        "${assets_index_name}", (string)decoded.mc_version
                        ).Replace(
                        "${auth_uuid}", "0"
                        ).Replace(
                        "${auth_access_token}", "0"
                        ).Replace(
                        "${user_properties}", "{}"
                        ).Replace(
                        "${user_type}", "legacy"
                        ).Replace(
                        "${version_type}", (string)decoded.version_type
                        );

                launch = launch + "\" " + (string)decoded.mainClass + " " + arguments;
            }

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
                //loading.forgeProgress.Value = 25;

                process.OutputDataReceived += new DataReceivedEventHandler((s, e) =>
                {
                    if (e.Data != null)
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Windows.DebugOutputConsole.singleton.Write(e.Data.ToString());
                            if (e.Data.ToString().Contains("Loading tweak class name"))
                            {
                                loading.forgeProgress.Value = 50;
                            }
                            if(e.Data.ToString().Contains("Setting user:"))
                            {
                                loading.forgeProgress.Value = 75;
                            }
                            if (e.Data.ToString().Contains("LWJGL Version:"))
                            {
                                loading.forgeProgress.Value = 100;
                                if (Properties.Settings.Default.autoHideLauncher == true) Window1.singleton.Hide();
                            }

                        }));

                    }
                });
                process.ErrorDataReceived += new DataReceivedEventHandler((s, e) =>
                {
                    if (e.Data != null)
                    {
                       Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Windows.DebugOutputConsole.singleton.Write(e.Data.ToString());
                        }));
                    }
                });
                Window1.singleton.debugconsole.button2.IsEnabled = true;
                Window1.singleton.debugconsole.button2.Click += new RoutedEventHandler((s, e) =>
                {
                    process.Kill();
                });

                await Task.Run(() => process.Start());
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                await Task.Run(() => process.WaitForExit());
                if (Properties.Settings.Default.autoHideLauncher == true) Window1.singleton.Show();
            }
            catch(Exception e)
            {
                Windows.DebugOutputConsole.singleton.Write(Pages.SplashScreen.singleton.manager.GetString("fatalError") + " "  + e);
            }
        }

        private static async void OpenEvent(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            while(loading.forgeProgress.Value != 100)
            {
                await Task.Delay(2000);
            }
            try
            {
                eventArgs.Session.Close();
            }
            catch { }

        }
    }
}
