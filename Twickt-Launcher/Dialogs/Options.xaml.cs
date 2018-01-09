using MaterialDesignThemes.Wpf;
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

namespace Twickt_Launcher.Dialogs
{
    /// <summary>
    /// Logica di interazione per Options.xaml
    /// </summary>
    public partial class Options : UserControl
    {
        public Options()
        {
            InitializeComponent();
        }

		private void general_Click(object sender, RoutedEventArgs e)
		{
            general.IsEnabled = false;
            graphics.IsEnabled = true;
            preferences.IsEnabled = true;
            others.IsEnabled = true;
			transitioner.SelectedIndex = 0;
		}

		private void graphics_Click(object sender, RoutedEventArgs e)
		{
            general.IsEnabled = true;
            graphics.IsEnabled = false;
            preferences.IsEnabled = true;
            others.IsEnabled = true;
            transitioner.SelectedIndex = 1;

		}

		private void preferences_Click(object sender, RoutedEventArgs e)
		{
            general.IsEnabled = true;
            graphics.IsEnabled = true;
            preferences.IsEnabled = false;
            others.IsEnabled = true;
            transitioner.SelectedIndex = 2;

		}

		private void others_Click(object sender, RoutedEventArgs e)
		{
            general.IsEnabled = true;
            graphics.IsEnabled = true;
            preferences.IsEnabled = true;
            others.IsEnabled = false;
            transitioner.SelectedIndex = 3;

		}

        private void closeDialog_Click(object sender, RoutedEventArgs e)
        {
            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            for (int i = 1; i <= 30; i++)
            {
                downloadThreads.Items.Add(i.ToString());
            }
            if (Classes.ComputerInfoDetect.GetComputerArchitecture() == 32)
            {
                ram.Items.Add("1.5");
            }
            else
            {
                ram.Items.Add("1");
                ram.Items.Add("2");
                ram.Items.Add("3");
                ram.Items.Add("4");
                ram.Items.Add("5");
                ram.Items.Add("6");
                ram.Items.Add("7");
                ram.Items.Add("8");
            }


            versionINFO.Content = Properties.Settings.Default.version;
            downloadThreads.SelectedValue = Properties.Settings.Default["download_threads"];
            ram.SelectedValue = Properties.Settings.Default["RAM"];
            JavaPath.Text = Classes.ComputerInfoDetect.GetJavaInstallationPath();
            downloadThreads.SelectionChanged += downloadThreads_SelectionChanged;
            ram.SelectionChanged += ram_SelectionChanged;


        }

        private void downloadThreads_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            Properties.Settings.Default["download_threads"] = downloadThreads.SelectedValue;
            Properties.Settings.Default.Save();
            saved("Parallel Downloads Saved: " + Properties.Settings.Default["download_threads"]);
        }

        private async void saved(string message)
        {
            snackbarSave.Message = new MaterialDesignThemes.Wpf.SnackbarMessage
            {
                ActionContent = "Yeeah",
                Content = message
            };
            snackbarSave.IsActive = true; 
             await Task.Delay(3000);
            snackbarSave.IsActive = false;
        }

        private void manageMojangAccount_Click(object sender, RoutedEventArgs e)
        {
            transitioner.SelectedIndex = 4;
        }

        private void backToGeneral_Click(object sender, RoutedEventArgs e)
        {
            general.IsEnabled = false;
            graphics.IsEnabled = true;
            preferences.IsEnabled = true;
            others.IsEnabled = true;
            transitioner.SelectedIndex = 0;
        }

        private void mojangLoginBtn_Click(object sender, RoutedEventArgs e)
        {
            if(mojangLoginBtn.Content.ToString() == "Login")
            {
                mojangLoginBtn.Content = "Unlink Account";
                mojangEmail.IsEnabled = false;
                mojangPassword.IsEnabled = false;
            }
            else
            {
                mojangLoginBtn.Content = "Login";
                mojangEmail.IsEnabled = true;
                mojangPassword.IsEnabled = true;
            }
        }

        private void JavaPathFolderBrowser_Click(object sender, RoutedEventArgs e)
        {
            var folderbrowser = new WPFFolderBrowser.WPFFolderBrowserDialog();
            folderbrowser.InitialDirectory = JavaPath.Text;
            var path = folderbrowser.ShowDialog();
            try
            {
                var tempPath = folderbrowser.FileName;
                do
                {
                    if (tempPath.Substring(tempPath.Length - 1) == "\\")
                    {
                        JavaPath.Text = tempPath.Substring(0, tempPath.Length - 1) + "";
                    }
                }
                while (tempPath.Substring(tempPath.Length - 1) == "\\");

                if (!File.Exists(tempPath + "\\bin\\java.exe"))
                {
                    MessageBox.Show("Not a valid path");
                    return;
                }
                JavaPath.Text = tempPath;
                Properties.Settings.Default["JavaPath"] = JavaPath.Text;
                Properties.Settings.Default.Save();
                saved("Java Path Saved");
            }
            catch {}
        }

        private void ram_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            Properties.Settings.Default["RAM"] = ram.SelectedValue;
            Properties.Settings.Default.Save();
            saved("Dedicated RAM Saved: " + Properties.Settings.Default["RAM"]);
        }
    }
}
