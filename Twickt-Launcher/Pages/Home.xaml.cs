using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
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
    /// Logica di interazione per Home.xaml
    /// </summary>
    public partial class Home : Page
    {
        public static Dialogs.ModpackLoading loading = new Dialogs.ModpackLoading();
        public Home()
        {
            InitializeComponent();
            Dispatcher.BeginInvoke(DispatcherPriority.Loaded, new Action(() =>
            {
                var navWindow = Window.GetWindow(this) as NavigationWindow;
                if (navWindow != null) navWindow.ShowsNavigationUI = false;
            }));
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            string data = "";
            WebClient c = new WebClient();
            c.DownloadStringCompleted += (s, ex) =>
            {
                try
                {
                    data = ex.Result;
                }
                catch
                {
                    MessageBox.Show("Non e' stato possibile scaricare il changelogs");
                }
            };
            changelogs.Text = "Loading...";
            changelogs.FontSize = 32;
            changelogs.FontSize = 12;
            if(SessionData.changelog == "")
            {
                await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "/changelog.html"));
                SessionData.changelog = data;
                changelogs.Text = data;
            }
            else
            {
                changelogs.Text = SessionData.changelog;
            }
        }

        private void websiteLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("http://launcher.twickt.com");
        }

        private void facebookLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("https://www.facebook.com/twicktlauncher/");
        }

        private void twitterLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("https://twitter.com/twicktlab");
        }

        private void emailLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("mailto:davide.ceschia@twickt.com");
        }

        private void button_Click(object sender, RoutedEventArgs e)
        {
            Window1.singleton.MainPage.Navigate(new Pages.Modpacks());
            Window1.singleton.NavigationMenu.SelectedIndex = 2;
        }

        private void image1_AnimationCompleted(object sender, RoutedEventArgs e)
        {

        }

        private async void modpack2start_Click(object sender, RoutedEventArgs e)
        {
            //SE LA DIRECTORY ESISTE ABILITA IL PULSANTE, ALTRIMENTI LA CREA
            if (Directory.Exists(config.M_F_P + "instances\\" + await RemoteModpacks.GetModpacksDir("Brotherhood Of Heroes")))
            {
                Classes.MinecraftStarter.Minecraft_Start("BrotherHood Of Heroes");
            }
            else
            {
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.OptionsUpdates("Questa modpack non e' attualmente installata. Andare nella sezione modpacks e avviarla da li la prima volta", 400, 300), "RootDialog", ExtendedOpenedEventHandler, ExtendedClosingEventHandler);
            }
           
        }
        private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            await Task.Delay(1200);
            eventArgs.Session.Close();
        }

        private static void ExtendedClosingEventHandler(object sender, MaterialDesignThemes.Wpf.DialogClosingEventArgs eventArgs)
        {

        }

        private void modpack2start_Loaded(object sender, RoutedEventArgs e)
        {

        }
    }
}
