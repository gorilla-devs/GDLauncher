using Ionic.Zip;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace Twickt_Launcher.Classes
{

    public class MyClass
    {
        [JsonProperty("objects")]
        public IDictionary<string, ObjectValue> Objects { get; set; }
    }
    public class ObjectValue
    {
        [JsonProperty("hash")]
        public string Hash { get; set; }

        [JsonProperty("size")]
        public long Size { get; set; }

        [JsonProperty("accessToken")]
        public long accessToken { get; set; }

        [JsonProperty("id")]
        public long id { get; set; }
    }
    class JSON
    {
        //FORMATO ARRAY:  name, sha1, path, url, check
        public static List<string[]> urls = new List<string[]>();
        static int arch = ComputerInfoDetect.GetComputerArchitecture();
        public static RemoteModpacks remotemodpacks = new RemoteModpacks();
        public static List<string> downloadingVersion;
        public static string assetsurl;

        public static async Task<List<string[]>> AnalyzeAssets()
        {
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri(assetsurl));
            if (!Directory.Exists(config.M_F_P + downloadingVersion[1] + "\\assets\\indexes\\"))
                Directory.CreateDirectory(config.M_F_P + downloadingVersion[1] + "\\assets\\indexes\\");
            await c.DownloadFileTaskAsync(new Uri(assetsurl), config.M_F_P + downloadingVersion[1] + "\\assets\\indexes\\" + downloadingVersion[0] + ".json");

            List<string[]> assets = new List<string[]>();
            MyClass json = JsonConvert.DeserializeObject<MyClass>(data);
            var names = json.Objects.Keys.ToList();
            int i = 0;
            foreach (var item in names)
            {
                var hash = json.Objects[item].Hash;
                var name = hash;
                var path = @"\assets\objects\" + hash.Substring(0, 2) + "\\" + hash;
                var url = "http://resources.download.minecraft.net/";
                var finalurl = "";
                finalurl = url + hash.Substring(0, 2) + "/" + hash;
                assets.Add(new string[4] { name, hash,  "\\" + path, finalurl });
                i++;
            }
            return assets;
        }

        public static async Task<List<string[]>> AnalyzeMainJar()
        {
            List<string[]> matrix = new List<string[]>();
            string data = "";
            WebClient c = new WebClient();
            c.DownloadStringCompleted += (sender1, e) =>
            {
                try
                {
                    data = e.Result;
                }
                catch { }
            };
            await c.DownloadStringTaskAsync(new Uri("https://s3.amazonaws.com/Minecraft.Download/versions/" + downloadingVersion[0] + "/" + downloadingVersion[0] + ".json"));
            try
            {
                dynamic json = JsonConvert.DeserializeObject(data);
                var hash = "";
                var url = "";
                var path = "";
                var name = "";

                foreach (var item in json["downloads"]["client"])
                {
                    var param = item.ToString();
                    if (param.Contains("url"))
                    {
                        param = param.Replace("\"url\": \"", "");
                        url = param.Replace("\"", "");
                    }
                    if (param.Contains("sha1"))
                    {
                        param = param.Replace("\"sha1\": \"", "");
                        hash = param.Replace("\"", "");
                    }

                }
                foreach (var item in json["assetIndex"])
                {
                    var param = item.ToString();
                    if (param.Contains("url"))
                    {
                        param = param.Replace("\"url\": \"", "");
                        assetsurl = param.Replace("\"", "");
                    }
                }
                path = "";
                name = "mainjar";
                matrix.Add(new string[4] { name, hash, "\\" + path, url });
            }
            catch (JsonReaderException jex)
            {
                throw;
            }
            return matrix;
        }

        public static async Task<List<string[]>> AnalyzeStdLibraries()
        {
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri("https://s3.amazonaws.com/Minecraft.Download/versions/" + downloadingVersion[0] + "/" + downloadingVersion[0] + ".json"));
            List<string[]> libraries = new List<string[]>();
            dynamic json = JsonConvert.DeserializeObject(data);
            int i = 0;
            var hash = "";
            var url = "";
            var path = "";
            
            foreach (var item in json["libraries"])
            {
                var name = (string)item["name"];
                try
                {
                    hash = item["downloads"]["artifact"]["sha1"].ToString();
                    path = item["downloads"]["artifact"]["path"].ToString();
                    url = item["downloads"]["artifact"]["url"].ToString();
                }
                catch
                { }
                try
                {
                    if (item["natives"]["windows"] == "natives-windows")
                    {
                        try
                        {
                            hash = item["downloads"]["classifiers"]["natives-windows"]["sha1"].ToString();
                            path = item["downloads"]["classifiers"]["natives-windows"]["path"].ToString();
                            url = item["downloads"]["classifiers"]["natives-windows"]["url"].ToString();
                        }
                        catch
                        {
                            MessageBox.Show("ERRORE A " + name);
                        }
                    }
                    else if (item["natives"]["windows"] == "natives-windows-${arch}")
                    {
                        try
                        {
                            hash = item["downloads"]["classifiers"]["natives-windows-" + arch]["sha1"].ToString();
                            path = item["downloads"]["classifiers"]["natives-windows-" + arch]["path"].ToString();
                            url = item["downloads"]["classifiers"]["natives-windows-" + arch]["url"].ToString();
                        }
                        catch
                        {
                            MessageBox.Show("ERRORE A " + name);
                        }
                    }
                }
                catch { }
                libraries.Add(new string[4] { name, hash,  "\\" + path, url });
            }
            return libraries;
        }

        public static string Hash(string str)
        {
            byte[] data = File.ReadAllBytes(str);
            using (SHA1Managed sha1 = new SHA1Managed())
            {
                data = sha1.ComputeHash(data);
            }
            return BitConverter.ToString(data).Replace("-", "").ToLower();
        }

        public static async Task<List<string[]>> AnalyzeForgeLibraries(string modpackname)
        {
            List<string[]> Libraries = new List<string[]>();
            
            bool forge;
            if (downloadingVersion[2] == "false")
                forge = false;
            else
                forge = true;

            if (forge == true)
            {
                var temp = config.M_F_P + downloadingVersion[1] + @"\temp\";
                var forgejson = "http://files.minecraftforge.net/maven/net/minecraftforge/forge/promotions_slim.json";
                string urlforge = "";
                string forgeversion = "";
                //GETTING FORGE JAR URL
                WebClient c = new WebClient();
                string data = "";
                c.DownloadStringCompleted += (sender, e) =>
                {
                    data = e.Result;
                };
                await c.DownloadStringTaskAsync(new Uri(forgejson));
                try
                {
                    List<string> modpacks = new List<string>();
                    var json = Newtonsoft.Json.Linq.JObject.Parse(data);
                    var promos = json["promos"].ToObject<Dictionary<string, string>>();
                    foreach (var entry in promos)
                    {
                        if (entry.Key == downloadingVersion[0] + "-latest")
                        {
                            forgeversion = entry.Value;
                            urlforge = "http://files.minecraftforge.net/maven/net/minecraftforge/forge/" + downloadingVersion[0] + "-" + entry.Value + "-" + downloadingVersion[0] + "/forge-" + downloadingVersion[0] + "-" + entry.Value + "-" + downloadingVersion[0] + "-installer.jar";
                            config.forgeversion = downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0];
                        }
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.ToString());
                }
                var libraries = config.M_F_P + downloadingVersion[1] + @"\libraries\";
                if (!Directory.Exists(@temp))
                {
                    Directory.CreateDirectory(@temp);
                }
                if (!File.Exists(@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-installer.jar"))
                {
                    using (WebClient webClient = new WebClient())
                    {
                        //DebugMode.sendToConsole("Downloading Forge");
                        webClient.Credentials = System.Net.CredentialCache.DefaultNetworkCredentials;
                        Pages.Modpacks.loading.forgeProgress.Visibility = System.Windows.Visibility.Visible;
                        Pages.Modpacks.loading.whatdoing.Visibility = System.Windows.Visibility.Visible;
                        Pages.Modpacks.loading.whatdoing.Content = "Downloading Forge";
                        webClient.DownloadProgressChanged += (s, e) =>
                        {
                            Pages.Modpacks.loading.forgeProgress.Value = e.ProgressPercentage;
                        };


                        //FIXARE ERRORE 404 FORGE
                        await webClient.DownloadFileTaskAsync(new Uri(urlforge), (@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-installer.jar"));



                        Pages.Modpacks.loading.whatdoing.Content = "Forge Downloaded";
                        //Add them to the local
                        //DebugMode.sendToConsole("Forge Downloaded");
                    }

                    if (File.Exists(@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-installer.jar"))
                    {
                        //DebugMode.sendToConsole("Extracting necessary files from forge");
                        using (ZipFile zip = ZipFile.Read(@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-installer.jar"))
                        {
                            //ESTRAE LA LISTA JSON DI ROBA DA SCARICARE E IL FILE JAR PRINCIPALE DI FORGE
                            await Task.Factory.StartNew(() => zip.ExtractSelectedEntries("install_profile.json", "\\", @temp));
                            await Task.Factory.StartNew(() => zip.ExtractSelectedEntries("forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-universal.jar", "\\", @temp));
                        }
                        //CONTROLLA SE ESISTE LA CARTELLA DOVE METTERE IL FILE JAR, SE NON ESISTE LA CREA
                        if (!Directory.Exists(@libraries + "net\\minecraftforge\\forge\\" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + " \\"))
                        {
                            Directory.CreateDirectory(@libraries + "net\\minecraftforge\\forge\\" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "\\");
                        }
                        File.Move(@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-universal.jar", @libraries + "net\\minecraftforge\\forge\\" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "\\" + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + ".jar");
                    }
                    else
                    {
                        //NON ESISTE IL FILE INSTALLER
                    }
                }
                var dataforge = File.ReadAllText(@temp + "install_profile.json");
                dynamic jsonforge = JsonConvert.DeserializeObject(dataforge);
                foreach (var item in jsonforge["versionInfo"]["libraries"])
                {
                    var package = (string)item["name"];
                    var name = "";
                    var finalurl = "";
                    string dir = "";
                    try
                    {
                        var url = "";
                        String.IsNullOrEmpty((string)item["url"]);
                        //VERIFICA SE ESISTE NEL FILE JSON
                        try
                        {
                            url = (string)item["url"];
                        }
                        catch (JsonReaderException jex)
                        {
                        }
                        catch (Exception ex) //some other exception
                        {
                            throw;
                        }
                        //SE L'URL NON C'E' SETTA UN URL
                        if (String.IsNullOrWhiteSpace(url))
                        {
                            url = "https://libraries.minecraft.net/";
                            string[] lines = package.Split(':');
                            finalurl = url + lines[0].Replace('.', '/') + "/" + lines[1] + "/" + lines[2] + "/" + lines[1] + "-" + lines[2];
                            finalurl = finalurl + ".jar";
                            dir = finalurl.Replace("https://libraries.minecraft.net/", "")  + "\\" + lines[1] + "-" + lines[2] + ".jar";
                        }
                        //SE L'ATTUALE ELEMENTO JSON E' IL JAR DI FORGE SALTA, VIENE INFATTI SCARICATO DOPO A PARTE in downloadforge()
                        else if (package.Contains("net.minecraftforge:forge"))
                        {
                            continue;
                        }
                        //ALTRIMENTI SE L'URL ESISTE USA QUELLO
                        else
                        {
                            url = (string)item["url"];
                            string[] lines = package.Split(':');
                            finalurl = url + lines[0].Replace('.', '/') + "/" + lines[1] + "/" + lines[2] + "/" + lines[1] + "-" + lines[2];
                            //SI AGGIUNGE L'ESTENSIONE .pack.xz PER I FILE DI FORGE
                            finalurl = finalurl + ".jar.pack.xz";
                        }

                    }
                    catch (JsonReaderException jex)
                    {
                        throw;
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                    string[] lines1 = package.Split(':');
                    name = lines1[1] + "-" + lines1[2];
                    
                    if(finalurl.Contains("http://files.minecraftforge.net/maven/"))
                        dir =  finalurl.Replace("http://files.minecraftforge.net/maven/", "");
                    
                    dir = System.IO.Path.GetDirectoryName(@dir);
                    Libraries.Add(new string[4] { package, "nohash",  "\\" + dir, finalurl });
                }
            }
            return Libraries;
        }

        public static async Task<List<string[]>> GetFiles(string modpackname, bool justlibraries = false, bool justforge = false, bool remote = true)
        {
            if (remote == true)
                downloadingVersion = await RemoteModpacks.GetMinecraftUrlsAndData(modpackname);
            else
                downloadingVersion = await LocalModpacks.GetMinecraftUrlsAndData(modpackname);


            Windows.DebugOutputConsole.singleton.Write("Analyzing JSON files");
            List<string[]> mods = new List<string[]>();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = "Analyzing Json Files";
            }
            catch { }

            List<string[]> list = new List<string[]>();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = "Analyzing Main Jar";
            }
            catch { }
            List<string[]> mainjar = await AnalyzeMainJar();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = "Analyzing Assets";
            }
            catch { }
            List<string[]> assets = await AnalyzeAssets();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = "Analyzing Standard Libraries";
            }
            catch { }
            List<string[]> libraries = await AnalyzeStdLibraries();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = "Analyzing Forge Libraries";
            }
            catch { }
            List<string[]> forge = await AnalyzeForgeLibraries(modpackname);
            if (remote == true)
            {
                try
                {
                    Pages.Modpacks.loading.whatdoing.Content = "Analyzing Mods";
                }
                catch { }
                mods = await Classes.RemoteModpacks.GetModpacksFiles(modpackname);
            }

            if ((justforge == false) && (justlibraries == false))
                list.AddRange(assets);
            if ((justforge == false) && (justlibraries == false))
                list.AddRange(mainjar);
            if ((justlibraries == false && justforge == false) || (justlibraries == true && justforge == false))
                list.AddRange(libraries);
            if ((justlibraries == false && justforge == true) || (justlibraries == false && justforge == false))
                list.AddRange(forge);
            if ((justlibraries == false && justforge == false) && (remote == true))
                list.AddRange(mods);
            Windows.DebugOutputConsole.singleton.Write("JSON files analyzed");
            urls = list;

            return list.Distinct().ToList();
        }


    }
}
