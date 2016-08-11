using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
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
using Twickt_Launcher.Classes;

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per SplashScreen.xaml
    /// </summary>
    public partial class SplashScreen : Page
    {
        private CancellationTokenSource _cancellationTokenSource;
        public static SplashScreen singleton;
        public SplashScreen()
        {
            InitializeComponent();
            Window1.singleton.MenuToggleButton.IsEnabled = false;
            Window1.singleton.popupbox.IsEnabled = false;
            singleton = this;
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            if(Classes.ComputerInfoDetect.isDirOK() == false)
            {
                MessageBox.Show("E' stato rilevato un errore nella directory. Il percorso dove risiede il launcher non puo' contenere spazi!(Stiamo lavorando per fixare)");
                Application.Current.Shutdown();
            }
            using (var webClient = new System.Net.WebClient())
            {
                var json = webClient.DownloadString(config.updateWebsite + "/Modpacks.json");
                dynamic stuff = JObject.Parse(json);
                string launcherStatus = stuff.LauncherStatus;
                if(launcherStatus.ToString() == "disabled")
                {
                    MessageBox.Show("Launcher non attivo");
                    Application.Current.Shutdown();
                }
            }

            Windows.DebugOutputConsole console = new Windows.DebugOutputConsole();
            if (Window1.singleton.started == false)
            {
                Window1.singleton.started = true;
                Windows.DebugOutputConsole.singleton.Write("Extracting DLL");
                try
                {
                    //EmbeddedResourceExtract("Twickt_Launcher", System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "EmbeddedResources", "7z86.dll");
                    //EmbeddedResourceExtract("Twickt_Launcher", System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "EmbeddedResources", "SevenZipSharp.dll");
                }
                catch(System.IO.IOException)
                {}
                catch
                {
                    MessageBox.Show("Errore estraendo le librerie");
                }
                //EmbeddedResourceExtract("Twickt_Launcher", System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "EmbeddedResources", "libsodium.dll");
                //EmbeddedResourceExtract("Twickt_Launcher", System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "EmbeddedResources", "Sodium.dll");
                Windows.DebugOutputConsole.singleton.Write("DLL extracted");

                string update = await AutoUpdater.CheckVersion();
                await AutoUpdater.Download(update);
                //SETTING UP JAVA

                if(await JAVAInstaller.isJavaInstalled() == false)
                {
                    await JAVAInstaller.DownloadJava();
                }
                if(Properties.Settings.Default["keepMeLoggedIn"].ToString() == "True")
                {
                    var data = Properties.Settings.Default["Sessiondata"].ToString().Split(';');
                    SessionData.username = data[0];
                    SessionData.email = data[1];
                    SessionData.isAdmin = data[2];
                    Window1.singleton.MenuToggleButton.IsEnabled = true;
                    Window1.singleton.popupbox.IsEnabled = true;
                    Window1.singleton.loggedinName.Text = "Logged in as " + SessionData.username;
                    Window1.singleton.MainPage.Navigate(new Pages.Home());
                }
                else
                {
                    Window1.singleton.MainPage.Navigate(new Pages.Login());
                }

            }
        }

        public static void EmbeddedResourceExtract(string nameSpace, string outDirectory, string internalFilePath, string resourcename)
        {
            Assembly assembly = Assembly.GetCallingAssembly();
            using (Stream s = assembly.GetManifestResourceStream(nameSpace + "." + internalFilePath + "." + resourcename))
            using (BinaryReader r = new BinaryReader(s))
            using (FileStream fs = new FileStream(outDirectory + "\\" + resourcename, FileMode.OpenOrCreate))
            using (BinaryWriter w = new BinaryWriter(fs))
                w.Write(r.ReadBytes((int)s.Length));
        }
    }
}
