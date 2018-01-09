/*Questa classe scarica tutti i files che le vengono dati, serve in pratica per scaricare i pacchetti*/
using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using System.Windows;

namespace Twickt_Launcher.Classes
{
    class Downloader
    {
        public CancellationTokenSource _cts;
        public List<string[]> urlsList = new List<string[]>();
        public async Task MCDownload(List<string[]> urls, string instanceName, CancellationToken _ctsblock)
        {
            _cts = new CancellationTokenSource();
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
                        Dialogs.InstallModpack.singleton.isError.Visibility = Visibility.Visible;
                    }
                }, new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = Int32.Parse(Properties.Settings.Default["download_threads"].ToString()), CancellationToken = _ctsblock });

                foreach (var url in urls)
                {
                        block.Post(url);
                }
                block.Complete();
                try
                {
                    await block.Completion;
                }
                catch(TaskCanceledException)
                {
                    return;
                }
                Dialogs.InstallModpack.singleton.filesToDownload.Content = urls.Count + "/" + urls.Count;
                Dialogs.InstallModpack.singleton.totalPercentage.Content = "100%";
                Dialogs.InstallModpack.singleton.progressBarDownload.Value = 100;


            }
        }

        public async Task DownloadLibraries(string[] url, string instanceName, IProgress<int> progress = null)
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
                {
                    try
                    {
                        using (HttpResponseMessage response = await client.GetAsync(url[3], _cts.Token))
                        {
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
                        }
                    }
                    catch(TaskCanceledException)
                    {
                        return;
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
                Application.Current.Dispatcher.Invoke(new Action(() =>
                {
                    Dialogs.InstallModpack.singleton.isError.Visibility = Visibility.Visible;
                }));
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
