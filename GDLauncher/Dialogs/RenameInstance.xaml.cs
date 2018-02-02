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
    /// Interaction logic for RenameInstance.xaml
    /// </summary>
    public partial class RenameInstance : UserControl
    {
        public string Dir;

        public RenameInstance(string dir)
        {
            InitializeComponent();
            DialogHostExtensions.SetCloseOnClickAway(this, true);
            this.Dir = dir;
            DataContext = new Classes.TextFieldsViewModel();
        }

        private async void rename_Click(object sender, RoutedEventArgs e)
        {
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

                rename.IsEnabled = false;
                instanceTextName.IsEnabled = false;
                progress.Visibility = Visibility.Visible;

                string json = File.ReadAllText(Dir + "\\" + new DirectoryInfo(Dir).Name + ".json");
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                jsonObj["instanceName"] = instanceTextName.Text;
                string output =
                    Newtonsoft.Json.JsonConvert.SerializeObject(jsonObj, Newtonsoft.Json.Formatting.Indented);
                File.WriteAllText(Dir + "\\" + new DirectoryInfo(Dir).Name + ".json", output);

                await Task.Delay(300);

                Directory.Move(Dir, config.M_F_P + "Packs\\" + instanceTextName.Text);

                await Task.Delay(300);


                Directory.Move(
                    config.M_F_P + "Packs\\" + instanceTextName.Text + "\\" + new DirectoryInfo(Dir).Name + ".json",
                    config.M_F_P + "Packs\\" + instanceTextName.Text + "\\" + instanceTextName.Text + ".json");
            }
            catch
            {
                MessageBox.Show("Cannot change instance name. Maybe you are using it?");
            }


            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
        }


        private void rename_TextChanged(object sender, TextChangedEventArgs e)
        {
            try
            {
                Regex rg = new Regex(@"^[a-zA-Z0-9\s,]*$");

                if (instanceTextName.Text != "" && !instanceTextName.Text.Contains(" ") && !string.IsNullOrEmpty(instanceTextName.Text) && rg.IsMatch(instanceTextName.Text))
                    rename.IsEnabled = true;
                else
                    rename.IsEnabled = false;
            }
            catch { }
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            instanceTextName.Text = new DirectoryInfo(Dir).Name;

        }
    }
}
