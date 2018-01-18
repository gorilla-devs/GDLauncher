using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
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

namespace GDLauncher.Dialogs.Server
{
    /// <summary>
    /// Interaction logic for AddNewServer.xaml
    /// </summary>
    public partial class AddNewServer : UserControl
    {
        WebClient client = new WebClient();

        public AddNewServer()
        {
            InitializeComponent();
            DialogHostExtensions.SetCloseOnClickAway(this, true);
        }

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            var client = new WebClient();
            string versionsJson;
            versionsJson = await client.DownloadStringTaskAsync("https://launchermeta.mojang.com/mc/game/version_manifest.json");
            dynamic parsed = JsonConvert.DeserializeObject(versionsJson);
            var versions = parsed.versions;
            foreach (var item in versions)
            {
                if (!Regex.IsMatch((string)item.id, "[a-z]") && ((string)item.id != "1.0") && ((string)item.id != "1.1"))
                {
                    MCversions.Items.Add((string)item.id);
                }
            }
            MCversions.SelectedIndex = 0;
        }

        private async void createServerBtn_Click(object sender, RoutedEventArgs e)
        {
            if (serverName.Text == "")
                return;
            if (!Directory.Exists(config.M_F_P + "Servers\\" + serverName.Text + "\\"))
            {
                Directory.CreateDirectory(config.M_F_P + "Servers\\" + serverName.Text + "\\");
            }
            client.DownloadProgressChanged += (s, es) =>
            {
                progress.Value = es.ProgressPercentage;
            };
            DialogHostExtensions.SetCloseOnClickAway(this, false);
            createServerBtn.IsEnabled = false;
            progress.Visibility = Visibility.Visible;

            try
            {
                await client.DownloadFileTaskAsync("https://s3.amazonaws.com/Minecraft.Download/versions/" + MCversions.SelectedValue.ToString() + "/minecraft_server." + MCversions.SelectedValue.ToString() + ".jar", config.M_F_P + "Servers\\" + serverName.Text + "\\server.jar");
            }
            catch (WebException) { }

            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
        }

        private async void backBtn_Click(object sender, RoutedEventArgs e)
        {
            if (client.IsBusy)
            {
                client.CancelAsync();
            }
            await Task.Delay(500);
            Directory.Delete(config.M_F_P + "Servers\\" + serverName.Text, true);
        }
    }
}
