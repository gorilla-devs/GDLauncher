using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
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
using MaterialDesignThemes.Wpf;
using Newtonsoft.Json;

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for VanillaInstallDialog.xaml
    /// </summary>
    public partial class VanillaInstallDialog : UserControl
    {
        public static string vanillajson;
        public VanillaInstallDialog()
        {
            InitializeComponent();
            DialogHostExtensions.SetCloseOnClickAway(this, true);
        }

        public async Task LoadPackData()
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

        private void install_Click(object sender, RoutedEventArgs e)
        {
            DialogHost.CloseDialogCommand.Execute(new
            {
                instanceName = instanceTextName.Text,
                MCVersion = versionsList.SelectedValue.ToString()
            }, this);
            DialogHostExtensions.SetCloseOnClickAway(this, false);
        }

        private async void versionsList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            await Task.Delay(100);
            dynamic parsed = JsonConvert.DeserializeObject(vanillajson);
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

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadPackData();
        }
    }
}
