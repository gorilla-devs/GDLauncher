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
            try
            {
                var client = new WebClient();
                var values = new System.Collections.Specialized.NameValueCollection();
                var response = await client.UploadValuesTaskAsync(config.launcherStatusWebService, values);
                var responseString = Encoding.Default.GetString(response);
                if (responseString.Contains("disabled"))
                {
                    MessageBox.Show("Launcher attualmente in manutenzione, riprova piu' tardi");
                    Application.Current.Shutdown();
                }
            }
            catch { }

            Windows.DebugOutputConsole console = new Windows.DebugOutputConsole();
            if (Window1.singleton.started == false)
            {
                Window1.singleton.started = true;


                string update = await AutoUpdater.CheckVersion();
                await AutoUpdater.Download(update);


                //SETTING UP JAVA

                if(await JAVAInstaller.isJavaInstalled() == false)
                {
                    await JAVAInstaller.DownloadJava();
                }
                transition.SelectedIndex = 1;
                await Task.Delay(350);
                if (Properties.Settings.Default["keepMeLoggedIn"].ToString() == "True")
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
    }
}
