using Ionic.Zip;
using SevenZip;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per StartingWorking.xaml
    /// </summary>
    public partial class StartingWorking : Page
    {
        public string name { get; set; }
        static WebClient webClient = new WebClient();               // Our WebClient that will be doing the downloading for us
        static Stopwatch sw = new Stopwatch();                      // The stopwatch which we will be using to calculate the download speed
        private Queue<string> _downloadlibraries = new Queue<string>();
        string mainjar = config.M_F_P + @"versions\1.7.10\1.7.10.jar";
        static int actual = 0;
        public static bool tempcontinuedownload = true;
        public static StartingWorking singleton;

        public static List<string> urls;
        public StartingWorking()
        {
            InitializeComponent();
            Window1.singleton.MenuToggleButton.IsEnabled = false;
            singleton = this;
            getbacktomodpack.Visibility = Visibility.Hidden;

        }

        private void cancel_Click(object sender, RoutedEventArgs e)
        {
            //Window1.singleton.MainPage.Navigate(new Pages.Modpacks());
        }

        public async Task librariesdownload()
        {
            //FILES DA SCARICARE
            /*
            JAR 1.7.10 https://s3.amazonaws.com/Minecraft.Download/versions/1.7.10/1.7.10.jar
            JSON 1.7.10 https://s3.amazonaws.com/Minecraft.Download/versions/1.7.10/1.7.10.json
            QUI IL RESTO http://wiki.vg/Game_Files
            http://minecraft.gamepedia.com/Tutorials/Update_LWJGL_(Legacy
            http://wiki.vg/Minecraft.net
            https://bitbucket.org/GreaseMonk/epicserver.nl-launcher/overview



            ALTRA DOCUMENTAZIONE
            http://www.newtonsoft.com/json/help/html/QueryingLINQtoJSON.htm
            https://msdn.microsoft.com/it-it/library/Cc197957(v=VS.95).aspx
            http://www.masnun.com/2011/07/08/quick-json-parsing-with-c-sharp.html



            */
            workingThreads.Content = Properties.Settings.Default["download_threads"].ToString();
            modpackName.Content = Modpacks.singleton.remoteModpacks.SelectedItem.ToString();

            int count = urls.Count;
            if (urls != null && urls.Count != 0)
            {
                System.Net.ServicePointManager.DefaultConnectionLimit = Int32.Parse(Properties.Settings.Default["download_threads"].ToString());
                var block = new System.Threading.Tasks.Dataflow.ActionBlock<string>(async url =>
                {
                    try
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Windows.DebugOutputConsole.singleton.Write(url);
                        }));
                        await DownloadLibraries(url);
                        await ExtractForgeFiles(url);
                    }
                    catch(Exception e)
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Windows.DebugOutputConsole.singleton.Write("ERRORE IN" + url + "\r\n" + e);
                        }));
                        MessageBox.Show("ERRORE IN" + url + "\r\n" + e);
                    }
                }, new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = Int32.Parse(Properties.Settings.Default["download_threads"].ToString()) });

                foreach (var url in urls)
                {
                    block.Post(url);
                }

                block.Complete();
                await block.Completion;
                filesToDownload.Content = count.ToString() + "/" + count.ToString();
                totalProgress.Value = 100;
                totalPercentage.Content = "100%";
                await Task.Delay(1000);
                getbacktomodpack.Visibility = Visibility.Visible;


            }
            Classes.MinecraftStarter.Minecraft_Start();
        }

        //------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------
        //FUNZIONE PER IL DOWNLOAD DEI FILE IN CODA
        //------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------

        public async Task DownloadLibraries(string url, IProgress<int> progress = null)
        {
            try
            {
                int count = urls.Count;
                var temp = config.M_F_P + @"temp\";
                if (!Directory.Exists(@temp))
                {
                    Directory.CreateDirectory(@temp);
                }

                sw.Start();
                webClient.DownloadProgressChanged += new DownloadProgressChangedEventHandler((sender, e) => client_DownloadProgressChanged(sender, e));
                string DebugFile = "";
                if (url.Contains("https://libraries.minecraft.net"))
                {
                    string dir = config.M_F_P + @"libraries\" + url.Replace("https://libraries.minecraft.net", "");
                    //localpath = localpath.Replace("/","\\");
                    string FileName = System.IO.Path.GetFileName(dir);
                    DebugFile = url.Replace("https://libraries.minecraft.net", "");
                    //MessageBox.Show(FileName);
                    dir = System.IO.Path.GetDirectoryName(@dir);
                    //MessageBox.Show(@dir);
                    if (!Directory.Exists(@dir))
                    {
                        Directory.CreateDirectory(@dir);
                    }
                    using (HttpClient client = new HttpClient())
                    using (HttpResponseMessage response = await client.GetAsync(url))
                    using (HttpContent content = response.Content)
                    {
                        // ... Read the string.
                        using (var fileStream = new FileStream(@dir + "\\" + FileName, FileMode.Create, FileAccess.Write))
                        {
                            await content.CopyToAsync(fileStream);
                        }
                    }
                }
                else if (url.Contains("https://launcher.mojang.com/mc/game/1.7.10/client/e80d9b3bf5085002218d4be59e668bac718abbc6/client.jar"))
                {
                    string dir = config.M_F_P + @"versions\1.7.10\";
                    DebugFile = url.Replace("https://launcher.mojang.com/mc/game/1.7.10/client/e80d9b3bf5085002218d4be59e668bac718abbc6/client.jar", "");
                    string FileName = "1.7.10.jar";

                    //MessageBox.Show(FileName);
                    //MessageBox.Show(@dir);
                    if (!Directory.Exists(@dir))
                    {
                        Directory.CreateDirectory(@dir);
                    }
                    using (HttpClient client = new HttpClient())
                    using (HttpResponseMessage response = await client.GetAsync(url))
                    using (HttpContent content = response.Content)
                    {
                        // ... Read the string.
                        using (var fileStream = new FileStream(@dir + "\\" + FileName, FileMode.Create, FileAccess.Write))
                        {
                            await content.CopyToAsync(fileStream);
                        }
                    }
                }
                else if (url.Contains("http://resources.download.minecraft.net/"))
                {
                    string dir = config.M_F_P + @"assets\objects\" + url.Replace("http://resources.download.minecraft.net/", "");
                    DebugFile = url.Replace("http://resources.download.minecraft.net/", "");
                    string FileName = System.IO.Path.GetFileName(dir);

                    //MessageBox.Show(FileName);
                    dir = System.IO.Path.GetDirectoryName(@dir);
                    //MessageBox.Show(@dir);
                    if (!Directory.Exists(@dir))
                    {
                        Directory.CreateDirectory(@dir);
                    }
                    using (HttpClient client = new HttpClient())
                    using (HttpResponseMessage response = await client.GetAsync(url))
                    using (HttpContent content = response.Content)
                    {
                        // ... Read the string.
                        using (var fileStream = new FileStream(@dir + "\\" + FileName, FileMode.Create, FileAccess.Write))
                        {
                            await content.CopyToAsync(fileStream);
                        }
                    }
                }
                else if (url.Contains("http://files.minecraftforge.net/maven/"))
                {
                    string dir = config.M_F_P + @"libraries\" + url.Replace("http://files.minecraftforge.net/maven/", "");
                    DebugFile = url.Replace("http://files.minecraftforge.net/maven/", "");
                    string FileName = System.IO.Path.GetFileName(dir);

                    //MessageBox.Show(FileName);
                    dir = System.IO.Path.GetDirectoryName(@dir);
                    //MessageBox.Show(@dir);
                    if (!Directory.Exists(@dir))
                    {
                        Directory.CreateDirectory(@dir);
                    }
                    using (HttpClient client = new HttpClient())
                    using (HttpResponseMessage response = await client.GetAsync(url))
                    using (HttpContent content = response.Content)
                    {
                        // ... Read the string.
                        using (var fileStream = new FileStream(@dir + "\\" + FileName, FileMode.Create, FileAccess.Write))
                        {
                            await content.CopyToAsync(fileStream);
                        }
                    }
                }
                else if (url.Contains(config.updateWebsite))
                {
                    string dir = config.M_F_P + @"instances\" + url.Replace(config.updateWebsite, "");
                    DebugFile = url.Replace(config.updateWebsite, "");
                    string FileName = System.IO.Path.GetFileName(dir);
                    dir = System.IO.Path.GetDirectoryName(@dir);
                    if (!Directory.Exists(@dir))
                    {
                        Directory.CreateDirectory(@dir);
                    }
                    using (HttpClient client = new HttpClient())
                    using (HttpResponseMessage response = await client.GetAsync(url))
                    using (HttpContent content = response.Content)
                    {
                        // ... Read the string.
                        using (var fileStream = new FileStream(@dir + "\\" + FileName, FileMode.Create, FileAccess.Write))
                        {
                            await content.CopyToAsync(fileStream);
                        }
                    }
                }
                if (url.Contains("platform"))
                {
                    await ExtractNatives(url);
                }
                Application.Current.Dispatcher.Invoke(new Action(() =>
                {
                    string urlnum = this.filesToDownload.Content.ToString().Split('/')[0];
                    if (Array.IndexOf(urls.ToArray(), url) > Int32.Parse(urlnum))
                        this.filesToDownload.Content = Array.IndexOf(urls.ToArray(), url) + "/" + count.ToString();

                    if (((Array.IndexOf(urls.ToArray(), url) * 100) / count) > totalProgress.Value)
                    {
                        this.totalProgress.Value = (Array.IndexOf(urls.ToArray(), url) * 100) / count;
                        this.totalPercentage.Content = (Array.IndexOf(urls.ToArray(), url) * 100) / count + "%";
                    }
                    
                }));
                actual++;
            }
            catch
            {
                MessageBox.Show("ERRORE A SCARICARE " + url);
            }

        }

        //------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------
        //FUNZIONE PER QUANDO IL DOWNLOAD DEI DI OGNI SINGOLO FINE FINISCE
        //------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------
        private static void client_DownloadlibrariesCompleted(object sender, AsyncCompletedEventArgs e)
        {
            if (e.Error != null)
            {
                // handle error scenario
                throw e.Error;
            }
            if (e.Cancelled)
            {
                // handle cancelled scenario
            }
            Windows.DebugOutputConsole.singleton.Write(e.UserState.ToString());

        }

        //------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------
        //FUNZIONE PER AGGIORNARE I DATI DURANTE IL DOWNLOAD(VELOCITA'/PROGRESSBAR)
        //------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------
        void client_DownloadProgressChanged(object sender, DownloadProgressChangedEventArgs e)
        {
            //if (config.debug == true) Downloading.singleton.progressBarlocal.Value = e.ProgressPercentage;
            //Forms.Working.singleton.kbps.Content = string.Format("{0} kb/s", (e.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
            //Forms.Working.singleton.todownload.Content = string.Format("{0} MB / {1} MB", (e.BytesReceived / 1024d / 1024d).ToString("0"), (e.TotalBytesToReceive / 1024d / 1024d).ToString("0"));

        }




        public static async Task ExtractNatives(string url)
        {
            string dir = "";
            string natives = config.M_F_P + @"natives-win\";
            if (url.Contains("https://libraries.minecraft.net"))
            {
                dir = config.M_F_P + @"libraries\" + url.Replace("https://libraries.minecraft.net", "");
            }

            else if (url.Contains("http://resources.download.minecraft.net/"))
            {
                dir = config.M_F_P + @"libraries\" + url.Replace("http://resources.download.minecraft.net/", "");
            }

            else if (url.Contains("http://files.minecraftforge.net/maven/"))
            {
                dir = config.M_F_P + @"libraries\" + url.Replace("http://files.minecraftforge.net/maven/", "");
            }

            var temp = config.M_F_P + @"temp\";

            //CONTROLLA SE ESISTE LA CARTELLA DOVE METTERE I NATIVES, ALTRIMENTI LA CREA
            if (!Directory.Exists(@natives))
            {
                Directory.CreateDirectory(@natives);
            }
            if (File.Exists(@dir))
            {
                using (ZipFile zip = ZipFile.Read(@dir))
                {
                    //ESTRAE LA LISTA JSON DI ROBA DA SCARICARE E IL FILE JAR PRINCIPALE DI FORGE
                    try
                    {
                        zip.ExtractAll(@natives);
                    }
                    catch (Exception e)
                    {
                        MessageBox.Show(e.ToString());
                    }

                }
            }
        }

        public static async Task ExtractForgeFiles(string url, IProgress<int> progress = null)
        {
            if (url.Contains("http://files.minecraftforge.net/maven/"))
            {
                string dir = config.M_F_P + @"libraries\" + url.Replace("http://files.minecraftforge.net/maven/", "");
                //localpath = localpath.Replace("/","\\");
                string FileName = System.IO.Path.GetFileName(dir);
                dir = System.IO.Path.GetDirectoryName(@dir);
                //MessageBox.Show(@dir);
                if (!Directory.Exists(@dir))
                {
                    Directory.CreateDirectory(@dir);
                }
                /*//DECOMPRIME XZ
                ProcessStartInfo startInfo = new ProcessStartInfo();
                string filename = Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "xz.exe");
                startInfo.FileName = filename;
                startInfo.UseShellExecute = false;
                startInfo.RedirectStandardOutput = false;
                startInfo.Arguments = "-d \"" + @dir + "\\" + FileName + "\" \"" + @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack") + "\"";
                startInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
                startInfo.CreateNoWindow = true;
                Process processo = Process.Start(startInfo);
                processo.WaitForExit();*/


                if (!File.Exists(@dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar")))
                {
                    SevenZipBase.SetLibraryPath(System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location) + @"\" + @"7z86.dll");
                    if (!File.Exists(@dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack")))
                    {
                        SevenZipExtractor se = new SevenZipExtractor(@dir + "\\" + FileName);  //FILE XZ
                        await Task.Factory.StartNew(() => se.BeginExtractArchive(@dir + "\\")).ContinueWith((ante) => Thread.Sleep(400));
                        File.Move(@dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack.tar"), @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack"));
                    }


                    //DECOMPRIME PACK200
                    if (File.Exists(@dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack")))
                    {
                        string filename1 = Classes.ComputerInfoDetect.GetJavaInstallationPath() + "\\bin\\unpack200.exe";
                        //string cParams1 = "\"" + @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack") + "\" \"" + @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar") + "\"";
                        //Setup the Process with the ProcessStartInfo class
                        ProcessStartInfo startInfo1 = new ProcessStartInfo();
                        startInfo1.FileName = filename1;
                        startInfo1.UseShellExecute = false;
                        startInfo1.RedirectStandardOutput = false;
                        startInfo1.Arguments = "\"" + @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack") + "\" \"" + @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar") + "\"";
                        startInfo1.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
                        startInfo1.CreateNoWindow = true;

                        //Start the process
                        Process processo1 = Process.Start(startInfo1);
                        processo1.WaitForExit();
                        //Process proc1 = Process.Start(filename1, cParams1);
                    }
                    else
                    {
                    }
                }

                //await Logger.sendToConsole("Extracting " + @dir + "\\" + FileName);

            }
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await librariesdownload();
        }

        private void getbacktomodpack_Click(object sender, RoutedEventArgs e)
        {
            Window1.singleton.MainPage.Navigate(new Pages.Modpacks());
        }
    }
}
