using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
using Twickt_Launcher.Classes;

namespace Twickt_Launcher.Dialogs
{
    /// <summary>
    /// Interaction logic for AddLocalModpack.xaml
    /// </summary>
    public partial class AddLocalModpack : UserControl
    {
        public static bool close = false;
        public AddLocalModpack()
        {
            InitializeComponent();
            version.IsEnabled = true;
            name.IsEnabled = true;
            forge.IsEnabled = true;
            add.IsEnabled = true;
        }

        private async void add_Click(object sender, RoutedEventArgs e)
        {
            if (String.IsNullOrEmpty(name.Text) || name.Text.Contains(" "))
            {
                error.Visibility = Visibility.Visible;
                error.Content = "Errore: Nome vuoto oppure contiene spazi";
                return;
            }
            if (Directory.Exists(config.LocalModpacks + name.Text))
            {
                error.Visibility = Visibility.Visible;
                error.Content = "Errore: Esiste gia' una modpack con questo nome";
                return;
            }
            Directory.CreateDirectory(config.LocalModpacks + name.Text);
            version.IsEnabled = false;
            name.IsEnabled = false;
            forge.IsEnabled = false;
            add.IsEnabled = false;
            back.IsEnabled = false;
            Dictionary<string, string> points = new Dictionary<string, string>
            {
                    { "version", version.Text },
                    { "forge", (forge.Text == "Forge" ? "true" : "false") }
            };
            
            string json = JsonConvert.SerializeObject(points, Formatting.Indented);

            using (StreamWriter writer = File.CreateText(config.LocalModpacks + name.Text + "\\" + name.Text + ".dat"))
            {
                await writer.WriteAsync(json);
            }

            try
            {
                Pages.StartingWorking.urls = await ModpackStartupCheck.CheckFiles(name.Text, false);

                Window1.singleton.MainPage.Navigate(new Pages.StartingWorking(false, name.Text));
            }
            catch
            {
                throw;
            }
            back.IsEnabled = true;
            close = true;
        }

        private void name_GotFocus(object sender, RoutedEventArgs e)
        {
            error.Visibility = Visibility.Hidden;
        }
    }
}
