// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
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
        public static Dialogs.ModpackLoading loading;
        public static List<string> downloadingVersion;
        public static Dialogs.AddLocalModpack localmodpackadd;
        private bool loaded = false;
        private object lastSelectedModpacksType;
        public Modpacks()
        {
            InitializeComponent();
            Window1.singleton.MenuToggleButton.IsEnabled = true;
            singleton = this;
            transition.SelectedIndex = 0;
        }

        private async void start_Click(object sender, RoutedEventArgs e)
        {
            /*loading = new Dialogs.ModpackLoading();
            if (remote.IsSelected)
            {
                //VERIFICA SE SI E' SELEZIONATA UNA MODPACK
                if (ModpacksLRList.SelectedIndex == -1)
                {
                    var error = new Dialogs.OptionsUpdates("Select a modpack!");
                    await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                    return;
                }
                string actualModpackName = ModpacksLRList.SelectedValue.ToString();
                var result = await Task.Run(() => RemoteModpacks.GetSpecificModpackInfo(actualModpackName));
                var info = result.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);

                //SE LA DIRECTORY ESISTE INIZIA, ALTRIMENTI LA CREA
                if (!Directory.Exists(config.M_F_P + info[4] + "\\instances\\" + info[4]))
                {
                    Directory.CreateDirectory(config.M_F_P + info[4] + "\\instances\\" + info[4]);
                }
                var resultCheck = await MaterialDesignThemes.Wpf.DialogHost.Show(loading, "RootDialog", ExtendedOpenedEventHandler, ExtendedClosingEventHandler);
                if (resultCheck.ToString() == "DownloadNeeded")
                {
                    Window1.singleton.MainPage.Navigate(new Pages.StartingWorking(true, Pages.Modpacks.singleton.ModpacksLRList.SelectedItem.ToString()));
                }
                else
                {
                    Classes.MinecraftStarter.Minecraft_Start(Pages.Modpacks.singleton.ModpacksLRList.SelectedItem.ToString(), true);
                }
            }
            else
            {
                if (ModpacksLRList.SelectedIndex == -1)
                {
                    var error = new Dialogs.OptionsUpdates("Select a modpack!");
                    await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                    return;
                }
                Classes.MinecraftStarter.Minecraft_Start(Pages.Modpacks.singleton.ModpacksLRList.SelectedItem.ToString(), false);
            }*/
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            transition.SelectedIndex = 1;
            /*if (!Directory.Exists(config.LocalModpacks))
            {
                Directory.CreateDirectory(config.LocalModpacks);
            }
            await ModpacksRefreshMethod();
            registrationList = ModpacksLRList.Items.Cast<string>().ToList();
            lastSelectedModpacksType = remote;
            loaded = true;*/
        }

        /*private async void ModpacksLRList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            try
            {
                string actualModpackName = ModpacksLRList.SelectedValue.ToString();
                var result = await Task.Run(() => RemoteModpacks.GetSpecificModpackInfo(actualModpackName));
                var info = result.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                if (Directory.Exists(config.M_F_P + info[4]))
                {
                    isinstalled.Content = @"Installed";
                    version.Content = info[2];
                    forge.Content = (info[3] == "true") ? "With Forge" : "Without Forge";
                    start.Content = "Play";
                }
                else
                {
                    isinstalled.Content = "Not Installed";
                    version.Content = info[2];
                    forge.Content = (info[3] == "true") ? "With Forge" : "Without Forge";
                    start.Content = "Install";
                }
                description.Text = info[1];
            }
            catch(Exception ex)
            {
                Windows.DebugOutputConsole.singleton.Write("Could not get modpack description-- " + ex);
            }
        }


        private async Task ModpacksRefreshMethod()
        {
            if (remote.IsSelected)
            {
                deleteLocalModpack.IsEnabled = false;
                addLocalModpack.IsEnabled = false;
                refreshRemoteModpacks.IsEnabled = false;
                ModpacksLRList.Items.Clear();
                var remotelist = await Classes.RemoteModpacks.GetModpacksList();
                refreshRemoteModpacks.IsEnabled = true;

                foreach (var x in remotelist.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var z = x.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                    ModpacksLRList.Items.Add(z[0]);
                }
            }
            else
            {
                deleteLocalModpack.IsEnabled = true;
                addLocalModpack.IsEnabled = true;
                string[] x = await Classes.LocalModpacks.GetModpacksDirectoryList();
                Pages.Modpacks.singleton.ModpacksLRList.Items.Clear();
                try
                {
                    var modpackslist = Directory.GetDirectories(config.LocalModpacks);
                    foreach (var element in modpackslist)
                    {
                        string fullPath = System.IO.Path.GetFullPath(element).TrimEnd(System.IO.Path.DirectorySeparatorChar);
                        string projectName = System.IO.Path.GetFileName(fullPath);
                        if (Array.IndexOf(x, projectName) == -1)
                        {
                            ModpacksLRList.Items.Add(projectName);
                        }
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.ToString());
                }
            }
            registrationList = ModpacksLRList.Items.Cast<string>().ToList();
        }

        private async void refreshRemoteModpacks_Click(object sender, RoutedEventArgs e)
        {
            ModpacksLRList.Items.Clear();
            await ModpacksRefreshMethod();
        }

        private void textBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (remoteModpacksSearch.Text != "")
            {
                ModpacksLRList.Items.Clear();
                foreach (var i in registrationList)
                {
                    if (i.ToLower().Contains(remoteModpacksSearch.Text.ToLower()))
                        ModpacksLRList.Items.Add(i);
                }
            }
            else
            {
                ModpacksLRList.Items.Clear();
                foreach (var i in registrationList)
                {
                    ModpacksLRList.Items.Add(i);
                }
            }
        }

        private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                Pages.StartingWorking.urls = await ModpackStartupCheck.CheckFiles(Pages.Modpacks.singleton.ModpacksLRList.SelectedItem.ToString(), true);


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
                //cancelled by user...tidy up and dont close as will have already closed
            }
            catch
            {

            }
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
                var modpackname = ModpacksLRList.SelectedValue.ToString();
                await Task.Run(() => Directory.Delete(config.LocalModpacks + modpackname, true));
                await Classes.RemoteModpacks.GetModpacksList();
                string[] x = await Classes.LocalModpacks.GetModpacksDirectoryList();
                ModpacksLRList.Items.Clear();
                try
                {
                    var modpackslist = Directory.GetDirectories(config.LocalModpacks);
                    foreach (var element in modpackslist)
                    {
                        string fullPath = System.IO.Path.GetFullPath(element).TrimEnd(System.IO.Path.DirectorySeparatorChar);
                        string projectName = System.IO.Path.GetFileName(fullPath);
                        if (Array.IndexOf(x, projectName) == -1)
                        {
                            ModpacksLRList.Items.Add(projectName);
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
        private void filter_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Filter");
        }

        private async void modpackstypeselection_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (modpackstypeselection.SelectedItem == null)
            {
                modpackstypeselection.SelectedItem = lastSelectedModpacksType;
                return;
            }
            lastSelectedModpacksType = modpackstypeselection.SelectedItem;

            if (loaded == true)
            {
                await ModpacksRefreshMethod();
            }
        }

        private async void addpack_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.AddPack(), "RootDialog", ExtendedOpenedEventHandlerAddPack);
        }

        private static async void ExtendedOpenedEventHandlerAddPack(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            do
            {
                await Task.Delay(100);
            }
            while (Dialogs.Register.close == false);
            try
            {
                Dialogs.Register.close = false;
                eventArgs.Session.Close();
            }
            catch { }
        }

        private async void delete_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string actualModpackName = ModpacksLRList.SelectedValue.ToString();
                var result = await Task.Run(() => RemoteModpacks.GetSpecificModpackInfo(actualModpackName));
                var info = result.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                if (Directory.Exists(config.M_F_P + info[4]))
                {
                    await Task.Run(() => Directory.Delete(config.M_F_P + info[4], true));
                    isinstalled.Content = "Not Installed";
                    start.Content = "Install";
                    MessageBox.Show("Modpack deleted");

                }
                else
                {
                    MessageBox.Show("Not installed. What to delete?");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Something not expected happened. Make sure no files on that folder are used and that no explorer is opened there, then try again");
                Windows.DebugOutputConsole.singleton.Write("Error deleting modpack-- " + ex);
            }
        }*/
    }
}
