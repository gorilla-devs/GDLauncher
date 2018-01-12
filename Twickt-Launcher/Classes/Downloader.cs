/*Questa classe scarica tutti i files che le vengono dati, serve in pratica per scaricare i pacchetti*/
using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
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
        public static Stopwatch sw = new Stopwatch();
        public float totalMB = 0;
        public List<string[]> urlsList = new List<string[]>();
        public async Task MCDownload(List<string[]> urls, string instanceName, CancellationToken _ctsblock)
        {
            _cts = new CancellationTokenSource();
            sw.Start();
            int count = urls.Count;
            urlsList = urls;
            Dialogs.InstallModpack.singleton.filesToDownload.Content = "0" + "/" + urls.Count;
            if (urls != null && urls.Count != 0)
            {
                System.Timers.Timer myTimer = new System.Timers.Timer();
                myTimer.Elapsed += (s, e) =>
                {
                    Application.Current.Dispatcher.Invoke(new Action(() =>
                    {
                        Dialogs.InstallModpack.singleton.downloadedMB.Content = string.Format("{0} MB", ((totalMB / 1024f) / 1024f).ToString("0.00"));

                    }));
                };
                myTimer.Interval = 100; // 1000 ms is one second
                myTimer.Start();
                System.Net.ServicePointManager.DefaultConnectionLimit = Int32.Parse(Properties.Settings.Default["download_threads"].ToString());
                var block = new System.Threading.Tasks.Dataflow.ActionBlock<string[]>(async url =>
                {
                    try
                    {
                        await DownloadLibraries(url, instanceName);
                    }
                    catch (WebException) { }
                    catch (OperationCanceledException) { }
                    catch (Exception e)
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Dialogs.InstallModpack.singleton.isError.Visibility = Visibility.Visible;
                        }));
                        Console.WriteLine("ERRORE IN" + url[3] + "\r\n" + e);

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
                catch (TaskCanceledException)
                {
                    return;
                }

                sw.Stop();
                Dialogs.InstallModpack.singleton.filesToDownload.Content = urls.Count + "/" + urls.Count;
                Dialogs.InstallModpack.singleton.totalPercentage.Content = "100%";
                Dialogs.InstallModpack.singleton.progressBarDownload.Value = 100;


            }
        }

        public async Task DownloadLibraries(string[] url, string instanceName, IProgress<int> progress = null)
        {
            var token = _cts.Token;

            var temp = config.M_F_P + "Packs\\" + instanceName + "\\" + @"temp\";
            if (!Directory.Exists(@temp))
            {
                Directory.CreateDirectory(@temp);
            }
            //sw.Start();
            //webClient.DownloadProgressChanged += new DownloadProgressChangedEventHandler((sender, e) => client_DownloadProgressChanged(sender, e));



            /*using (HttpClient client = new HttpClient())
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
                catch (TaskCanceledException)
                {
                    return;
                }
            }*/

            if (!Directory.Exists(Path.GetDirectoryName(config.M_F_P + url[2])))
            {
                await Task.Run(() => Directory.CreateDirectory(Path.GetDirectoryName(config.M_F_P + url[2])));
            }
            await Task.Run(async () =>
            {
                token.ThrowIfCancellationRequested();
                using (WebClient client = new WebClient())
                {
                    float prevDownloaded = 0;
                    client.DownloadProgressChanged += (s, e) =>
                    {
                        totalMB -= prevDownloaded;
                        prevDownloaded = e.BytesReceived;
                        totalMB += (e.BytesReceived);
                    };
                    client.DownloadFileCompleted += (s, e) =>
                    {

                    };
                    token.Register(() => client.CancelAsync());
                    await client.DownloadFileTaskAsync(url[3], config.M_F_P + url[2]);
                }
            }, token);

            //actual++;
            if (url[3].Contains("platform"))
            {
                await ExtractNatives(url[2], instanceName);
            }
            Application.Current.Dispatcher.Invoke(new Action(() =>
            {
                string urlnum = Dialogs.InstallModpack.singleton.filesToDownload.Content.ToString().Split('/')[0];

                Dialogs.InstallModpack.singleton.filesToDownload.Content = (int.Parse(urlnum) + 1).ToString() + "/" + urlsList.Count.ToString();

                Dialogs.InstallModpack.singleton.progressBarDownload.Value = (int.Parse(urlnum) * 100) / urlsList.Count;
                Dialogs.InstallModpack.singleton.totalPercentage.Content = (int.Parse(urlnum) * 100) / urlsList.Count + "%";
            }));
        }

        public async Task ExtractNatives(string file, string instanceName)
        {
            var token = _cts.Token;
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
                    await Task.Run(() => {
                        token.ThrowIfCancellationRequested();
                        zip.ExtractAll(@natives, ExtractExistingFileAction.OverwriteSilently);
                    }, token);
                }
            }
        }
    }
}
