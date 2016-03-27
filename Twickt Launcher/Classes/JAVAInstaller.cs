using Ionic.Zip;
using SevenZip;
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

namespace Twickt_Launcher.Classes
{
    class JAVAInstaller
    {
        public static WebClient webClient = new WebClient();
        public static Stopwatch sw = new Stopwatch();
        public static string javaversion = "";
        public static async Task<bool> isJavaInstalled()
        {
            if (!Directory.Exists(config.M_F_P + "runtime"))
                return false;
            else
            {
                if(File.Exists(config.M_F_P + "runtime\\java.7z"))
                {
                    File.Delete(config.M_F_P + "runtime\\java.7z");
                }
                return true;
            }
        }

        public static async Task DownloadJava()
        {
            if (!Directory.Exists(config.M_F_P + "runtime\\jre"))
                Directory.CreateDirectory(config.M_F_P + "runtime\\jre");
            Pages.SplashScreen.singleton.firstLabel.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.secondLabel.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.progressbar.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.mainContent.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.mbToDownload.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.kbps.Visibility = Visibility.Visible;
            Pages.SplashScreen.singleton.load.Visibility = Visibility.Hidden;
            Pages.SplashScreen.singleton.mainContent.Content = "Please wait...";
            Pages.SplashScreen.singleton.firstLabel.Content = "Downloading JAVA";
            Pages.SplashScreen.singleton.secondLabel.Content = "";
            string url = "";
            //i .exe sono zip in verita'
            if (Classes.ComputerInfoDetect.GetComputerArchitecture() == 64)
            {
                url = config.updateWebsite + "java/jPortable64_8_Update_73.paf.7z";
            }
            else
            {
                url = config.updateWebsite + "java/jPortable_8_Update_73.paf.7z";
            }
            Uri uri = new Uri(url);

            webClient.DownloadFileCompleted += new AsyncCompletedEventHandler(Completed);
            webClient.DownloadProgressChanged += new DownloadProgressChangedEventHandler(ProgressChanged);
            sw.Start();
            await webClient.DownloadFileTaskAsync(new Uri(url), config.M_F_P + "runtime\\java.7z");
            try
            {
                SevenZipBase.SetLibraryPath(System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location) + @"\" + @"7z86.dll");
                SevenZipExtractor se = new SevenZipExtractor(config.M_F_P + "runtime\\java.7z");
                await Task.Factory.StartNew(() => se.BeginExtractArchive(config.M_F_P + "runtime\\jre\\")).ContinueWith((ante) => Thread.Sleep(200)); ;
            }
            catch(TargetInvocationException e)
            {
                MessageBox.Show(e.ToString());
            }
            if (Classes.ComputerInfoDetect.GetComputerArchitecture() == 64)
            {
                Properties.Settings.Default["JavaPath"] = config.M_F_P + "runtime\\jre\\jPortable64_8_Update_73.paf\\";
                Properties.Settings.Default.Save();
            }
            else
            {
                Properties.Settings.Default["JavaPath"] = config.M_F_P + "runtime\\jre\\jPortable_8_Update_73.paf\\";
                Properties.Settings.Default.Save();
            }
        }

        public static void ProgressChanged(object sender, DownloadProgressChangedEventArgs e)
        {
            Pages.SplashScreen.singleton.progressbar.Value = e.ProgressPercentage;
            Pages.SplashScreen.singleton.kbps.Content = string.Format("{0} kb/s", (e.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
            Pages.SplashScreen.singleton.mbToDownload.Content = string.Format("{0} MB / {1} MB",
            (e.BytesReceived / 1024d / 1024d).ToString("0"),
            (e.TotalBytesToReceive / 1024d / 1024d).ToString("0"));

        }

        private static async void Completed(object sender, AsyncCompletedEventArgs e)
        {
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
