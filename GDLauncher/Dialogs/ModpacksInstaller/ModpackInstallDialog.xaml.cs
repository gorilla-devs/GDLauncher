using System;
using System.Collections.Generic;
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
using MaterialDesignThemes.Wpf;
using Newtonsoft.Json;

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for ModpackInstallDialog.xaml
    /// </summary>
    public partial class ModpackInstallDialog : UserControl
    {
        public int projectId { get; set; }
        public ModpackInstallDialog(int ProjectId)
        {
            InitializeComponent();
            projectId = ProjectId;
        }

        private void install_Click(object sender, RoutedEventArgs e)
        {
            DialogHost.CloseDialogCommand.Execute(new
            {
                instanceName = instanceTextName.Text,
                version = versionsList.SelectedValue + ".zip",
            }, this);
            instanceTextName.Text = "";
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
            foreach (var act in await Classes.CurseApis.getVersions(projectId))
            {
                versionsList.Items.Add(new CombItem
                {
                    Text = act.Name.Replace(".zip", "")
                });
            }
        }
    }
}
