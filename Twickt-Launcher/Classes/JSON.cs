// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Raccoglie tutta la lista di URLs necessari per scaricare il pacchetto*/
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
    public class Lib
    {
        public string path { get; set; }
    }

    public class JSONModpack
    {
        public string modpackName { get; set; }
        public string modpackVersion { get; set; }
        public string instanceName { get; set; }
        public string forgeVersion { get; set; }
        public string forgeFileName { get; set; }
        public string mc_version { get; set; }
        public string mainClass { get; set; }
        public string arguments { get; set; }
        public string version_type { get; set; }
        public List<Lib> libs { get; set; }
    }
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
        //FORMATO ARRAY:  name, sha1, path, url
        public static List<string[]> urls = new List<string[]>();
        static int arch = ComputerInfoDetect.GetComputerArchitecture();
        //public static RemoteModpacks remotemodpacks = new RemoteModpacks();
                                                       
        public static JSONModpack packjson = new JSONModpack();
        public static Stopwatch sw = new Stopwatch();
        public static string forgeName = "";

        //L'URL viene preso nella funzione mainjar(), poiche' il link si trova nel json
        public static string assetsurl;
        
        public static async Task<List<string[]>> AnalyzeMainJar(string version, string instanceName)
        {
            List<string[]> matrix = new List<string[]>();
            string data = "";
            WebClient c = new WebClient();
            string versionURL = "";
            var downloadedJSON = await c.DownloadDataTaskAsync("https://launchermeta.mojang.com/mc/game/version_manifest.json");
            dynamic versionsJSON = JsonConvert.DeserializeObject(Encoding.UTF8.GetString(downloadedJSON));
            try
            {
                foreach (var v in versionsJSON["versions"])
                {
                    if (version == Convert.ToString(v.id))
                        versionURL = Convert.ToString(v.url);
                }
            }
            catch(Exception e)
            {
                Dialogs.InstallModpack.singleton.isError.Visibility = Visibility.Visible;
            }



            c.DownloadStringCompleted += (sender1, e) =>
            {
                try
                {
                    data = e.Result;
                }
                catch { }
            };
            await c.DownloadStringTaskAsync(versionURL);
            try
            {
                dynamic json = await Task.Run( () => JsonConvert.DeserializeObject(data));
                var hash = "";
                var url = "";
                var name = "";
                packjson.mainClass = json.mainClass;
                
                packjson.arguments = json.minecraftArguments;
                packjson.version_type = json.type;
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
                matrix.Add(new string[4] { name, hash, ("Packs\\" + instanceName + "\\" + @"\versions\" + version + "\\" + version + ".jar"), url });
            }
            catch (JsonReaderException)
            {
                throw;
            }
            return matrix;
        }

        public static async Task<List<string[]>> AnalyzeStdLibraries(string version, string instanceName)
        {
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri("https://s3.amazonaws.com/Minecraft.Download/versions/" + version + "/" + version + ".json"));
            List<string[]> libraries = new List<string[]>();
            dynamic json = await Task.Run( () => JsonConvert.DeserializeObject(data));
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
                            Dialogs.InstallModpack.singleton.isError.Visibility = Visibility.Visible;
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
                            Dialogs.InstallModpack.singleton.isError.Visibility = Visibility.Visible;
                        }
                    }
                }
                catch { }
                libraries.Add(new string[4] { name, hash, "Packs\\" + instanceName + @"\libraries\" + path.Replace("/", "\\"), url });
            }
            return libraries;
        }

        public static async Task<List<string[]>> AnalyzeAssets(string version, string instanceName)
        {
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri(assetsurl));
            if (!Directory.Exists(config.M_F_P + "Packs\\" + instanceName + "\\assets\\indexes\\"))
                Directory.CreateDirectory(config.M_F_P + "Packs\\" + instanceName + "\\assets\\indexes\\");
            await c.DownloadFileTaskAsync(new Uri(assetsurl), config.M_F_P + "Packs\\" + instanceName + "\\assets\\indexes\\" + version + ".json");

            List<string[]> assets = new List<string[]>();
            MyClass json = await Task.Run( () => JsonConvert.DeserializeObject<MyClass>(data));
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
                assets.Add(new string[4] { name, hash, "Packs\\" + instanceName + "\\" + path, finalurl });
                i++;
            }
            return assets;
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

        public static async Task<List<string[]>> AnalyzeForgeLibraries(string modpackname, string version, string instanceName, string forgeVersion)
        {
            ///////////////////////
            //DEFINIZIONE VARIABILI
            ///////////////////////
            List<string[]> Libraries = new List<string[]>();
            string urlforge = "";
            WebClient c = new WebClient();
            string data = "";
            string forgefilename = "";
            string tweakclass = "";
            string mainclass = "";
            string forgefilepath = "";
            var temp = config.M_F_P + "Packs\\" + instanceName + @"\temp\";
            using (StreamReader r = new StreamReader(config.M_F_P + "forgeVersions.json"))
            {
                data = await r.ReadToEndAsync();
            }
            //READING FORGE VERSION JSON FILE AND PARSING IT
            List<string> modpacks = new List<string>();
            dynamic json = JsonConvert.DeserializeObject(data);
            foreach (var entry in json["number"])
            {
                //SE LA VERSIONE DI MINECRAFT VIENE TROVATA VIENE PRESA LA RELATIVA VERSIONE DI FORGE
                //DATO CHE FORGE UTILIZZA DUE TIPI DI URL VIENE FATTA UNA PROVA SUL PRIMO, SE DA ERRORE SI USA IL SECONDO
                if (entry.Value.version == forgeVersion)
                {
                    forgefilename = version + "-" + forgeVersion + "-" + entry.Value.branch;
                    forgeName = version + "-" + forgeVersion + "-" + entry.Value.branch;
                    WebRequest webRequest = WebRequest.Create("http://files.minecraftforge.net/maven/net/minecraftforge/forge/" + forgefilename + "/forge-" + forgefilename + "-installer.jar");
                    WebResponse webResponse;
                    try
                    {
                        webResponse = webRequest.GetResponse();

                    }
                    catch //If exception thrown then couldn't get response from address
                    {
                        forgefilename = version + "-" + forgeVersion;
                        forgeName = version + "-" + forgeVersion;
                    }
                    urlforge = "http://files.minecraftforge.net/maven/net/minecraftforge/forge/" + forgefilename + "/forge-" + forgefilename + "-installer.jar";
                }
            }
            /////////////////////////////////////////////////////////////
            var libraries = config.M_F_P + "Packs\\" + instanceName + @"\libraries\";
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
                    Console.WriteLine(urlforge);
                    webClient.Credentials = System.Net.CredentialCache.DefaultNetworkCredentials;
                    webClient.DownloadProgressChanged += (s, e) =>
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Dialogs.InstallModpack.singleton.forgeProgression.Value = e.ProgressPercentage;
                            Dialogs.InstallModpack.singleton.forgeTextProgression.Content = string.Format("{0} kb/s", (e.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                        }));
                    };
                    webClient.DownloadFileCompleted += (s, e) =>
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Dialogs.InstallModpack.singleton.forgeTextProgression.Content = "Download Completed";
                        }));
                    };
                    sw.Start();
                    await webClient.DownloadFileTaskAsync(new Uri(urlforge), (@temp + "forge-" + forgefilename + "-installer.jar"));
                    sw.Stop();
                }
                ////////////////////////////////////////////////////////////////////////////////////////
                //VERIFICA SE L'INSTALLER SCARICATO ESISTE, SE ESISTE PROCEDE CON L'ESTRAZIONE DEI DUE FILES
                if (File.Exists(@temp + "forge-" + forgefilename + "-installer.jar"))
                {
                    using (ZipFile zip = ZipFile.Read(@temp + "forge-" + forgefilename + "-installer.jar"))
                    {
                        //ESTRAE LA LISTA JSON DI ROBA DA SCARICARE E IL FILE JAR PRINCIPALE DI FORGE
                        await Task.Factory.StartNew(() => zip.ExtractSelectedEntries("install_profile.json", "\\", @temp, ExtractExistingFileAction.OverwriteSilently));
                        //LEGGE DAL FILE PROFILE JSON IL NOME DEL FILE DI FORGE DA ESTRARRE
                        var x = File.ReadAllText(@temp + "install_profile.json");
                        dynamic x1 = await Task.Run( () => JsonConvert.DeserializeObject(x));
                        forgefilepath = x1["install"]["filePath"];
                        await Task.Factory.StartNew(() => zip.ExtractSelectedEntries(forgefilepath, "\\", @temp, ExtractExistingFileAction.OverwriteSilently));
                    }
                    //CONTROLLA SE ESISTE LA CARTELLA DOVE METTERE IL FILE PRINCIPALE DI FORGE, SE NON ESISTE LA CREA
                    if (!Directory.Exists(@libraries + "net\\minecraftforge\\forge\\" + forgefilename + " \\"))
                    {
                        Directory.CreateDirectory(@libraries + "net\\minecraftforge\\forge\\" + forgefilename + "\\");
                    }
                    await Task.Delay(500);
                    try
                    {
                        //MessageBox.Show(@temp + forgefilepath);
                        //SPOSTA IL FILE PRINCIPALE DI FORGE APPENA ESTRATTO NELLA CARTELLA LIBRARIES
                        File.Move(@temp + forgefilepath, @libraries + "net\\minecraftforge\\forge\\" + forgefilename + "\\" + "forge-" + forgefilename + ".jar");
                    }
                    catch
                    {
                        MessageBox.Show(Pages.SplashScreen.singleton.manager.GetString("extractedForgeNotFound"));
                    }
                    }
                else
                {
                    MessageBox.Show(Pages.SplashScreen.singleton.manager.GetString("forgeInstallerNotExist"));
                }
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////
            //INIZIA LA LETTURA DEL FILE JSON APPENA ESTRATTO CON LA LISTA DI TUTTE LE LIBRERIE E I DATI DI FORGE
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            var dataforge = File.ReadAllText(@temp + "install_profile.json");
            dynamic jsonforge = await Task.Run ( () => JsonConvert.DeserializeObject(dataforge));
            tweakclass = jsonforge["versionInfo"]["minecraftArguments"];
            mainclass = jsonforge["versionInfo"]["mainClass"];
            config.mainclass = mainclass;
            packjson.mainClass = mainclass;
            packjson.arguments = tweakclass;
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
                if (((string)item["clientreq"] != "false") || ((string)item["clientreq"] == ""))
                {
                    Libraries.Add(new string[4] { package, "nohash", "Packs\\" + instanceName + @"\libraries\" + dir, finalurl });
                }
            }
            return Libraries;
        }

        public static async Task<List<string[]>> GetFiles(string modpackname, string instanceName, string version, string forgeVersion, string modpackVersion,  bool justlibraries = false)
        {

            //SCRITTURA JSON MODPACK
            packjson.modpackName = modpackname;
            packjson.instanceName = instanceName;
            packjson.modpackVersion = modpackVersion;
            packjson.forgeVersion = forgeVersion;
            packjson.mc_version = version;
            packjson.libs = new List<Lib>();

            try
            {

                List<string[]> list = new List<string[]>();
                List<string[]> forge = new List<string[]>();

                Dialogs.InstallModpack.singleton.whatDoing.Content = "Analysing Main Jar";
                List<string[]> mainjar = await Task.Run(() => AnalyzeMainJar(version, instanceName));
                list.AddRange(mainjar);
                Dialogs.InstallModpack.singleton.whatDoing.Content = "Analyzing Libs";
                List<string[]> libraries = await Task.Run(() => AnalyzeStdLibraries(version, instanceName));
                list.AddRange(libraries);
                Dialogs.InstallModpack.singleton.whatDoing.Content = "Analysing Assets";
                List<string[]> assets = await Task.Run(() => AnalyzeAssets(version, instanceName));
                list.AddRange(assets);
                if (forgeVersion != "false")
                {
                    Dialogs.InstallModpack.singleton.whatDoing.Content = "Analysing Forge";
                    forge = await Task.Run(() => AnalyzeForgeLibraries(modpackname, version, instanceName, forgeVersion));
                    list.AddRange(forge);
                    Dialogs.InstallModpack.singleton.whatDoing.Content = "Analyzing Mods";
                }
                //AGGIUNGE LE LIBRERIE AL JSON
                if (forgeVersion != "false")
                {
                    foreach (var item in forge)
                    {
                        if (item[3].Contains("platform"))
                            continue;
                        if (item[3].Contains("https://libraries.minecraft.net"))
                        {
                            packjson.libs.Add(new Lib { path = item[2] });
                        }
                        if (item[3].Contains("http://search.maven.org/remotecontent?filepath="))
                        {
                            packjson.libs.Add(new Lib { path = item[2] });
                        }
                    }
                }
                foreach (var item in libraries)
                {
                    if (item[3].Contains("platform"))
                        continue;
                    if (item[3].Contains("https://libraries.minecraft.net"))
                    {
                        packjson.libs.Add(new Lib { path = item[2] });
                    }
                    if (forgeVersion != "false")
                    {
                        if (item[3].Contains("http://search.maven.org/remotecontent?filepath="))
                        {
                            packjson.libs.Add(new Lib { path = item[2] });
                        }
                    }
                }
                packjson.libs = packjson.libs.Distinct().ToList();
                packjson.forgeFileName = forgeName;
                string json = await Task.Run(() => JsonConvert.SerializeObject(packjson, Formatting.Indented));
                if (!Directory.Exists(Path.GetDirectoryName(config.M_F_P + "Packs\\" + instanceName + "\\" + instanceName + ".json")))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(config.M_F_P + "Packs\\" + instanceName + "\\" + instanceName + ".json"));
                }
                await Task.Run(() => System.IO.File.WriteAllText(config.M_F_P + "Packs\\" + instanceName + "\\" + instanceName + ".json", json));

                Dialogs.InstallModpack.singleton.whatDoing.Content = "Analysis Finished";
                Dialogs.InstallModpack.singleton.analysisprogress.Visibility = Visibility.Hidden;
                Dialogs.InstallModpack.singleton.analysisprogress.Width = 0;
                Dialogs.InstallModpack.singleton.analysisprogress.Margin = new Thickness(0);
                Dialogs.InstallModpack.singleton.analysisended.Margin = new Thickness(20, 10, 10, 0);
                Dialogs.InstallModpack.singleton.analysisended.Width = 50;
                Dialogs.InstallModpack.singleton.analysisended.Height = 50;
                List<string[]> newList = new List<string[]>();
                await Task.Run(() =>
                {
                    foreach (var x in list)
                    {
                        var found = false;
                        foreach (var n in newList)
                        {
                            if (n[3] == x[3])
                                found = true;
                        }
                        if (!found)
                        {
                            newList.Add(x);
                        }
                    }
                });

                return newList;
            }
            catch(Exception e)
            {
                MessageBox.Show(e.Message);
            }
            return null;

        }


    }
}
