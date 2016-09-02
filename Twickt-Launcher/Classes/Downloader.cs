using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Twickt_Launcher.Classes
{
    class Downloader
    {
        /*public async Task librariesdownload()
        {
            if (remote == true)
                downloadingVersion = await RemoteModpacks.GetMinecraftUrlsAndData(modpackname);
            else
                downloadingVersion = await LocalModpacks.GetMinecraftUrlsAndData(modpackname);

            mainjar = config.M_F_P + @"versions\" + downloadingVersion[0] + "\\" + downloadingVersion[0] + ".jar";
            workingThreads.Content = Properties.Settings.Default["download_threads"].ToString();
            modpackName.Content = modpackname;
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
                    catch (Exception e)
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
            Classes.MinecraftStarter.Minecraft_Start(modpackname, (remote == true) ? true : false);
            JSON.urls.Clear();
        }
        public async Task DownloadLibraries(string url, IProgress<int> progress = null)
        {
            try
            {
                int count = urls.Count;
                var temp = config.M_F_P + downloadingVersion[1] + "\\" + @"temp\";
                if (!Directory.Exists(@temp))
                {
                    Directory.CreateDirectory(@temp);
                }

                sw.Start();
                webClient.DownloadProgressChanged += new DownloadProgressChangedEventHandler((sender, e) => client_DownloadProgressChanged(sender, e));
                if (url.Contains("https://libraries.minecraft.net"))
                {
                    string dir = config.M_F_P + downloadingVersion[1] + "\\" + @"libraries\" + url.Replace("https://libraries.minecraft.net", "");
                    //localpath = localpath.Replace("/","\\");
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
                            content.Dispose();
                            client.Dispose();
                            fileStream.Flush();
                            fileStream.Close();
                        }
                    }
                }
                else if (url.Contains("https://launcher.mojang.com/mc/game/"))
                {
                    string dir = config.M_F_P + downloadingVersion[1] + "\\" + @"versions\" + downloadingVersion[0] + "\\";
                    string FileName = "" + downloadingVersion[0] + ".jar";

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
                            content.Dispose();
                            client.Dispose();
                            fileStream.Flush();
                            fileStream.Close();
                        }
                    }
                }
                else if (url.Contains("http://resources.download.minecraft.net/"))
                {
                    string dir = config.M_F_P + downloadingVersion[1] + "\\" + @"assets\objects\" + url.Replace("http://resources.download.minecraft.net/", "");
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
                            content.Dispose();
                            client.Dispose();
                            fileStream.Flush();
                            fileStream.Close();
                        }
                    }
                }
                else if (url.Contains("http://search.maven.org/remotecontent?filepath="))
                {
                    string dir = config.M_F_P + downloadingVersion[1] + "\\" + @"libraries\" + url.Replace("http://search.maven.org/remotecontent?filepath=", "");
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
                            content.Dispose();
                            client.Dispose();
                            fileStream.Flush();
                            fileStream.Close();
                        }
                    }
                }
                else if (url.Contains(config.updateWebsite))
                {
                    string dir = config.M_F_P + downloadingVersion[1] + "\\" + @"instances\" + url.Replace(config.updateWebsite, "");
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
                            content.Dispose();
                            client.Dispose();
                            fileStream.Flush();
                            fileStream.Close();
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
            string natives = config.M_F_P + downloadingVersion[1] + "\\" + @"natives-win\";
            if (url.Contains("https://libraries.minecraft.net"))
            {
                dir = config.M_F_P + downloadingVersion[1] + "\\" + @"libraries\" + url.Replace("https://libraries.minecraft.net", "");
            }

            else if (url.Contains("http://resources.download.minecraft.net/"))
            {
                dir = config.M_F_P + downloadingVersion[1] + "\\" + @"libraries\" + url.Replace("http://resources.download.minecraft.net/", "");
            }

            else if (url.Contains("http://search.maven.org/remotecontent?filepath="))
            {
                dir = config.M_F_P + downloadingVersion[1] + "\\" + @"libraries\" + url.Replace("http://files.minecraftforge.net/maven/", "");
            }

            var temp = config.M_F_P + downloadingVersion[1] + "\\" + @"temp\";

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
                        zip.ExtractAll(@natives, ExtractExistingFileAction.OverwriteSilently);
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
                string dir = config.M_F_P + downloadingVersion[1] + @"\libraries\" + url.Replace("http://files.minecraftforge.net/maven/", "");
                //localpath = localpath.Replace("/","\\");
                string FileName = System.IO.Path.GetFileName(dir);
                dir = System.IO.Path.GetDirectoryName(@dir);
                //MessageBox.Show(@dir);
                if (!Directory.Exists(@dir))
                {
                    Directory.CreateDirectory(@dir);
                }

                if (!File.Exists(@dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar")))
                {
                    SevenZipBase.SetLibraryPath(System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location) + @"\" + @"7z86.dll");
                    if (!File.Exists(@dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack")))
                    {
                        try
                        {
                            SevenZipExtractor se = new SevenZipExtractor(@dir + "\\" + FileName);  //FILE XZ
                            await Task.Factory.StartNew(() => se.BeginExtractArchive(@dir + "\\")).ContinueWith((ante) => Thread.Sleep(400));
                            File.Move(@dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack.tar"), @dir + "\\" + FileName.Replace(".jar.pack.xz", ".jar.pack"));
                        }
                        catch (Exception ex)
                        {
                            MessageBox.Show(ex.InnerException.ToString());
                        }
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
        }*/

    }
}
