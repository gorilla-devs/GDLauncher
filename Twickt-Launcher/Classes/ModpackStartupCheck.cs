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
        public static async Task<List<string>> CheckFiles(string modpackname)
        {
            downloadingVersion = await RemoteModpacks.GetMinecraftUrlsAndData(modpackname);
            urls = await JSON.GetFiles(modpackname);
            if (Properties.Settings.Default["disableHashCheck"].ToString() == "false")
            {
                Pages.Modpacks.loading.whatdoing.Content = "Analyzing Files";
                var temp = config.M_F_P + downloadingVersion[1] + @"temp\";
                int count = urls.Count;
                List<string> Libraries = new List<string>();
                foreach (string[] url in urls)
                {
                    if (url[3].Contains("https://libraries.minecraft.net"))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + @"libraries\" + url[2].Replace("/", "\\");
                        string FileName = Path.GetFileName(url[3]);
                        dir = Path.GetDirectoryName(@dir);
                        if (!File.Exists(@dir + "\\" + FileName))
                        {
                            Libraries.Add(url[3]);
                        }
                        else
                        {
                        }
                    }
                    else if (url[3].Contains("https://launcher.mojang.com/mc/game/"))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + @"versions\" + downloadingVersion[0] + "\\";
                        string FileName = downloadingVersion[0] + ".jar";
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
                    else if (url[3].Contains("http://files.minecraftforge.net/maven/"))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + @"libraries\" + url[2];
                        string FileName = Path.GetFileName(dir);
                        dir = Path.GetDirectoryName(@dir);
                        string[] lines = url[0].Split(':');
                        if (!File.Exists(@dir + "\\" + FileName + "\\" + lines[1] + "-" + lines[2] + ".jar"))
                        {
                            Libraries.Add(url[3]);
                        }
                    }
                    else if (url[3].Contains(config.updateWebsite))
                    {
                        string dir = config.M_F_P + downloadingVersion[1] + @"instances\" + url[0].Replace(":", "\\");
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
