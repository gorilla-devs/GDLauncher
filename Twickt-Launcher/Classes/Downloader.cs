using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using System.Windows;

namespace Twickt_Launcher.Classes
{
    class Downloader
    {
        public static List<string[]> urlsList = new List<string[]>();
        public static async Task MCDownload(List<string[]> urls, string instanceName)
        {
            int count = urls.Count;
            urlsList = urls;
            Dialogs.InstallModpack.singleton.filesToDownload.Content = "0" + "/" + urls.Count;
            if (urls != null && urls.Count != 0)
            {
                System.Net.ServicePointManager.DefaultConnectionLimit = Int32.Parse(Properties.Settings.Default["download_threads"].ToString());
                var block = new System.Threading.Tasks.Dataflow.ActionBlock<string[]>(async url =>
                {
                    try
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            
                        }));
                        await DownloadLibraries(url, instanceName);
                        //await ExtractForgeFiles(url);
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
                Dialogs.InstallModpack.singleton.filesToDownload.Content = urls.Count + "/" + urls.Count;
                Dialogs.InstallModpack.singleton.totalPercentage.Content = "100%";
                Dialogs.InstallModpack.singleton.progressBarDownload.Value = 100;


            }
        }

        public static async Task DownloadLibraries(string[] url, string instanceName, IProgress<int> progress = null)
        {
            try
            {
                var temp = config.M_F_P + "Packs\\" + instanceName + "\\" + @"temp\";
                if (!Directory.Exists(@temp))
                {
                    Directory.CreateDirectory(@temp);
                }
                //sw.Start();
                //webClient.DownloadProgressChanged += new DownloadProgressChangedEventHandler((sender, e) => client_DownloadProgressChanged(sender, e));
                using (HttpClient client = new HttpClient())
                using (HttpResponseMessage response = await client.GetAsync(url[3]))
                using (HttpContent content = response.Content)
                {
                    if (!Directory.Exists(Path.GetDirectoryName(config.M_F_P + url[2])))
                    {
                        Directory.CreateDirectory(Path.GetDirectoryName(config.M_F_P + url[2]));
                    }
                    using (var fileStream = new FileStream(config.M_F_P + url[2], FileMode.Create, FileAccess.Write))
                    {
                        await content.CopyToAsync(fileStream);
                    }
                }
                if (url[3].Contains("platform"))
                {
                    await ExtractNatives(url[2], instanceName);
                }
                Application.Current.Dispatcher.Invoke(new Action(() =>
                {
                    string urlnum = Dialogs.InstallModpack.singleton.filesToDownload.Content.ToString().Split('/')[0];
                    if (Array.IndexOf(urlsList.ToArray(), url) > Int32.Parse(urlnum))
                        Dialogs.InstallModpack.singleton.filesToDownload.Content = Array.IndexOf(urlsList.ToArray(), url) + "/" + urlsList.Count.ToString();

                    if (((Array.IndexOf(urlsList.ToArray(), url) * 100) / urlsList.Count) > Dialogs.InstallModpack.singleton.progressBarDownload.Value)
                    {
                        Dialogs.InstallModpack.singleton.progressBarDownload.Value = (Array.IndexOf(urlsList.ToArray(), url) * 100) / urlsList.Count;
                        Dialogs.InstallModpack.singleton.totalPercentage.Content = (Array.IndexOf(urlsList.ToArray(), url) * 100) / urlsList.Count + "%";
                    }
                }));
                //actual++;
            }
            catch(Exception e)
            {
                MessageBox.Show("ERRORE A SCARICARE " + url[3] + " " + e);
            }

        }

        public static async Task ExtractNatives(string file, string instanceName)
        {
            string dir = config.M_F_P + file;
            string natives = config.M_F_P + "Packs\\" + instanceName + "\\" + @"natives-win\";

            var temp = config.M_F_P + "Packs\\" + instanceName + "\\" + @"temp\";

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
    }
}
