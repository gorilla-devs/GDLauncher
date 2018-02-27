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
using GDLauncher.Classes;
using GDLauncher.Pages;
using GDLauncher.Properties;
using Newtonsoft.Json;

namespace GDLauncher.Windows
{
    /// <summary>
    /// Interaction logic for Splashscreen.xaml
    /// </summary>
    public partial class Splashscreen
    {
        private CancellationTokenSource _cancellationTokenSource;
        public static Stopwatch sw = new Stopwatch();
        public string forgeJson = null;
        public static Splashscreen singleton;
        public ResourceManager manager = Properties.Resources.ResourceManager;

        public Splashscreen()
        {
            new Window1();
            Window1.singleton.Hide();
            InitializeComponent();

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
        }

        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            Windows.DebugOutputConsole console = new Windows.DebugOutputConsole();
            try
            {
                HttpWebRequest request = (HttpWebRequest) WebRequest.Create("https://google.com");
                request.Method = "HEAD";
                await request.GetResponseAsync();
                Window1.singleton.internetDisabled.Visibility = Visibility.Hidden;
            }
            catch (Exception)
            {
                Application.Current.Dispatcher.Invoke(new Action(async () =>
                {
                    Window1.singleton.internetDisabled.Visibility = Visibility.Visible;

                    actualActivity.Text = "No internet detected. Skipping startup checks (5)";
                    await Task.Delay(1000);
                    actualActivity.Text = "No internet detected. Skipping startup checks (4)";
                    await Task.Delay(1000);
                    actualActivity.Text = "No internet detected. Skipping startup checks (3)";
                    await Task.Delay(1000);
                    actualActivity.Text = "No internet detected. Skipping startup checks (2)";
                    await Task.Delay(1000);
                    actualActivity.Text = "No internet detected. Skipping startup checks (1)";
                    await Task.Delay(1000);


                    this.Hide();
                    Window1.singleton.Show();


                    await Task.Delay(450);
                    if (Settings.Default.premiumUsername != "")
                    {
                        Window1.singleton.offlineMode.Visibility = Visibility.Visible;
                        Window1.singleton.offlineMode.Foreground =
                            (System.Windows.Media.SolidColorBrush) (new System.Windows.Media.BrushConverter()
                                .ConvertFrom("#F2DB10"));
                        Window1.singleton.offlineMode.ToolTip = "Playing in Offline-Mode";
                        Window1.singleton.offlineMode.Kind = MaterialDesignThemes.Wpf.PackIconKind.GoogleControllerOff;

                        Window1.singleton.settings.IsEnabled = true;
                        Window1.singleton.logout.IsEnabled = true;

                        SessionData.username = Properties.Settings.Default.premiumUsername;
                        SessionData.accessToken = Properties.Settings.Default.premiumAccessToken;
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

            actualActivity.Text = "Checking for updates...";
            if (Window1.singleton.started == false)
            {
                Window1.singleton.started = true;


                string update = await AutoUpdater.CheckVersion();
                await AutoUpdater.Download(update);


                actualActivity.Text = "Checking java...";
                //SETTING UP JAVA
                if (await JAVAInstaller.isJavaInstalled() == false)
                {
                    try
                    {
                        await JAVAInstaller.DownloadJava();
                    }
                    catch (Exception ez)
                    {
                        MessageBox.Show(
                            "Error setting up java. If this error keeps showing up, consider contacting us on our website: https://gorilladevs.com " +
                            ez.Message);
                    }
                }

                string totalChecks = "3";
                await CheckForgeJson(totalChecks);
                await CheckItemsZip(totalChecks);
                await CheckCurseJson(totalChecks);

                Boolean isTokenValid = false;
                if (Settings.Default.premiumAccessToken != "")
                {
                    actualActivity.Text = "Checking for Premium Token Validity";

                    isTokenValid = await Classes.MojangAPIs.IsTokenValid(Settings.Default.premiumAccessToken);
                }

                await Task.Delay(300);




                this.Hide();
                Window1.singleton.Show();






                await Task.Delay(450);
                if (Settings.Default.premiumAccessToken != "")
                {
                    if (!isTokenValid)
                    {
                        Window1.singleton.MainPage.Navigate(new Login("Token expired. You need to log back in"));
                        return;
                    }

                    Window1.singleton.offlineMode.Visibility = Visibility.Visible;
                    Window1.singleton.offlineMode.Foreground =
                        (System.Windows.Media.SolidColorBrush) (new System.Windows.Media.BrushConverter().ConvertFrom(
                            "#00A843"));
                    Window1.singleton.offlineMode.ToolTip = "Playing in Online-Mode";
                    Window1.singleton.offlineMode.Kind = MaterialDesignThemes.Wpf.PackIconKind.GoogleController;

                    Window1.singleton.settings.IsEnabled = true;
                    Window1.singleton.logout.IsEnabled = true;


                    SessionData.username = Settings.Default.premiumUsername;
                    SessionData.accessToken = Settings.Default.premiumAccessToken;
                    SessionData.uuidPremium = Settings.Default.premiumUUID;

                    Window1.singleton.MainPage.Navigate(new Home());
                }
                else
                {
                    Window1.singleton.MainPage.Navigate(new Login());
                }
            }

            async Task CheckForgeJson(string totalChecks)
            {
                actualActivity.Text = "Checking required data (1/" + totalChecks + ")";
                try
                {
                    //CHECKING FORGE JSON
                    HttpWebRequest request =
                        (HttpWebRequest) WebRequest.Create(
                            "http://files.minecraftforge.net/maven/net/minecraftforge/forge/json");
                    request.Method = "HEAD";
                    HttpWebResponse response = (HttpWebResponse) await request.GetResponseAsync();
                    string disposition = response.Headers["Content-Length"];
                    sw.Start();
                    var client = new WebClient();
                    client.DownloadProgressChanged += (s, ee) =>
                    {
                        percentage.Text = ee.ProgressPercentage.ToString() + "%";
                        /*kbps.Content = string.Format("{0} kb/s",
                            (ee.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                        mbToDownload.Content = string.Format("{0} MB / {1} MB",
                            (ee.BytesReceived / 1024d / 1024d).ToString("0"),
                            (ee.TotalBytesToReceive / 1024d / 1024d).ToString("0"));*/
                    };
                    //VERIFICA SE IL JSON DELLE VERSIONI DI FORGE ESISTE ED E' AGGIORNATO
                    if (!File.Exists(config.M_F_P + "forgeVersions.json") ||
                        (Properties.Settings.Default.forgeJSONContentLength != disposition &&
                         Properties.Settings.Default.forgeJSONContentLength != ""))
                    {
                        actualActivity.Text = "Downloading Additional Data (1/" + totalChecks + ")";
                        await client.DownloadFileTaskAsync(
                            "http://files.minecraftforge.net/maven/net/minecraftforge/forge/json",
                            config.M_F_P + "forgeVersions.json");
                        percentage.Text = "";
                        Properties.Settings.Default.forgeJSONContentLength = disposition;
                        Properties.Settings.Default.Save();
                    }

                    using (StreamReader r = new StreamReader(config.M_F_P + "forgeVersions.json"))
                    {
                        forgeJson = await r.ReadToEndAsync();
                    }

                    try
                    {
                        JsonConvert.DeserializeObject(singleton.forgeJson);
                    }
                    catch
                    {
                        actualActivity.Text = "Downloading Additional Data (1/" + totalChecks + ")";
                        await client.DownloadFileTaskAsync(
                            "http://files.minecraftforge.net/maven/net/minecraftforge/forge/json",
                            config.M_F_P + "forgeVersions.json");
                        percentage.Text = "";
                        Settings.Default.forgeJSONContentLength = disposition;
                        Settings.Default.Save();
                    }
                }
                catch
                {
                }
            }

            async Task CheckItemsZip(string totalChecks)
            {
                actualActivity.Text = "Checking required data (2/" + totalChecks + ")";
                if (!Directory.Exists(config.M_F_P + "items"))
                {
                    actualActivity.Text = "Downloading Additional Data (2/" + totalChecks + ")";
                    Directory.CreateDirectory(config.M_F_P + "items");
                    var client1 = new WebClient();
                    client1.DownloadProgressChanged += (s, ee) =>
                    {
                        percentage.Text = ee.ProgressPercentage.ToString() + "%";
                        /*kbps.Content = string.Format("{0} kb/s",
                            (ee.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                        mbToDownload.Content = string.Format("{0} MB / {1} MB",
                            (ee.BytesReceived / 1024d / 1024d).ToString("0"),
                            (ee.TotalBytesToReceive / 1024d / 1024d).ToString("0"));*/
                    };
                    await client1.DownloadFileTaskAsync("http://minecraft-ids.grahamedgecombe.com/items.zip",
                        config.M_F_P + "items.zip");
                    percentage.Text = "";
                    actualActivity.Text = "Extracting Additional Data (2/" + totalChecks + ")";
                    await Task.Factory
                        .StartNew(() =>
                            Classes.ZipSharp.ExtractZipFile(config.M_F_P + "items.zip", null, config.M_F_P + "items"))
                        .ContinueWith((ante) => Thread.Sleep(300));
                    File.Delete(config.M_F_P + "items.zip");
                }
                else
                {
                    await Task.Delay(400);
                }
            }

            async Task CheckCurseJson(string totalChecks)
            {
                string curseURL =
                    "https://cursemeta.nikky.moe/api/addon?modpacks=1&property=name&property=id&property=summary&property=authors&property=attachments&property=categorysection&property=PopularityScore&property=downloadcount&property=PrimaryCategoryAvatarUrl&property=IsFeatured&property=PrimaryCategoryName";
                actualActivity.Text = "Checking required data (3/" + totalChecks + ")";
                try
                {
                    //CHECKING FORGE JSON
                    var now = DateTime.Now;
                    var hDiff = now - Settings.Default.curseJSONLastUpdated;
                    ;
                    sw.Start();
                    var client = new WebClient();
                    client.DownloadProgressChanged += (s, ee) =>
                    {
                        percentage.Text = ee.ProgressPercentage.ToString() + "%";
                        /*kbps.Content = string.Format("{0} kb/s",
                            (ee.BytesReceived / 1024d / sw.Elapsed.TotalSeconds).ToString("0.00"));
                        mbToDownload.Content = string.Format("{0} MB / {1} MB",
                            (ee.BytesReceived / 1024d / 1024d).ToString("0"),
                            (ee.TotalBytesToReceive / 1024d / 1024d).ToString("0"));*/
                    };
                    //VERIFICA SE IL JSON DELLE VERSIONI DI FORGE ESISTE ED E' AGGIORNATO
                    if (!File.Exists(config.M_F_P + "complete.json") ||
                        hDiff.TotalHours > 24 ||
                        Settings.Default.curseJSONLastUpdated == Convert.ToDateTime("1/1/1970"))
                    {
                        actualActivity.Text = "Downloading Additional Data (3/" + totalChecks + ")";
                        await client.DownloadFileTaskAsync(curseURL, config.M_F_P + "complete.json.tdownload");
                        percentage.Text = "";
                        File.Move(config.M_F_P + "complete.json.tdownload", config.M_F_P + "complete.json");
                        Settings.Default.curseJSONLastUpdated = DateTime.Now;
                        Settings.Default.Save();

                        //actualActivity.Text = "Extracting Additional Data (3/" + totalChecks + ")";

                        /*await Task.Factory
                            .StartNew(() =>
                                ZipSharp.ExtractBZip2File(config.M_F_P + "complete.json.bz2", config.M_F_P + "complete.json"))
                            .ContinueWith((ante) => Thread.Sleep(300));*/

                        //File.Delete(config.M_F_P + "complete.json.bz2");
                    }
                }
                catch (Exception ee)
                {
                    Console.WriteLine(ee.Message);
                }
            }
        }
    }
}
