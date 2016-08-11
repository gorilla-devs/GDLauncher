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
        public static List<string> downloadingVersion;
        public static Dialogs.AddLocalModpack localmodpackadd;
        public Modpacks()
        {
            InitializeComponent();
            Window1.singleton.MenuToggleButton.IsEnabled = true;
            singleton = this;
        }

        private async void start_Click(object sender, RoutedEventArgs e)
        {
            //VERIFICA SE SI E' SELEZIONATA UNA MODPACK
            if (remoteModpacks.SelectedIndex == -1)
            {
                var error = new Dialogs.OptionsUpdates("Select a modpack!");
                await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                return;
            }
            downloadingVersion = await RemoteModpacks.GetMinecraftUrlsAndData(remoteModpacks.SelectedValue.ToString());
            //SE LA DIRECTORY ESISTE INIZIA, ALTRIMENTI LA CREA
            if (!Directory.Exists(config.M_F_P + downloadingVersion[1] + "\\instances\\" + await RemoteModpacks.GetModpacksDir(remoteModpacks.SelectedValue.ToString())))
            {
                Directory.CreateDirectory(config.M_F_P + downloadingVersion[1] + "\\instances\\" + await RemoteModpacks.GetModpacksDir(remoteModpacks.SelectedValue.ToString()));
            }
            var result = await MaterialDesignThemes.Wpf.DialogHost.Show(loading, "RootDialog", ExtendedOpenedEventHandler, ExtendedClosingEventHandler);
            if (result.ToString() == "DownloadNeeded")
            {
                Window1.singleton.MainPage.Navigate(new Pages.StartingWorking(true, Pages.Modpacks.singleton.remoteModpacks.SelectedItem.ToString()));
            }
            else
            {
                Classes.MinecraftStarter.Minecraft_Start(Pages.Modpacks.singleton.remoteModpacks.SelectedItem.ToString(), true);
            }
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            if (!Directory.Exists(config.LocalModpacks))
            {
                Directory.CreateDirectory(config.LocalModpacks);
            }
            await Classes.RemoteModpacks.GetModpacksList();
            string[] x = await Classes.LocalModpacks.GetModpacksDirectoryList();
            registrationList = remoteModpacks.Items.Cast<string>().ToList();
            try
            {
                var modpackslist = Directory.GetDirectories(config.LocalModpacks);
                foreach (var element in modpackslist)
                {
                    string fullPath = System.IO.Path.GetFullPath(element).TrimEnd(System.IO.Path.DirectorySeparatorChar);
                    string projectName = System.IO.Path.GetFileName(fullPath);
                    if (Array.IndexOf(x, projectName) == -1)
                    {
                        localModpacks.Items.Add(projectName);
                    }
                }
            }
            catch(Exception ex)
            {
                MessageBox.Show(ex.ToString());
            }
        }

        private async void remoteModpacks_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            try
            {
                downloadingVersion = await RemoteModpacks.GetMinecraftUrlsAndData(remoteModpacks.SelectedValue.ToString());
                if (Directory.Exists(config.M_F_P + downloadingVersion[1] + "\\instances\\" + await RemoteModpacks.GetModpacksDir(remoteModpacks.SelectedValue.ToString())))
                    isinstalled.Content = "Installed";
                else
                    isinstalled.Content = "Not Installed";
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
            string[] x = await Classes.LocalModpacks.GetModpacksDirectoryList();
            localModpacks.Items.Clear();
            try
            {
                var modpackslist = Directory.GetDirectories(config.LocalModpacks);
                foreach (var element in modpackslist)
                {
                    string fullPath = System.IO.Path.GetFullPath(element).TrimEnd(System.IO.Path.DirectorySeparatorChar);
                    string projectName = System.IO.Path.GetFileName(fullPath);
                    if (Array.IndexOf(x, projectName) == -1)
                    {
                        localModpacks.Items.Add(projectName);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.ToString());
            }
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
                Pages.StartingWorking.urls = await ModpackStartupCheck.CheckFiles(Pages.Modpacks.singleton.remoteModpacks.SelectedItem.ToString(), true);


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

        private static async void ExtendedOpenedEventHandlerLocal(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            do
            {
                await Task.Delay(2000);
            }
            while (Dialogs.AddLocalModpack.close == false);
            try
            {
                Dialogs.AddLocalModpack.close = false;
                eventArgs.Session.Close();
            }
            catch { }
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

        private async void start_local_Click(object sender, RoutedEventArgs e)
        {
            if (localModpacks.SelectedIndex == -1)
            {
                var error = new Dialogs.OptionsUpdates("Select a modpack!");
                await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                return;
            }
            Classes.MinecraftStarter.Minecraft_Start(Pages.Modpacks.singleton.localModpacks.SelectedItem.ToString(), false);
        }

        private async void addLocalModpack_Click(object sender, RoutedEventArgs e)
        {
            localmodpackadd = new Dialogs.AddLocalModpack();
            await MaterialDesignThemes.Wpf.DialogHost.Show(localmodpackadd, "RootDialog", ExtendedOpenedEventHandlerLocal);
        }

        private async void deleteLocalModpack_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var modpackname = localModpacks.SelectedValue.ToString();
                await Task.Run(() => Directory.Delete(config.LocalModpacks + modpackname, true));
                await Classes.RemoteModpacks.GetModpacksList();
                string[] x = await Classes.LocalModpacks.GetModpacksDirectoryList();
                localModpacks.Items.Clear();
                try
                {
                    var modpackslist = Directory.GetDirectories(config.LocalModpacks);
                    foreach (var element in modpackslist)
                    {
                        string fullPath = System.IO.Path.GetFullPath(element).TrimEnd(System.IO.Path.DirectorySeparatorChar);
                        string projectName = System.IO.Path.GetFileName(fullPath);
                        if (Array.IndexOf(x, projectName) == -1)
                        {
                            localModpacks.Items.Add(projectName);
                        }
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.ToString());
                }
            }
            catch
            {
                MessageBox.Show("Non e' stato possibile cancellare la cartella");
            }
        }
    }
}
