// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Scarica e posiziona java nella cartella giusta*/
using ICSharpCode.SharpZipLib.GZip;
using ICSharpCode.SharpZipLib.Tar;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace GDLauncher.Classes
{
    class JAVAInstaller
    {
        public static WebClient webClient = new WebClient();
        public static Stopwatch sw = new Stopwatch();
        public static string javaversion = "";
        public static Int64 bytes_total;
        public static long AverageSpeed;
        public static async Task<bool> isJavaInstalled()
        {
            if (File.Exists(config.javaLocal + "runtime\\java.zip"))
            {
                File.Delete(config.javaLocal + "runtime\\java.zip");
            }
            if (Properties.Settings.Default["JavaPath"].ToString() == "Empty")
            {
                if (Directory.Exists(config.javaLocal + "runtime\\jre\\" + config.jre64FileName) ||
                    Directory.Exists(config.javaLocal + "runtime\\jre\\" + config.jre32FileName))
                {
                    if (Classes.ComputerInfoDetect.GetComputerArchitecture() == 64)
                    {
                        Properties.Settings.Default["JavaPath"] = config.javaLocal + "runtime\\jre\\" + config.jre64FileName + "\\";
                        Properties.Settings.Default.Save();
                    }
                    else
                    {
                        Properties.Settings.Default["JavaPath"] = config.javaLocal + "runtime\\jre\\" + config.jre32FileName + "\\";
                        Properties.Settings.Default.Save();
                    }
                    return true;
                }
                else
                    return false;
            }
            else
            {
                if (Directory.Exists(Properties.Settings.Default["JavaPath"].ToString()))
                {
                    return true;
                }
                else{
                    return false;
                }
            }
        }

        public static async Task DownloadJava()
        {
            if (!Directory.Exists(config.javaLocal + "runtime\\jre"))
                Directory.CreateDirectory(config.javaLocal + "runtime\\jre");
            Pages.SplashScreen.singleton.firstLabel.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.progressbar.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.mbToDownload.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.kbps.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.firstLabel.Text = Pages.SplashScreen.singleton.manager.GetString("downloadingJava");
            string url = "";
            //i .exe sono zip in verita'
            if (Classes.ComputerInfoDetect.GetComputerArchitecture() == 64)
            {
                url = config.jre64URL;
            }
            else
            {
                url = config.jre32URL;
            }
            Uri uri = new Uri(url);

            webClient.DownloadFileCompleted += new AsyncCompletedEventHandler(Completed);
            webClient.DownloadProgressChanged += new DownloadProgressChangedEventHandler(ProgressChanged);
            webClient.Headers.Set("Cookie", "oraclelicense=accept-securebackup-cookie");
            sw.Start();
            try
            {
                await webClient.DownloadFileTaskAsync(new Uri(url), config.javaLocal + "runtime\\java.zip");
            }
            catch(Exception e)
            {
                MessageBox.Show("Errore nel download di JAVA. Minecraft potrebbe non avviarsi correttamente" + e.Message);
            }
            Pages.SplashScreen.singleton.firstlabelprogress.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.firstLabel.Text = Pages.SplashScreen.singleton.manager.GetString("extractingJava");
            try
            {
                using (Stream targetStream = new GZipInputStream(File.OpenRead(config.javaLocal + "runtime\\java.zip")))
                {
                    using (TarArchive tarArchive = TarArchive.CreateInputTarArchive(targetStream, TarBuffer.DefaultBlockFactor))
                    {
                        await Task.Factory.StartNew(() =>
                        {
                            tarArchive.ExtractContents(config.javaLocal + "runtime\\jre");
                        })
                        .ContinueWith((ante) => Thread.Sleep(200)); ;
                    }
                }
            }
            catch(TargetInvocationException e)
            {
                MessageBox.Show(e.ToString());
            }
            if (Classes.ComputerInfoDetect.GetComputerArchitecture() == 64)
            {
                Properties.Settings.Default["JavaPath"] = config.javaLocal + "runtime\\jre\\" + config.jre64FileName + "\\";
                Properties.Settings.Default.Save();
            }
            else
            {
                Properties.Settings.Default["JavaPath"] = config.javaLocal + "runtime\\jre\\" + config.jre32FileName + "\\";
                Properties.Settings.Default.Save();
            }
            Pages.SplashScreen.singleton.firstlabelprogress.Visibility = Visibility.Hidden;
            Pages.SplashScreen.singleton.firstLabel.Text = "Java Extraction Completed";
            Pages.SplashScreen.singleton.kbps.Visibility = Visibility.Hidden;
        }

        public static void ProgressChanged(object sender, DownloadProgressChangedEventArgs e)
        {
            try
            {
                Pages.SplashScreen.singleton.progressbar.Value = e.ProgressPercentage;
                Pages.SplashScreen.singleton.kbps.Content = string.Format("{0} kb/s", (e.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                Pages.SplashScreen.singleton.mbToDownload.Content = string.Format("{0} MB / {1} MB",
                (e.BytesReceived / 1024d / 1024d).ToString("0"),
                (e.TotalBytesToReceive / 1024d / 1024d).ToString("0"));
            }
            catch
            {
                MessageBox.Show("Unknown error calculating download speed. Could be DivideByZeroException");
            }

        }

        private static void Completed(object sender, AsyncCompletedEventArgs e)
        {
            try
            {
                AverageSpeed = bytes_total / sw.Elapsed.Seconds;
            }
            catch
            {
                MessageBox.Show("Unknown error calculating download speed. Could be DivideByZeroException");
            }
            SessionData.AverageDownloadSpeed = AverageSpeed;
            if (AverageSpeed < 1000)
                Properties.Settings.Default["download_threads"] = "8";
            else if (AverageSpeed >= 1000 && AverageSpeed <= 3000)
                Properties.Settings.Default["download_threads"] = "12";
            else if (AverageSpeed > 3000 && AverageSpeed < 5000)
                Properties.Settings.Default["download_threads"] = "16";
            else if (AverageSpeed > 5000 && AverageSpeed < 7000)
                Properties.Settings.Default["download_threads"] = "23";
            else if (AverageSpeed > 7000 && AverageSpeed < 10000)
                Properties.Settings.Default["download_threads"] = "26";
            else if (AverageSpeed > 10000)
                Properties.Settings.Default["download_threads"] = "30";

            Properties.Settings.Default.Save();
            sw.Reset();
            if (e.Cancelled == true)
            {
                webClient.Dispose();
                return;
            }
            else
            {

            }
        }

    }
}
