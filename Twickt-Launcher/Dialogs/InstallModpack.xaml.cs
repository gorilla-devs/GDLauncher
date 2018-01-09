/*Installer dei pacchetti*/

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
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

namespace Twickt_Launcher.Dialogs
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
                dynamic json = JsonConvert.DeserializeObject(Pages.Home.singleton.forgeJSON);
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
                var versions = parsed.versions;
            }
            else
            {
                //TUTTE LE VERSIONI
                if (forgeAllVersions.IsChecked.Value)
                {
                    dynamic json = JsonConvert.DeserializeObject(Pages.Home.singleton.forgeJSON);
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
                    dynamic json = JsonConvert.DeserializeObject(Pages.Home.singleton.forgeJSON);
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
                    catch(Exception ex) {
                    }
                    forgeVersions.SelectedIndex = 0;
                }
            }
            loading.Visibility = Visibility.Hidden;
        }

        private async void install_Click(object sender, RoutedEventArgs e)
        {
            DialogHostExtensions.SetCloseOnClickAway(this, false);
            Regex rg = new Regex(@"^[a-zA-Z0-9\s,]*$");
            if (String.IsNullOrEmpty(instanceTextName.Text))
            {
                MessageBox.Show("Nome istanza vuoto");
                return;
            }
            if (!rg.IsMatch(instanceTextName.Text) || (instanceTextName.Text.Contains(" ")))
            {
                MessageBox.Show("Solo lettere e numero ammessi");
                return;
            }
            if (Directory.Exists(config.M_F_P + "Packs\\" + instanceTextName.Text))
            {
                MessageBox.Show("Nome istanza gia' esistente");
                return;
            }
            ctoken = new CancellationTokenSource();
            transition.SelectedIndex = 2;
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
            downloader._cts.Cancel();
            ctoken.Cancel();
            await Task.Run( () => Application.Current.Dispatcher.Invoke(new Action(() =>
            {
                try
                {
                    Directory.Delete(config.M_F_P + "Packs\\" + instanceTextName.Text, true);
                }
                catch
                {
                    MessageBox.Show("Errore cercando di cancellare la modpack di cui si e' interrotta l'installazione. Procedere cancellandola manualmente dalla sezione modpacks installate");
                }
            })));
            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            name = "Minecraft Vanilla";
            transition.SelectedIndex = 1;
            await Task.Delay(300);
            await LoadPackData();
            install.IsEnabled = true;
        }

        private async void Button_Click_1(object sender, RoutedEventArgs e)
        {
            name = "Forge Stock";
            forgeAllVersions.Visibility = Visibility.Visible;
            var client = new WebClient();
            loading.IsIndeterminate = false;
            forgeAllVersions.IsEnabled = false;
            forgeVersions.Visibility = Visibility.Visible;
            forgeVersionsText.Visibility = Visibility.Visible;
            forgeVersions.IsEnabled = false;
            versionsList.IsEnabled = false;
            client.DownloadProgressChanged += (s, ee) =>
            {
                loading.Value = ee.ProgressPercentage;
            };
            transition.SelectedIndex = 1;
            loading.Visibility = Visibility.Visible;
            await Task.Delay(300);
            HttpWebRequest request = (HttpWebRequest)System.Net.WebRequest.Create("http://files.minecraftforge.net/maven/net/minecraftforge/forge/json");
            request.Method = "HEAD";
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            string disposition = response.Headers["Content-Length"];

            //VERIFICA SE IL JSON DELLE VERSIONI DI FORGE ESISTE ED E' AGGIORNATO
            if (Pages.Home.singleton.forgeJSON == null)
            {
                if (!File.Exists(config.M_F_P + "forgeVersions.json") || Properties.Settings.Default.forgeJSONContentLength != disposition)
                {
                    await client.DownloadFileTaskAsync("http://files.minecraftforge.net/maven/net/minecraftforge/forge/json", config.M_F_P + "forgeVersions.json");
                    Properties.Settings.Default.forgeJSONContentLength = disposition;
                    Properties.Settings.Default.Save();
                }
                await Task.Delay(300);
                using (StreamReader r = new StreamReader(config.M_F_P + "forgeVersions.json"))
                {
                    Pages.Home.singleton.forgeJSON = await r.ReadToEndAsync();
                }

            }
            dynamic json = JsonConvert.DeserializeObject(Pages.Home.singleton.forgeJSON);
            foreach (var x in json["number"])
            {
                forgeAllVersionsList.Add(Convert.ToString(x.Value.mcversion));
            }
            forgeAllVersionsList = forgeAllVersionsList.Distinct().ToList();
            loading.IsIndeterminate = true;
            await LoadPackData();
            install.IsEnabled = true;
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
    }
}
