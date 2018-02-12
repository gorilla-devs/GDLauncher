using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for DuplicateInstance.xaml
    /// </summary>
    public partial class DuplicateInstance : UserControl
    {
        public string dir;
        public DuplicateInstance(string dir)
        {
            InitializeComponent();
            DialogHostExtensions.SetCloseOnClickAway(this, true);
            this.dir = dir;
            DataContext = new Classes.TextFieldsViewModel();

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

        private async void install_Click(object sender, RoutedEventArgs e)
        {
            DialogHostExtensions.SetCloseOnClickAway(this, false);
            try
            {
                Regex rg = new Regex(@"^[a-zA-Z0-9\s,]*$");
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
                install.IsEnabled = false;
                instanceTextName.IsEnabled = false;
                progress.Visibility = Visibility.Visible;

                string json = File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                jsonObj["instanceName"] = instanceTextName.Text;
                string output = Newtonsoft.Json.JsonConvert.SerializeObject(jsonObj, Newtonsoft.Json.Formatting.Indented);
                File.WriteAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json", output);

                await Task.Delay(300);

                await CopyFilesRecursively(new DirectoryInfo(dir), new DirectoryInfo(config.M_F_P + "Packs\\" + instanceTextName.Text));

                await Task.Delay(300);


                Directory.Move(config.M_F_P + "Packs\\" + instanceTextName.Text + "\\" + new DirectoryInfo(dir).Name + ".json",
                    config.M_F_P + "Packs\\" + instanceTextName.Text + "\\" + instanceTextName.Text + ".json");
            }
            catch(Exception exx)
            {
                MessageBox.Show("Cannot change instance name. Maybe you are using it? " + exx.Message);
            }
            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);


        }

        public async Task CopyFilesRecursively(DirectoryInfo source, DirectoryInfo target)
        {
            foreach (var dir in source.GetDirectories())
                await CopyFilesRecursively(dir, target.CreateSubdirectory(dir.Name));
            foreach (var file in source.GetFiles())
            {
                using (var sourceStream = file.OpenRead())
                {
                    using (var destinationStream = File.Create(System.IO.Path.Combine(target.FullName, file.Name)))
                    {
                        await sourceStream.CopyToAsync(destinationStream);
                    }
                }
            }
        }
    }
}
