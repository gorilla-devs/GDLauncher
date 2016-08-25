// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace Twickt_Launcher.Classes
{
    class ModpackStartupCheck
    {
        static List<string[]> urls;
        public static List<string> downloadingVersion;
        public static async Task<List<string>> CheckFiles(string modpackname, bool remote)
        {
            if (remote == true)
                downloadingVersion = await RemoteModpacks.GetMinecraftUrlsAndData(modpackname);
            else
                downloadingVersion = await LocalModpacks.GetMinecraftUrlsAndData(modpackname);


            if (remote == true)
                urls = await JSON.GetFiles(modpackname);
            else
                urls = await JSON.GetFiles(modpackname, false, false, false);

            if (remote == true && downloadingVersion[3] == "true")
            {
                try
                {
                    string[] localFiles = Directory.GetFiles(config.M_F_P + downloadingVersion[1] + "\\instances\\" + await RemoteModpacks.GetModpacksDir(modpackname) + "\\mods", "*", SearchOption.AllDirectories);
                    foreach (string file in localFiles)
                    {
                        bool filegood = false;
                        foreach (string[] url in urls)
                        {
                            if (url[3].Contains(config.updateWebsite))
                            {
                                var localfilename = Path.GetFileName(file);
                                var remotefilename = Path.GetFileName(url[2]);
                                if (localfilename == remotefilename)
                                    filegood = true;
                            }
                        }
                        if (filegood == false)
                            File.Delete(file);
                        filegood = false;
                    }
                }
                catch(IOException)
                {}
                catch
                {
                    MessageBox.Show(lang.languageswitch.mixFileCheckError);
                }
            }
            if (Properties.Settings.Default["disableHashCheck"].ToString() == "false")
            {
                if (Pages.Modpacks.singleton.remote.IsSelected)
                    Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.analyzingFiles;
                var temp = config.M_F_P + downloadingVersion[1] + @"temp\";
                int count = urls.Count;
                List<string> Libraries = new List<string>();
                foreach (string[] url in urls)
                {
                    if (url[3].Contains("https://libraries.minecraft.net"))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + url[2];
                        string FileName = Path.GetFileName(url[3]);
                        dir = Path.GetDirectoryName(@dir);
                        if (!File.Exists(@dir + "\\" + FileName))
                        {
                            Libraries.Add(url[3]);
                        }
                        else
                        {
                            if (JSON.Hash(@dir + "\\" + FileName) != url[1])
                                Libraries.Add(url[3]);
                        }
                    }
                    else if (url[3].Contains("https://launcher.mojang.com/mc/game/"))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + url[2];
                        string FileName = Path.GetFileName(dir);
                        dir = Path.GetDirectoryName(@dir);
                        if (!File.Exists(@dir + "\\" + FileName))
                        {
                            Libraries.Add(url[3]);
                        }
                        else
                        {
                            if (JSON.Hash(@dir + "\\" + FileName) != url[1])
                                Libraries.Add(url[3]);
                        }
                    }
                    else if (url[3].Contains("http://resources.download.minecraft.net/"))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + url[2];
                        string FileName = Path.GetFileName(dir);
                        dir = Path.GetDirectoryName(@dir);
                        if (!File.Exists(@dir + "\\" + FileName))
                        {
                            Libraries.Add(url[3]);
                        }
                        else
                        {
                            if (JSON.Hash(@dir + "\\" + FileName) != url[1])
                                Libraries.Add(url[3]);
                        }
                    }
                    else if (url[3].Contains("http://search.maven.org/remotecontent?filepath="))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + url[2];
                        string FileName = Path.GetFileName(dir);
                        dir = Path.GetDirectoryName(@dir);
                        if (!File.Exists(@dir + "\\" + FileName))
                        {
                            Libraries.Add(url[3]);
                        }
                    }
                    else if (url[3].Contains(config.updateWebsite))
                    {
                        if (url[4] == "true")
                        {
                            string dir = config.M_F_P + downloadingVersion[1] + url[2];
                            string FileName = Path.GetFileName(dir);
                            dir = Path.GetDirectoryName(@dir);
                            if (!File.Exists(@dir + "\\" + FileName))
                            {
                                Libraries.Add(url[3]);
                            }
                            else
                            {
                                if (JSON.Hash(@dir + "\\" + FileName) != url[1])
                                {
                                    Libraries.Add(url[3]);
                                }
                            }
                        }

                    }
                }
                return Libraries;
            }
            else
            {
                List<string> libnull = new List<string>();
                return libnull;
            }
        }
    }
}
