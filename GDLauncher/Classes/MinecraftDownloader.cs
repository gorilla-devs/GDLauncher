/*Questa classe scarica tutti i files che le vengono dati, serve in pratica per scaricare i pacchetti*/
using Microsoft.WindowsAPICodePack.Taskbar;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Net;
//using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace GDLauncher.Classes
{
    class MinecraftDownloader : INotifyPropertyChanged
    {
        public CancellationTokenSource _cts;

        private string files { get; set; }
        private string mb { get; set; }
        private string percentage { get; set; }

        public static Stopwatch sw = new Stopwatch();
        public float totalMB;
        public List<StructJson> urlsList = new List<StructJson>();




    //GETTERS AND SETTERS
    public String Files
        {
            get => files;
            set
            {
                files = value;
                OnPropertyChanged("Files");
            }
        }
        public String Mb
        {
            get => mb;
            set
            {
                mb = value;
                OnPropertyChanged("Mb");
            }
        }
        public String Percentage
        {
            get => percentage;
            set
            {
                percentage = value;
                OnPropertyChanged("Percentage");
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        private void OnPropertyChanged(string info)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(info));
        }

        public MinecraftDownloader()
        {
            Files = "";
            Mb = "Calculating...";
            Percentage = "";
        }

        public async Task MCDownload(string instanceName, string MCVersion, string forgeVersion, CancellationToken _ctsblock, string modpackName, string modpackVersion, List<string> additionalMods)
        {

            var urls = new List<StructJson>();
            var json = new JSON();
            json.updateStatus += (s) => { Percentage = s; };
            urls = await json.GetFiles(modpackName, instanceName, MCVersion, forgeVersion, modpackVersion, additionalMods);
            TaskbarManager.Instance.SetProgressState(TaskbarProgressBarState.Normal);

            totalMB = 0;
            _cts = new CancellationTokenSource();
            sw.Start();
            int count = urls.Count;
            urlsList = urls;
            Files = "0" + "/" + urls.Count;
            if (urls != null && urls.Count != 0)
            {
                System.Timers.Timer myTimer = new System.Timers.Timer();
                myTimer.Elapsed += (s, e) =>
                {
                     Mb = string.Format("{0} MB", ((totalMB / 1024f) / 1024f).ToString("0.00"));
                };
                myTimer.Interval = 100; // 1000 ms is one second
                myTimer.Start();
                System.Net.ServicePointManager.DefaultConnectionLimit = Int32.Parse(Properties.Settings.Default["download_threads"].ToString());
                var block = new System.Threading.Tasks.Dataflow.ActionBlock<StructJson>(async url =>
                {
                    try
                    {
                        await DownloadLibraries(url, instanceName);
                    }
                    catch (Exception e)
                    {
                        /*Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            Dialogs.InstallModpack.singleton.isError.Visibility = Visibility.Visible;
                        }));*/
                        Console.WriteLine("ERRORE IN" + url.URL + "\r\n" + e);

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

                myTimer.Stop();
                Files = urls.Count + "/" + urls.Count;
                Percentage = "100%";

                TaskbarManager.Instance.SetProgressState(TaskbarProgressBarState.NoProgress);

            }
        }

        public async Task DownloadLibraries(StructJson url, string instanceName, IProgress<int> progress = null)
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

            if (!Directory.Exists(Path.GetDirectoryName(config.M_F_P + url.path)))
            {
                await Task.Run(() => Directory.CreateDirectory(Path.GetDirectoryName(config.M_F_P + "Packs\\" + instanceName + "\\" + url.path)));
            }
            await Task.Run(async () =>
            {
                token.ThrowIfCancellationRequested();
                using (var client = new WebClient())
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
                    await client.DownloadFileTaskAsync(url.URL, config.M_F_P + "Packs\\" + instanceName + "\\" + url.path);
                }
            }, token);

            //actual++;
            if (url.URL.Contains("platform"))
            {
                await ExtractNatives(url.path, instanceName);
            }
            string urlnum = Files.Split('/')[0];

            Files = (int.Parse(urlnum) + 1).ToString() + "/" + urlsList.Count.ToString();

            TaskbarManager.Instance.SetProgressValue((int.Parse(urlnum) * 100) / urlsList.Count, 100);

            Percentage = (int.Parse(urlnum) * 100) / urlsList.Count + "%";
        }

        public async Task ExtractNatives(string file, string instanceName)
        {
            var token = _cts.Token;
            string dir = config.M_F_P + "Packs\\" + instanceName + "\\" + file;
            string natives = config.M_F_P + "Packs\\" + instanceName + "\\" + @"natives-win\";

            var temp = config.M_F_P + "Packs\\" + instanceName + "\\" + @"temp\";

            //CONTROLLA SE ESISTE LA CARTELLA DOVE METTERE I NATIVES, ALTRIMENTI LA CREA
            if (!Directory.Exists(@natives))
            {
                Directory.CreateDirectory(@natives);
            }
            if (File.Exists(@dir))
            {
                Classes.ZipSharp.ExtractZipFile(dir, null, @natives);
            }
        }

        
    }
}
