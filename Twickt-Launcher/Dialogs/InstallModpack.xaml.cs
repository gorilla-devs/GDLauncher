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
        public InstallModpack(string modpackname)
        {
            InitializeComponent();
            singleton = this;
            name = modpackname;
        }
        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
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
                    versionsList.Items.Add((string)item.id);
                }
                await Task.Delay(100);
                foreach (var item in versions)
                {
                    if (versionsList.Text == (string)item.id)
                    {
                        modpackname.Content = (string)item.id;
                        mc_version.Content = (string)item.id;
                        forge_version.Content = "false";
                        mods_numb.Content = "0";
                        creation_date.Content = (string)item.releaseTime;
                    }
                }
            }
            else
            {
                var client = new WebClient();
                var values = new NameValueCollection();
                values["target"] = "specific";
                values["name"] = name;

                var response = client.UploadValues(config.modpacksWebService, values);

                var responseString = Encoding.Default.GetString(response);
                foreach (var x in responseString.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var z = x.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                    //DIVIDE LE STRINGHE RESTITUENDO z[0] (il nome della modpack) e z[1] (la descrizione della modpack)
                    versionsList.Items.Add(z[0]);
                }
            }
            loading.Visibility = Visibility.Hidden;
        }

        private async void versionsList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            loading.Visibility = Visibility.Visible;
            if (name == "Minecraft Vanilla")
            {
                await Task.Delay(100);
                dynamic parsed = JsonConvert.DeserializeObject(vanillajson);
                var versions = parsed.versions;
                foreach (var item in versions)
                {
                    if (versionsList.Text == (string)item.id)
                    {
                        modpackname.Content = (string)item.id;
                        mc_version.Content = (string)item.id;
                        forge_version.Content = "false";
                        mods_numb.Content = "0";
                        creation_date.Content = (string)item.releaseTime;
                    }
                }
            }
            else
            {
                var client = new WebClient();
                var values = new NameValueCollection();
                values["target"] = "specific";
                values["name"] = name;

                var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

                var responseString = Encoding.Default.GetString(response);
                foreach (var x in responseString.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var z = x.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                    //DIVIDE LE STRINGHE RESTITUENDO z[0] (il nome della modpack) e z[1] (la descrizione della modpack)
                    if (versionsList.Text == z[0])
                    {
                        JObject jObj = (JObject)JsonConvert.DeserializeObject(z[3]);
                        modpackname.Content = z[0];
                        mc_version.Content = z[4];
                        forge_version.Content = z[2];
                        mods_numb.Content = jObj["libraries"].Count();

                        creation_date.Content = z[5];
                    }
                }
            }
            loading.Visibility = Visibility.Hidden;
        }

        private async void install_Click(object sender, RoutedEventArgs e)
        {
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
            transition.SelectedIndex = 1;
            workingThreadsText.Content = Properties.Settings.Default["download_threads"].ToString();
            modpackName.Content = versionsList.Text;
            var files = await Classes.JSON.GetFiles(name, instanceTextName.Text, mc_version.Content.ToString(), forge_version.Content.ToString(), versionsList.Text);
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
    }
}
