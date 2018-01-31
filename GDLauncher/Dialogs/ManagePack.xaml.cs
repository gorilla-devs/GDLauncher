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
    /// Interaction logic for ManagePack.xaml
    /// </summary>
    public partial class ManagePack : UserControl
    {
        public string dir;
        public ManagePack(string dir)
        {
            InitializeComponent();
            this.dir = dir;
            DataContext = new Classes.TextFieldsViewModel();


        }

        private async void changeInstanceName_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Regex rg = new Regex(@"^[a-zA-Z0-9\s,]*$");
                if (!rg.IsMatch(instanceName.Text) || (instanceName.Text.Contains(" ")))
                {
                    MessageBox.Show("Solo lettere e numero ammessi");
                    return;
                }
                if (Directory.Exists(config.M_F_P + "Packs\\" + instanceName.Text))
                {
                    MessageBox.Show("Nome istanza gia' esistente");
                    return;
                }
                changeInstanceName.IsEnabled = false;
                string json = File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                jsonObj["instanceName"] = instanceName.Text;
                string output = Newtonsoft.Json.JsonConvert.SerializeObject(jsonObj, Newtonsoft.Json.Formatting.Indented);
                File.WriteAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json", output);

                await Task.Delay(300);

                Directory.Move(dir, config.M_F_P + "Packs\\" + instanceName.Text);

                await Task.Delay(300);


                Directory.Move(config.M_F_P + "Packs\\" + instanceName.Text + "\\" + new DirectoryInfo(dir).Name + ".json",
                    config.M_F_P + "Packs\\" + instanceName.Text + "\\" + instanceName.Text + ".json");
            }
            catch
            {
                MessageBox.Show("Cannot change instance name. Maybe you are using it?");
            }


            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
        }

        private void Card_DragEnter(object sender, DragEventArgs e)
        {
            dragInfo.Visibility = Visibility.Hidden;

        }

        private void Card_DragLeave(object sender, DragEventArgs e)
        {
            dragInfo.Visibility = Visibility.Visible;

        }

        private void Card_Drop(object sender, DragEventArgs e)
        {
            dragInfo.Visibility = Visibility.Hidden;
            string[] droppedFiles = null;
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                droppedFiles = e.Data.GetData(DataFormats.FileDrop, true) as string[];
            }

            if ((null == droppedFiles) || (!droppedFiles.Any())) { return; }

            foreach (string s in droppedFiles)
            {
                var label = new Label();
                label.Content = s;
                filesList.Children.Add(label);
            }

                // Assuming you have one file that you care about, pass it off to whatever
                // handling code you have defined.
                //HandleFileOpen(files[0]);
        }

        private void instanceName_TextChanged(object sender, TextChangedEventArgs e)
        {
            try
            {
                if (instanceName.Text != "" && instanceName.Text != new DirectoryInfo(dir).Name && !instanceName.Text.Contains(" ") && !string.IsNullOrEmpty(instanceName.Text))
                    changeInstanceName.IsEnabled = true;
                else
                    changeInstanceName.IsEnabled = false;
            }
            catch { }
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            instanceName.Text = new DirectoryInfo(dir).Name;

        }
    }
}
