/*Installer dei pacchetti*/

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Logica di interazione per InstallModpack.xaml
    /// </summary>
    public partial class InstallModpack : UserControl
    {
        static string name;
        public static InstallModpack singleton;
        public static string vanillajson;
        private static Classes.Downloader downloader;
        public static CancellationTokenSource ctoken;
        public static string whatToInstall = null;
        public static List<string> forgeAllVersionsList = new List<string>();
        public InstallModpack()
        {
            InitializeComponent();
            singleton = this;
            name = whatToInstall;
            DialogHostExtensions.SetCloseOnClickAway(this, true);
            DataContext = new Classes.TextFieldsViewModel();

        }

        public async Task LoadPackData()
        {
            loading.Visibility = Visibility.Visible;
            if (name == "Minecraft Vanilla")
            {
                var client = new WebClient();
                try
                {
                    vanillajson = await client.DownloadStringTaskAsync("https://launchermeta.mojang.com/mc/game/version_manifest.json");
                }
                catch
                {
                    MessageBox.Show("Errore di rete");
                }
                dynamic parsed = JsonConvert.DeserializeObject(vanillajson);
                var versions = parsed.versions;
                foreach (var item in versions)
                {
                    if (!Regex.IsMatch((string)item.id, "[a-z]"))
                    {
                        versionsList.Items.Add((string)item.id);
                    }
                }
                await Task.Delay(100);
            }
            else
            {
                dynamic json = JsonConvert.DeserializeObject(Pages.SplashScreen.singleton.forgeJson);
                foreach (var x in json["promos"])
                {
                    if(!versionsList.Items.Contains(json["number"][x.Value.ToString()]["mcversion"]))
                        versionsList.Items.Add(json["number"][x.Value.ToString()]["mcversion"]);
                }
            }
            versionsList.SelectedIndex = 0;
            loading.Visibility = Visibility.Hidden;

        }
        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            await Task.Delay(400);
        }

        private async void versionsList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            loading.Visibility = Visibility.Visible;
            if (name == "Minecraft Vanilla")
            {
                await Task.Delay(100);
                dynamic parsed = JsonConvert.DeserializeObject(vanillajson);
            }
            else
            {
                //TUTTE LE VERSIONI
                if (forgeAllVersions.IsChecked.Value)
                {
                    dynamic json = JsonConvert.DeserializeObject(Pages.SplashScreen.singleton.forgeJson);
                    try
                    {
                        forgeVersions.Items.Clear();
                        foreach (var x in json["number"])
                        {

                            if (Convert.ToString(x.Value.mcversion) == versionsList.SelectedValue.ToString())
                            {
                                forgeVersions.Items.Add(Convert.ToString(x.Value.version));
                            }
                        }
                    }
                    catch { }
                    forgeVersions.SelectedIndex = 0;
                }
                //SOLO QUELLE PROMOS
                else
                {
                    dynamic json = JsonConvert.DeserializeObject(Pages.SplashScreen.singleton.forgeJson);
                    try
                    {
                        List<string> promos = new List<string>();
                        foreach (var x in json["promos"])
                        {
                            promos.Add(x.Value.ToString());
                        }
                        forgeVersions.Items.Clear();

                        foreach (var x in json["number"])
                        {
                            if (promos.Contains(Convert.ToString(x.Value.build)))
                            {
                                if (Convert.ToString(x.Value.mcversion) == versionsList.SelectedValue.ToString())
                                {
                                    forgeVersions.Items.Add(Convert.ToString(x.Value.version));
                                }
                            }
                        }
                    }
                    catch(Exception) {
                    }
                    forgeVersions.SelectedIndex = 0;
                }
            }
            loading.Visibility = Visibility.Hidden;
        }

        private async void install_Click(object sender, RoutedEventArgs e)
        {
            DialogHostExtensions.SetCloseOnClickAway(this, false);
            if (Directory.Exists(config.M_F_P + "Packs\\" + instanceTextName.Text))
            {
                MessageBox.Show("Nome istanza gia' esistente");
                return;
            }
            ctoken = new CancellationTokenSource();
            transition.SelectedIndex = 3;
            modpackName.Content = versionsList.Text;
            string forgeVersion = "false";
            try
            {
                forgeVersion = forgeVersions.SelectedValue.ToString();
            }
            catch { }
            var files = await Classes.JSON.GetFiles(name, instanceTextName.Text, versionsList.SelectedValue.ToString(), forgeVersion, versionsList.Text);
            cancelButton.IsEnabled = true;
            downloader = new Classes.Downloader();
            await downloader.MCDownload(files, instanceTextName.Text, ctoken.Token);
            cancelButton.Visibility = Visibility.Hidden;
            continueButton.Visibility = Visibility.Visible;
            installationEndedIcon.Visibility = Visibility.Visible;
            installationEndedText.Visibility = Visibility.Visible;
        }

        private async void cancelButton_Click(object sender, RoutedEventArgs e)
        {
            cancelButton.IsEnabled = false;
            cleaningUp.Visibility = Visibility.Visible;
            await Task.Run(() => downloader._cts.Cancel());
            await Task.Run(() => ctoken.Cancel());

            await Task.Run( () => Application.Current.Dispatcher.Invoke(new Action(() =>
            {
                try
                {
                    Directory.Delete(config.M_F_P + "Packs\\" + instanceTextName.Text, true);
                }
                catch(Exception ex)
                {
                    Console.WriteLine(ex.InnerException);
                }
            })));
            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);

        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            name = "Minecraft Vanilla";
            transition.SelectedIndex = 2;
            await Task.Delay(300);
            await LoadPackData();
        }

        private async void Button_Click_1(object sender, RoutedEventArgs e)
        {
            name = "Forge Stock";
            forgeAllVersions.Visibility = Visibility.Visible;
            loading.IsIndeterminate = false;
            forgeAllVersions.IsEnabled = false;
            forgeVersions.Visibility = Visibility.Visible;
            forgeVersionsText.Visibility = Visibility.Visible;
            forgeVersions.IsEnabled = false;
            versionsList.IsEnabled = false;
            transition.SelectedIndex = 1;
            loading.Visibility = Visibility.Visible;
            dynamic json = JsonConvert.DeserializeObject(Pages.SplashScreen.singleton.forgeJson);
            foreach (var x in json["number"])
            {
                forgeAllVersionsList.Add(Convert.ToString(x.Value.mcversion));
            }
            forgeAllVersionsList = forgeAllVersionsList.Distinct().ToList();
            loading.IsIndeterminate = true;
            await LoadPackData();
            forgeVersions.IsEnabled = true;
            forgeAllVersions.IsEnabled = true;
            loading.Visibility = Visibility.Hidden;
            versionsList.IsEnabled = true;


        }

        private void forgeAllVersions_Checked(object sender, RoutedEventArgs e)
        {
            forgeVersions.Items.Clear();
            versionsList.Items.Clear();
            foreach (var item in forgeAllVersionsList)
            {
                versionsList.Items.Add(item);
            }
            versionsList.SelectedIndex = versionsList.Items.Count - 1;
        }

        private async void forgeAllVersions_Unchecked(object sender, RoutedEventArgs e)
        {
            forgeVersions.Items.Clear();
            versionsList.Items.Clear();
            await LoadPackData();
        }

        private void instanceTextName_TextChanged(object sender, TextChangedEventArgs e)
        {
            try
            {
                Regex rg = new Regex(@"^[a-zA-Z0-9\s,]*$");

                if (instanceTextName.Text != "" && !instanceTextName.Text.Contains(" ") && !string.IsNullOrEmpty(instanceTextName.Text) && rg.IsMatch(instanceTextName.Text))
                    install.IsEnabled = true;
                else
                    install.IsEnabled = false;
            }
            catch { }
        }

        private void Button_Click_2(object sender, RoutedEventArgs e)
        {
            new Windows.WebBrowser("https://files.minecraftforge.net/").Show();
            transition.SelectedIndex = 2;

        }

        private async void Button_Click_3(object sender, RoutedEventArgs e)
        {
            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
            var dialog = new Modpacks();
            await MaterialDesignThemes.Wpf.DialogHost.Show(dialog);
            GC.Collect();
        }
    }
}
