using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace Twickt_Launcher.Classes
{
    class RemoteModpacks
    {
        public static bool close = false;
        public static Dictionary<string, string> description = new Dictionary<string, string>();
        public static async Task<string[]> GetModpacksList()
        {
            var result = await Task.Run(() => RefreshRemote());
            Window1.singleton.MenuToggleButton.IsChecked = false;
            return (string[])result;
        }

        private static async Task<string[]> RefreshRemote()
        {
            List<string> modpacks = new List<string>();
            try
            {
                Application.Current.Dispatcher.Invoke(new Action(async () =>
                {
                    Pages.Modpacks.singleton.refreshRemoteModpacks.IsEnabled = false;
                    Pages.Modpacks.singleton.ModpacksLRList.Items.Clear();
                    string data = "";
                    WebClient c = new WebClient();
                    c.DownloadStringCompleted += (sender1, e) =>
                    {
                        try
                        {
                            data = e.Result;
                        }
                        catch
                        {
                            MessageBox.Show(lang.languageswitch.couldNotGetModpacksList);
                        }
                    };
                    await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "/Modpacks.json"));
                    try
                    {
                        dynamic json = JsonConvert.DeserializeObject(data);
                        foreach (var item in json["Modpacks"])
                        {
                            var name = (string)item["name"];
                            var file = (string)item["file"];
                            Pages.Modpacks.singleton.ModpacksLRList.Items.Add(name);
                            modpacks.Add(file);
                        }
                    }
                    catch (JsonReaderException)
                    {
                        throw;
                    }
                    catch
                    {
                    }
                    RemoteModpacks.close = true;
                    await Task.Delay(100);
                    Pages.Modpacks.singleton.refreshRemoteModpacks.IsEnabled = true;
                }));
                return modpacks.ToArray();

            }
            catch
            {
                return null;
            }
        }

        /*private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                Application.Current.Dispatcher.Invoke(new Action(async () =>
                {
                    Pages.Modpacks.singleton.ModpacksLRList.Items.Clear();
                    string data = "";
                    WebClient c = new WebClient();
                    c.DownloadStringCompleted += (sender1, e) =>
                    {
                        try
                        {
                            data = e.Result;
                        }
                        catch
                        {
                            MessageBox.Show(lang.languageswitch.couldNotGetModpacksList);
                        }
                    };
                    await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "/Modpacks.json"));
                    List<string> modpacks = new List<string>();
                    try
                    {
                        dynamic json = JsonConvert.DeserializeObject(data);
                        foreach (var item in json["Modpacks"])
                        {
                            var name = (string)item["name"];
                            var file = (string)item["file"];
                            Pages.Modpacks.singleton.ModpacksLRList.Items.Add(name);
                            modpacks.Add(file);
                        }
                    }
                    catch (JsonReaderException)
                    {
                        throw;
                    }
                    RemoteModpacks.close = true;
                    await Task.Delay(400);
                    eventArgs.Session.Close(modpacks.ToArray());
                }));


            }
            catch (TaskCanceledException)
            {
                //cancelled by user...tidy up and dont close as will have already closed
            }
        }*/

        public static async Task<string> GetModpacksDescription(string modpackname)
        {
            if (description.ContainsKey(modpackname))
            {
                return description[modpackname];
            }
            else
            {
                WebClient c = new WebClient();
                string data = "";
                c.DownloadStringCompleted += (sender, e) =>
                {
                    data = e.Result;
                };
                await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "/Modpacks.json"));
                List<string> modpacks = new List<string>();
                dynamic json = JsonConvert.DeserializeObject(data);
                foreach (var item in json["Modpacks"])
                {
                    var name = (string)item["name"];
                    var descriptionLocal = (string)item["description"];
                    if (modpackname == name)
                    {
                        description[modpackname] = descriptionLocal;
                        return descriptionLocal;
                    }
                }
                return null;
            }
        }

        public static async Task<List<string[]>> GetModpacksFiles(string modpackname, bool justname = false)
        {
            try
            {
                WebClient c = new WebClient();
                string data = "";
                c.DownloadStringCompleted += (sender, e) =>
                {
                    try
                    {
                        data = e.Result;
                    }
                    catch
                    {
                        MessageBox.Show(lang.languageswitch.couldNotGetModpackFiles);
                    }
                };
                await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "Modpacks.json"));
                List<string> modpacks = new List<string>();
                dynamic json1 = JsonConvert.DeserializeObject(data);
                foreach (var item in json1["Modpacks"])
                {
                    var name = (string)item["name"];
                    if (name == modpackname)
                        modpackname = (string)item["file"];
                }
                await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + modpackname));
                List<string[]> libraries = new List<string[]>();
                dynamic json = JsonConvert.DeserializeObject(data);

                foreach (var item in json["libraries"])
                {
                    var package = (string)item["name"];
                    var hash = (string)item["hash"]; ;
                    var url = (string)item["url"]; ;
                    var baseurl = config.updateWebsite;
                    var finalurl = "";


                    string[] lines = package.Split(':');
                    bool first = true;
                    foreach (string s in lines)
                    {
                        if (first == true)
                        {
                            finalurl += s;
                            first = false;
                        }
                        else
                        {
                            if (justname == true)
                            {
                                finalurl = s;
                            }
                            else
                            {
                                finalurl += "/" + s;
                            }

                        }
                    }
                    libraries.Add(new string[4] { package, hash, @"\instances\" + finalurl.Replace("/", "\\"), config.updateWebsite + url });

                }
                return libraries;

            }
            catch
            {
                MessageBox.Show(lang.languageswitch.errorGettingModpackFiles);
                return null;
            }
        }

        /*public static async Task<string[]> ModpacksFirstPage()
        {
            if (description.ContainsKey(modpackname))
            {
                return description[modpackname];
            }
            else
            {
                WebClient c = new WebClient();
                string data = "";
                c.DownloadStringCompleted += (sender, e) =>
                {
                    data = e.Result;
                };
                await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "/Modpacks.json"));
                List<string> modpacks = new List<string>();
                dynamic json = JsonConvert.DeserializeObject(data);
                foreach (var item in json["Modpacks"])
                {
                    var name = (string)item["name"];
                    var descriptionLocal = (string)item["description"];
                    if (modpackname == name)
                    {
                        description[modpackname] = descriptionLocal;
                        return descriptionLocal;
                    }
                }
                return null;
            }
        }*/

        public static async Task<string> IsModpackForgeNeeded(string modpackname)
        {
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "Modpacks.json"));
            List<string> modpacks = new List<string>();
            dynamic json = JsonConvert.DeserializeObject(data);
            foreach (var item in json["Modpacks"])
            {
                var name = (string)item["name"];
                var forge = (string)item["forge"];
                if (modpackname == name)
                {
                    return forge;
                }
            }
            return null;
        }

        public static async Task<string> GetModpacksDir(string modpackname)
        {
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "Modpacks.json"));
            dynamic json = JsonConvert.DeserializeObject(data);
            foreach (var item in json["Modpacks"])
            {
                var name = (string)item["name"];
                var file = (string)item["file"];
                if (modpackname == name)
                {
                    return file.Replace(".json", "");
                }
            }
            return null;
        }

        public static async Task<List<string>> GetMinecraftUrlsAndData(string modpackname)
        {
            List<string> info = new List<string>();
            /*
             * Serve
             * -la versione
             * l'url del json
             * 
             * */
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "Modpacks.json"));
            dynamic json = JsonConvert.DeserializeObject(data);
            foreach (var item in json["Modpacks"])
            {
                var name = (string)item["name"];
                var version = (string)item["version"];
                var directory = (string)item["directory"];
                var forge = (string)item["forge"];
                var strictFiles = (string)item["strictFiles"];

                if (modpackname == name)
                {
                    info.Add(version);
                    info.Add(directory);
                    info.Add(forge);
                    info.Add(strictFiles);
                }
            }
            return info;
        }

        public static async Task<string[]> GetModpacksDirectoryList()
        {
            List<string> info = new List<string>();
            /*
             * Serve
             * -la versione
             * l'url del json
             * 
             * */
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "Modpacks.json"));
            dynamic json = JsonConvert.DeserializeObject(data);
            foreach (var item in json["Modpacks"])
            {
                var directory = (string)item["directory"];
                    info.Add(directory);
            }
            return info.ToArray();
        }

    }
}
