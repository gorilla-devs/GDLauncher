using MaterialDesignThemes.Wpf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Twickt_Launcher.Classes;

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per Modpacks.xaml
    /// </summary>
    public partial class Modpacks : Page
    {
        public static Modpacks singleton;
        public List<string> registrationList;
        public static Dialogs.ModpackLoading loading = new Dialogs.ModpackLoading();
        public Modpacks()
        {
            InitializeComponent();
            Window1.singleton.MenuToggleButton.IsEnabled = true;
            singleton = this;
        }

        private async void start_Click(object sender, RoutedEventArgs e)
        {
            //VERIFICA SE SI E' SELEZIONATA UNA MODPACK
            if(remoteModpacks.SelectedIndex == -1)
            {
                var error = new Dialogs.OptionsUpdates("Select a modpack!");
                await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                return;
            }
            //SE LA DIRECTORY ESISTE INIZIA, ALTRIMENTI LA CREA
            if (!Directory.Exists(config.M_F_P + "instances\\" + await RemoteModpacks.GetModpacksDir(remoteModpacks.SelectedValue.ToString())))
            {
                Directory.CreateDirectory(config.M_F_P + "instances\\" + await RemoteModpacks.GetModpacksDir(remoteModpacks.SelectedValue.ToString()));
            }
            var result = await MaterialDesignThemes.Wpf.DialogHost.Show(loading, "RootDialog", ExtendedOpenedEventHandler, ExtendedClosingEventHandler);
            if (result.ToString() == "DownloadNeeded")
            {
                Window1.singleton.MainPage.Navigate(new Pages.StartingWorking());
            }
            else
            {
                Classes.MinecraftStarter.Minecraft_Start(Pages.Modpacks.singleton.remoteModpacks.SelectedItem.ToString());
            }
        }

        private async void addLocalModpack_Click(object sender, RoutedEventArgs e)
        {
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await Classes.RemoteModpacks.GetModpacksList();
            registrationList = remoteModpacks.Items.Cast<string>().ToList();
        }

        private async void remoteModpacks_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            try
            {
                description.Text = await Classes.RemoteModpacks.GetModpacksDescription(remoteModpacks.SelectedItem.ToString());
            }
            catch
            {
                Windows.DebugOutputConsole.singleton.Write("Could not get modpack description");
            }
            
        }

        private async void refreshRemoteModpacks_Click(object sender, RoutedEventArgs e)
        {
            await Classes.RemoteModpacks.GetModpacksList();
        }

        private void textBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (remoteModpacksSearch.Text != "")
            {
                remoteModpacks.Items.Clear();
                foreach (var i in registrationList)
                {
                    if (i.ToLower().Contains(remoteModpacksSearch.Text.ToLower()))
                        remoteModpacks.Items.Add(i);
                }
            }
            else
            {
                remoteModpacks.Items.Clear();
                foreach (var i in registrationList)
                {
                    remoteModpacks.Items.Add(i);
                }
            }
        }

        private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                Pages.StartingWorking.urls = await ModpackStartupCheck.CheckFiles(Pages.Modpacks.singleton.remoteModpacks.SelectedItem.ToString());


                if (Pages.StartingWorking.urls.Count != 0)
                {
                    Windows.DebugOutputConsole.singleton.Write("Some files are not present or different from the server. Going to download them");
                    eventArgs.Session.Close("DownloadNeeded");
                }
                else
                {
                    //START MINECRAFT
                    eventArgs.Session.Close("Nope");
                }
            }
            catch
            {

            }
        }

        private static void ExtendedClosingEventHandler(object sender, MaterialDesignThemes.Wpf.DialogClosingEventArgs eventArgs)
        {
            if(loading.forgeProgress.IsVisible == true)
                loading.forgeProgress.Visibility = Visibility.Hidden;
            if (loading.whatdoing.IsVisible == true)
                loading.whatdoing.Visibility = Visibility.Hidden;
        }

        private static async void erroropenEvent(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                await Task.Delay(1200);
                eventArgs.Session.Close();
            }
            catch (TaskCanceledException)
            {
                /*cancelled by user...tidy up and dont close as will have already closed */
            }
            catch
            {

            }
        }

        private void editLocalModpack_Click(object sender, RoutedEventArgs e)
        {
        }
    }
}
