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
            transition.SelectedIndex = 0;
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            if(SessionData.lastUser == "" || SessionData.userCount == "")
            {
                var client = new WebClient();
                var response = client.UploadValues(config.statisticsWebService, new System.Collections.Specialized.NameValueCollection());
                var responseString = Encoding.Default.GetString(response);
                var tempdata = responseString.Split(';');
                totalUsers.Text = "Total users: " + tempdata[0];
                lastRegistered.Text = "Last registered: " + tempdata[1];
                SessionData.lastUser = "Last registered: " + tempdata[1];
                SessionData.userCount = "Total users: " + tempdata[0];
            }
            else
            {
                totalUsers.Text = SessionData.userCount;
                lastRegistered.Text = SessionData.lastUser;
            }
            transition.SelectedIndex = 1;
            if(Properties.Settings.Default["justUpdated"].ToString() == "true")
            {
                await Task.Delay(400);
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Changelog(), "RootDialog");
                Properties.Settings.Default["justUpdated"] = "false";
                Properties.Settings.Default.Save();
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
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.OptionsUpdates("Questa funzione non e' ancora disponibile", 250, 50), "RootDialog", ExtendedOpenedEventHandler, ExtendedClosingEventHandler);
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

        private async void changelog_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Changelog(), "RootDialog");
        }

        private async void Button_Click_1(object sender, RoutedEventArgs e)
        {
            var client = new WebClient();
            var response = client.UploadValues(config.statisticsWebService, new System.Collections.Specialized.NameValueCollection());
            var responseString = Encoding.Default.GetString(response);
            var tempdata = responseString.Split(';');
            totalUsers.Text = "Total users: " + tempdata[0];
            lastRegistered.Text = "Last registered: " + tempdata[1];
            SessionData.lastUser = "Last registered: " + tempdata[1];
            SessionData.userCount = "Total users: " + tempdata[0];
            statisticsupdatedlabel.Visibility = Visibility.Visible;
            await Task.Delay(850);
            statisticsupdatedlabel.Visibility = Visibility.Hidden;
        }

        private async void problems_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.OptionsUpdates(@"Per risolvere i tuoi problemi con il launcher, il primo tentativo e' di cancellare la cartella di minecraft del launcher.
                                                                                        Cliccando su procedi verrai portato alla cartella minecraft dove potrai spostare i tuoi salvataggi del gioco e successivamente cancellare la cartella. Per un funzionamento ottimale del launcher ti consigliamo di riavviarlo dopo tale procedura
                                                                                        ", 330, 270, true, "Procedi"), "RootDialog");
            
            string filePath = config.M_F_P;

            // combine the arguments together
            // it doesn't matter if there is a space after ','
            string argument = "/select, \"" + filePath + "\"";

            System.Diagnostics.Process.Start("explorer.exe", argument);

        }

        private async void toAccount_Click(object sender, RoutedEventArgs e)
        {
            statistics_account.SelectedIndex = 1;
            await Task.Delay(300);
            statistics_account.SelectedIndex = 2;
        }

        private async void toStats_Click(object sender, RoutedEventArgs e)
        {
            statistics_account.SelectedIndex = 3;
            await Task.Delay(300);
            statistics_account.SelectedIndex = 0;
        }
    }
}
