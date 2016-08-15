using Ionic.Zip;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
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
        public static Stopwatch sw = new Stopwatch();
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
                name = "mainjar";
                matrix.Add(new string[4] { name, hash, "\\" + @"\versions\" + downloadingVersion[0] + "\\" + downloadingVersion[0] + ".jar" , url });
            }
            catch (JsonReaderException)
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
                            MessageBox.Show(lang.languageswitch.errorIn + " " + name);
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
                            MessageBox.Show(lang.languageswitch.errorIn + " " + name);
                        }
                    }
                }
                catch { }
                libraries.Add(new string[4] { name, hash,  "\\" + @"\libraries\" + path.Replace("/", "\\"), url });
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
            ///////////////////////
            //DEFINIZIONE VARIABILI
            ///////////////////////
            List<string[]> Libraries = new List<string[]>();
            string urlforge = "";
            string forgeversion = "";
            WebClient c = new WebClient();
            string data = "";
            string forgefilename = "";
            string tweakclass = "";
            string mainclass = "";
            string forgefilepath = "";
            bool forge;
            var temp = config.M_F_P + downloadingVersion[1] + @"\temp\";
            var forgejson = "http://files.minecraftforge.net/maven/net/minecraftforge/forge/promotions_slim.json";
            /////////////////////////////////////////
            //CONTROLLO SE FORGE E' DA SCARICARE O NO
            /////////////////////////////////////////
            if (downloadingVersion[2] == "false")
                forge = false;
            else
                forge = true;


            if (forge == true)
            {
                ///////////////////////
                //GETTING FORGE VERSION JSON FILE
                c.DownloadStringCompleted += (sender, e) =>
                {
                    data = e.Result;
                };
                await c.DownloadStringTaskAsync(new Uri(forgejson));
                //////////////////////
                try
                {
                    //READING FORGE VERSION JSON FILE AND PARSING IT
                    List<string> modpacks = new List<string>();
                    var json = Newtonsoft.Json.Linq.JObject.Parse(data);
                    var promos = json["promos"].ToObject<Dictionary<string, string>>();
                    foreach (var entry in promos)
                    {
                        //SE LA VERSIONE DI MINECRAFT VIENE TROVATA VIENE PRESA LA RELATIVA VERSIONE DI FORGE
                        //DATO CHE FORGE UTILIZZA DUE TIPI DI URL VIENE FATTA UNA PROVA SUL PRIMO, SE DA ERRORE SI USA IL SECONDO
                        if (entry.Key == downloadingVersion[0] + "-latest")
                        {
                            forgeversion = entry.Value;
                            forgefilename = downloadingVersion[0] + "-" + entry.Value + "-" + downloadingVersion[0];
                            WebRequest webRequest = WebRequest.Create("http://files.minecraftforge.net/maven/net/minecraftforge/forge/" + forgefilename + "/forge-" + forgefilename + "-installer.jar");
                            WebResponse webResponse;
                            try
                            {
                                webResponse = webRequest.GetResponse();

                            }
                            catch //If exception thrown then couldn't get response from address
                            {
                                forgefilename = downloadingVersion[0] + "-" + entry.Value;
                            }
                            
                        }
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.ToString());
                }
                //VIENE SETTATA LA VERSIONE DI FORGE GLOBALMENTE NEL LAUNCHER
                config.forgeversion = downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0];
                /////////////////////////////////////////////////////////////
                var libraries = config.M_F_P + downloadingVersion[1] + @"\libraries\";
                if (!Directory.Exists(@temp))
                {
                    Directory.CreateDirectory(@temp);
                }

                //VIENE SCARICATO IL FILE INSTALLER.JAR DI FORGE CHE CONTIENE SIA IL JSON DEI FILE DI FORGE SIA FORGE VERO E PROPRIO, QUINDI ESTRAIAMO QUEI DUE FILE
                //E CANCELLIAMO L'INSTALLER
                if (!File.Exists(@temp + "forge-" + forgefilename + "-installer.jar"))
                {
                    using (WebClient webClient = new WebClient())
                    {
                        ///////////////////////////////////////////////
                        //VIENE SCARICATO L'INSTALLER
                        urlforge = "http://files.minecraftforge.net/maven/net/minecraftforge/forge/" + forgefilename + "/forge-" + forgefilename + "-installer.jar";
                        webClient.Credentials = System.Net.CredentialCache.DefaultNetworkCredentials;
                        if (Pages.Modpacks.singleton.remote.IsSelected)
                        {
                            Pages.Modpacks.loading.forgeProgress.Visibility = System.Windows.Visibility.Visible;
                            Pages.Modpacks.loading.whatdoing.Visibility = System.Windows.Visibility.Visible;
                            Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.downloadingForge;
                        }
                        if(Pages.Modpacks.singleton.local.IsSelected)
                            Pages.Modpacks.localmodpackadd.progress.Visibility = Visibility.Visible;
                        webClient.DownloadProgressChanged += (s, e) =>
                        {
                            if (Pages.Modpacks.singleton.local.IsSelected)
                                Pages.Modpacks.localmodpackadd.progress.Value = e.ProgressPercentage;
                            if (Pages.Modpacks.singleton.remote.IsSelected)
                            {
                                Pages.Modpacks.loading.forgeProgress.Value = e.ProgressPercentage;
                                Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.downloadingForge + " " + string.Format("{0} kb/s", (e.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                            }
                        };
                        sw.Start();
                        await webClient.DownloadFileTaskAsync(new Uri(urlforge), (@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-installer.jar"));
                        sw.Stop();
                        if (Pages.Modpacks.singleton.remote.IsSelected)
                            Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.downloadedForge;
                        //////////////////////////////////////////////
                    }
                    ////////////////////////////////////////////////////////////////////////////////////////
                    //VERIFICA SE L'INSTALLER SCARICATO ESISTE, SE ESISTE PROCEDE CON L'ESTRAZIONE DEI DUE FILES
                    if (File.Exists(@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-installer.jar"))
                    {
                        using (ZipFile zip = ZipFile.Read(@temp + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "-installer.jar"))
                        {
                            //ESTRAE LA LISTA JSON DI ROBA DA SCARICARE E IL FILE JAR PRINCIPALE DI FORGE
                            await Task.Factory.StartNew(() => zip.ExtractSelectedEntries("install_profile.json", "\\", @temp, ExtractExistingFileAction.OverwriteSilently));
                            //LEGGE DAL FILE PROFILE JSON IL NOME DEL FILE DI FORGE DA ESTRARRE
                            var x = File.ReadAllText(@temp + "install_profile.json");
                            dynamic x1 = JsonConvert.DeserializeObject(x);
                            forgefilepath = x1["install"]["filePath"];
                            await Task.Factory.StartNew(() => zip.ExtractSelectedEntries(forgefilepath, "\\", @temp, ExtractExistingFileAction.OverwriteSilently));
                        }
                        //CONTROLLA SE ESISTE LA CARTELLA DOVE METTERE IL FILE PRINCIPALE DI FORGE, SE NON ESISTE LA CREA
                        if (!Directory.Exists(@libraries + "net\\minecraftforge\\forge\\" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + " \\"))
                        {
                            Directory.CreateDirectory(@libraries + "net\\minecraftforge\\forge\\" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "\\");
                        }
                        await Task.Delay(500);
                        try
                        {
                            //MessageBox.Show(@temp + forgefilepath);
                            //SPOSTA IL FILE PRINCIPALE DI FORGE APPENA ESTRATTO NELLA CARTELLA LIBRARIES
                            File.Move(@temp + forgefilepath, @libraries + "net\\minecraftforge\\forge\\" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + "\\" + "forge-" + downloadingVersion[0] + "-" + forgeversion + "-" + downloadingVersion[0] + ".jar");
                        }
                        catch
                        {
                            MessageBox.Show(lang.languageswitch.extractedForgeNotFound);
                        }
                        }
                    else
                    {
                        MessageBox.Show(lang.languageswitch.forgeInstallerNotExist);
                    }
                }

                /////////////////////////////////////////////////////////////////////////////////////////////////////
                //INIZIA LA LETTURA DEL FILE JSON APPENA ESTRATTO CON LA LISTA DI TUTTE LE LIBRERIE E I DATI DI FORGE
                /////////////////////////////////////////////////////////////////////////////////////////////////////
                var dataforge = File.ReadAllText(@temp + "install_profile.json");
                dynamic jsonforge = JsonConvert.DeserializeObject(dataforge);
                tweakclass = jsonforge["versionInfo"]["minecraftArguments"];
                mainclass = jsonforge["versionInfo"]["mainClass"];
                config.mainclass = mainclass;
                config.arguments = tweakclass;
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
                        catch (JsonReaderException)
                        {
                        }
                        catch (Exception) //some other exception
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
                            finalurl = "http://search.maven.org/remotecontent?filepath=" + lines[0].Replace('.', '/') + "/" + lines[1] + "/" + lines[2] + "/" + lines[1] + "-" + lines[2];
                            //SI AGGIUNGE L'ESTENSIONE .pack.xz PER I FILE DI FORGE
                            finalurl = finalurl + ".jar";
                            dir = finalurl.Replace("http://search.maven.org/remotecontent?filepath=", "") + "\\" + lines[1] + "-" + lines[2] + ".jar";
                        }

                    }
                    catch (JsonReaderException)
                    {
                        throw;
                    }
                    catch (Exception)
                    {
                        throw;
                    }
                    string[] lines1 = package.Split(':');
                    name = lines1[1] + "-" + lines1[2];
                    
                    if(finalurl.Contains("http://files.minecraftforge.net/maven/"))
                        dir =  dir.Replace("http://files.minecraftforge.net/maven/", "");
                    if (finalurl.Contains("http://search.maven.org/remotecontent?filepath="))
                        dir = dir.Replace("http://search.maven.org/remotecontent?filepath=", "");

                    dir = System.IO.Path.GetDirectoryName(@dir);
                    if (((string)item["clientreq"] != "False") || ((string)item["clientreq"] == ""))
                    {
                        Libraries.Add(new string[4] { package, "nohash", @"\libraries\" + dir, finalurl });
                    }
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


            Windows.DebugOutputConsole.singleton.Write(lang.languageswitch.analyzingJsonFiles);
            List<string[]> mods = new List<string[]>();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.analyzingJsonFiles;
            }
            catch { }

            List<string[]> list = new List<string[]>();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.analyzingMainJar;
            }
            catch { }
            List<string[]> mainjar = await AnalyzeMainJar();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.analyzingAssets;
            }
            catch { }
            List<string[]> assets = await AnalyzeAssets();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.analyzingStandardLibraries;
            }
            catch { }
            List<string[]> libraries = await AnalyzeStdLibraries();
            try
            {
                Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.analyzingForgeLibraries;
            }
            catch { }
            List<string[]> forge = await AnalyzeForgeLibraries(modpackname);
            if (remote == true)
            {
                try
                {
                    Pages.Modpacks.loading.whatdoing.Content = lang.languageswitch.analyzingMods;
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
            Windows.DebugOutputConsole.singleton.Write(lang.languageswitch.jsonFileAnalyzed);
            urls = list;

            return list.Distinct().ToList();
        }


    }
}
