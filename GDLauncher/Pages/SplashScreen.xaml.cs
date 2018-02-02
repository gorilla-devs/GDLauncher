// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Splashscreen*/
using Newtonsoft.Json;
using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Net;
using System.Reflection;
using System.Resources;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using GDLauncher.Classes;

namespace GDLauncher.Pages
{
    /// <summary>
    /// Logica di interazione per SplashScreen.xaml
    /// </summary>
    public partial class SplashScreen : Page
    {
        private CancellationTokenSource _cancellationTokenSource;
        public static Stopwatch sw = new Stopwatch();
        public string forgeJson = null;
        public static SplashScreen singleton;
        public ResourceManager manager = Properties.Resources.ResourceManager;

        public SplashScreen()
        {
            InitializeComponent();
            firstlabelprogress.Visibility = Visibility.Visible;
            //Window1.singleton.MenuToggleButton.IsEnabled = false;
            singleton = this;
            
            CultureInfo culture;
           /* if (Thread.CurrentThread.CurrentCulture.Name == "it-IT")
                culture = CultureInfo.CreateSpecificCulture("en-US");
            else*/
            culture = CultureInfo.CreateSpecificCulture("en");

            CultureInfo.DefaultThreadCurrentCulture = culture;
            CultureInfo.DefaultThreadCurrentUICulture = culture;

            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;

            Assembly resourceAssembly = Assembly.Load("GDLauncher");
            string manifest = "GDLauncher.lang.lang";
            manager = new ResourceManager(manifest, resourceAssembly);

            /*string greeting = String.Format("The current culture is {0}.\n{1}",
                                                     Thread.CurrentThread.CurrentUICulture.Name,
                                                     SplashScreen.singleton.manager.GetString("HelloString"));*/
            
           // MessageBox.Show(greeting);
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            Windows.DebugOutputConsole console = new Windows.DebugOutputConsole();
            firstLabel.Text = "Initializing checkups...";
            firstlabelprogress.Visibility = Visibility.Hidden;
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("https://google.com");
                request.Method = "HEAD";
                await request.GetResponseAsync();
                Window1.singleton.internetDisabled.Visibility = Visibility.Hidden;
            }
            catch (Exception)
            {
                Application.Current.Dispatcher.Invoke(new Action(async () =>
                {
                    Window1.singleton.internetDisabled.Visibility = Visibility.Visible;

                    firstLabel.Text = "No internet detected. We will skip every startup check. If this is the first time you start the launcher, it will not work, otherwise happy gaming!";
                    await Task.Delay(5000);
                    transition.SelectedIndex = 1;
                    await Task.Delay(450);
                    Window1.singleton.settings.IsEnabled = true;
                    Window1.singleton.logout.IsEnabled = true;
                    if (Properties.Settings.Default["RememberUsername"].ToString() != "//--//")
                    {
                        SessionData.username = Properties.Settings.Default["RememberUsername"].ToString();
                        Window1.singleton.MainPage.Navigate(new Home());
                    }
                    else if (Properties.Settings.Default.premiumUsername != "//--//")
                    {
                        SessionData.username = Properties.Settings.Default.premiumUsername;
                        SessionData.accessToken = Properties.Settings.Default.premiumaAccessToken;
                        SessionData.uuidPremium = Properties.Settings.Default.premiumUUID;
                        SessionData.isLegacy = Properties.Settings.Default.isLegacy;

                        Window1.singleton.MainPage.Navigate(new Home());
                    }
                    else
                    {
                        Window1.singleton.MainPage.Navigate(new Login());
                    }
                }));
                return;
            }

            if (!Directory.Exists(config.M_F_P + "Servers\\"))
            {
                Directory.CreateDirectory(config.M_F_P + "Servers\\");
            }
            if (Properties.Settings.Default.eula == false)
            {
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Eula(), "RootDialog");
            }

            firstLabel.Text = "Checking for updates...";
            if (Window1.singleton.started == false)
            {
                Window1.singleton.started = true;


                string update = await AutoUpdater.CheckVersion();
                await AutoUpdater.Download(update);


                firstLabel.Text = "Checking java...";
                //SETTING UP JAVA
                if (await JAVAInstaller.isJavaInstalled() == false)
                {
                    try
                    {
                        waiting.Visibility = Visibility.Hidden;
                        await JAVAInstaller.DownloadJava();
                    }
                    catch (Exception ez)
                    {
                        MessageBox.Show("Error setting up java. If this error keeps showing up, consider contacting GorillaDevs on our website: https://gorilladevs.com " + ez.Message);
                    }
                }

                firstLabel.Text = "Checking required data (1/2)";
                try
                {
                    firstLabel.Text = "Downloading Additional Data (1/2)";
                    //CHECKING FORGE JSON
                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://files.minecraftforge.net/maven/net/minecraftforge/forge/json");
                    request.Method = "HEAD";
                    HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync();
                    string disposition = response.Headers["Content-Length"];
                    sw.Start();
                    var client = new WebClient();
                    client.DownloadProgressChanged += (s, ee) =>
                    {
                        progressbar.Value = ee.ProgressPercentage;
                        kbps.Content = string.Format("{0} kb/s", (ee.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                        mbToDownload.Content = string.Format("{0} MB / {1} MB",
                        (ee.BytesReceived / 1024d / 1024d).ToString("0"),
                        (ee.TotalBytesToReceive / 1024d / 1024d).ToString("0"));
                    };
                    //VERIFICA SE IL JSON DELLE VERSIONI DI FORGE ESISTE ED E' AGGIORNATO
                    if (!File.Exists(config.M_F_P + "forgeVersions.json") || (Properties.Settings.Default.forgeJSONContentLength != disposition && Properties.Settings.Default.forgeJSONContentLength != ""))
                    {
                        waiting.Visibility = Visibility.Hidden;
                        progressbar.Visibility = Visibility.Visible;
                        firstLabel.Visibility = Visibility.Visible;
                        kbps.Visibility = Visibility.Visible;
                        mbToDownload.Visibility = Visibility.Visible;
                        await client.DownloadFileTaskAsync("http://files.minecraftforge.net/maven/net/minecraftforge/forge/json", config.M_F_P + "forgeVersions.json");
                        Properties.Settings.Default.forgeJSONContentLength = disposition;
                        Properties.Settings.Default.Save();
                    }
                    using (StreamReader r = new StreamReader(config.M_F_P + "forgeVersions.json"))
                    {
                        forgeJson = await r.ReadToEndAsync();
                    }
                    try
                    {
                        dynamic json = JsonConvert.DeserializeObject(singleton.forgeJson);
                    }
                    catch
                    {
                        waiting.Visibility = Visibility.Hidden;
                        progressbar.Visibility = Visibility.Visible;
                        firstLabel.Visibility = Visibility.Visible;
                        kbps.Visibility = Visibility.Visible;
                        mbToDownload.Visibility = Visibility.Visible;
                        await client.DownloadFileTaskAsync("http://files.minecraftforge.net/maven/net/minecraftforge/forge/json", config.M_F_P + "forgeVersions.json");
                        Properties.Settings.Default.forgeJSONContentLength = disposition;
                        Properties.Settings.Default.Save();
                    }

                }
                catch { }
                firstLabel.Text = "Checking required data (2/2)";
                firstLabel.Text = "Downloading Additional Data (2/2)";
                if (!Directory.Exists(config.M_F_P + "items"))
                {
                    waiting.Visibility = Visibility.Hidden;
                    Directory.CreateDirectory(config.M_F_P + "items");
                    var client1 = new WebClient();
                    progressbar.Visibility = Visibility.Visible;
                    firstLabel.Visibility = Visibility.Visible;
                    kbps.Visibility = Visibility.Visible;
                    mbToDownload.Visibility = Visibility.Visible;
                    client1.DownloadProgressChanged += (s, ee) =>
                    {
                        progressbar.Value = ee.ProgressPercentage;
                        kbps.Content = string.Format("{0} kb/s", (ee.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                        mbToDownload.Content = string.Format("{0} MB / {1} MB",
                        (ee.BytesReceived / 1024d / 1024d).ToString("0"),
                        (ee.TotalBytesToReceive / 1024d / 1024d).ToString("0"));
                    };
                    await client1.DownloadFileTaskAsync("http://minecraft-ids.grahamedgecombe.com/items.zip", config.M_F_P + "items.zip");
                    firstLabel.Text = "Extracting Additional Data (2/2)";
                    firstlabelprogress.Visibility = Visibility.Visible;
                    await Task.Factory.StartNew(() => Classes.ZipSharp.ExtractZipFile(config.M_F_P + "items.zip", null, config.M_F_P + "items")).ContinueWith((ante) => Thread.Sleep(300));
                    File.Delete(config.M_F_P + "items.zip");
                }
                await Task.Delay(300);
                transition.SelectedIndex = 1;
                await Task.Delay(450);
                if (Properties.Settings.Default.premiumaAccessToken != "//--//")
                {
                    Window1.singleton.offlineMode.Visibility = Visibility.Visible;
                    Window1.singleton.offlineMode.Foreground = (System.Windows.Media.SolidColorBrush)(new System.Windows.Media.BrushConverter().ConvertFrom("#00A843"));
                    Window1.singleton.offlineMode.ToolTip = "Playing in Online-Mode";
                    Window1.singleton.offlineMode.Kind = MaterialDesignThemes.Wpf.PackIconKind.GoogleController;

                    Window1.singleton.settings.IsEnabled = true;
                    Window1.singleton.logout.IsEnabled = true;

                    SessionData.username = Properties.Settings.Default.premiumUsername;
                    SessionData.accessToken = Properties.Settings.Default.premiumaAccessToken;
                    SessionData.uuidPremium = Properties.Settings.Default.premiumUUID;

                    Window1.singleton.MainPage.Navigate(new Home());
                }
                else if (Properties.Settings.Default["RememberUsername"].ToString() != "//--//")
                {
                    Window1.singleton.offlineMode.Visibility = Visibility.Visible;
                    Window1.singleton.offlineMode.Foreground = (System.Windows.Media.SolidColorBrush)(new System.Windows.Media.BrushConverter().ConvertFrom("#F2DB10"));
                    Window1.singleton.offlineMode.ToolTip = "Playing in Offline-Mode";
                    Window1.singleton.offlineMode.Kind = MaterialDesignThemes.Wpf.PackIconKind.GoogleControllerOff;

                    Window1.singleton.settings.IsEnabled = true;
                    Window1.singleton.logout.IsEnabled = true;

                    SessionData.username = Properties.Settings.Default["RememberUsername"].ToString();
                    Window1.singleton.MainPage.Navigate(new Home());
                }
                else
                {
                    Window1.singleton.MainPage.Navigate(new Login());
                }
            }
        }
    }
}
