using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using MaterialDesignThemes.Wpf;
using Newtonsoft.Json;

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for ForgeInstallDialog.xaml
    /// </summary>
    public partial class ForgeInstallDialog : UserControl
    {
        public static List<string> forgeAllVersionsList = new List<string>();

        public ForgeInstallDialog()
        {
            InitializeComponent();
            DialogHostExtensions.SetCloseOnClickAway(this, true);
            instanceTextName.Text = "";

        }

        public async Task LoadPackData()
        {
            loading.Visibility = Visibility.Visible;

            dynamic json = await Task.Run(() => JsonConvert.DeserializeObject(Pages.SplashScreen.singleton.forgeJson));
            forgeVersions.Items.Clear();
            versionsList.Items.Clear();
            foreach (var x in json["promos"])
            {
                if (!versionsList.Items.Contains(json["number"][x.Value.ToString()]["mcversion"]))
                    versionsList.Items.Add(json["number"][x.Value.ToString()]["mcversion"]);
            }
            versionsList.SelectedIndex = 0;
            loading.Visibility = Visibility.Hidden;

        }

        private void versionsList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            loading.Visibility = Visibility.Visible;
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
                catch (Exception)
                {
                }
                forgeVersions.SelectedIndex = 0;
            }
            loading.Visibility = Visibility.Hidden;
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
        private void forgeAllVersions_Checked(object sender, RoutedEventArgs e)
        {
            foreach (var item in forgeAllVersionsList)
            {
                versionsList.Items.Add(item);
            }
            versionsList.SelectedIndex = versionsList.Items.Count - 1;
        }

        private async void forgeAllVersions_Unchecked(object sender, RoutedEventArgs e)
        {
            await LoadPackData();
        }

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            dynamic json = await Task.Run(() => JsonConvert.DeserializeObject(Pages.SplashScreen.singleton.forgeJson));
            foreach (var x in json["number"])
            {
                forgeAllVersionsList.Add(Convert.ToString(x.Value.mcversion));
            }
            forgeAllVersionsList = forgeAllVersionsList.Distinct().ToList();
            await LoadPackData();
            loading.Visibility = Visibility.Hidden;
        }

        private async void install_Click(object sender, RoutedEventArgs e)
        {
            DialogHost.CloseDialogCommand.Execute(new
            {
                instanceName = instanceTextName.Text,
                MCVersion = versionsList.SelectedValue.ToString(),
                forgeVersion = forgeVersions.SelectedValue.ToString()
            }, this);
            /*if (Directory.Exists(config.M_F_P + "Packs\\" + instanceTextName.Text))
            {
                MessageBox.Show("Nome istanza gia' esistente");
                return;
            }
            //ctoken = new CancellationTokenSource();
            string forgeVersion = "false";
            try
            {
                forgeVersion = forgeVersions.SelectedValue.ToString();
            }
            catch { }
            //var files = await JSON.GetFiles("Forge Stock", instanceTextName.Text, versionsList.SelectedValue.ToString(), forgeVersion, versionsList.Text);
            var downloader = new Downloader();
            List<string[]> files = new List<string[]>();
            await downloader.MCDownload(files, instanceTextName.Text, new CancellationToken());*/
        }
    }
}
