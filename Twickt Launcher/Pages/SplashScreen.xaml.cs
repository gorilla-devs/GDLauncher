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
                EmbeddedResourceExtract("Twickt_Launcher", System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "EmbeddedResources", "7z86.dll");
                EmbeddedResourceExtract("Twickt_Launcher", System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "EmbeddedResources", "SevenZipSharp.dll");
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
                Window1.singleton.MainPage.Navigate(new Pages.Login());
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
