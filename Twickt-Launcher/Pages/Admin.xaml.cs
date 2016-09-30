// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Pagina solo per gli admin*/
using System;
using System.Collections.Generic;
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

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per Admin.xaml
    /// </summary>
    public partial class Admin : Page
    {
        public Admin()
        {
            InitializeComponent();
            if (Properties.Settings.Default["disableHashCheck"].ToString() == "false")
                disableHashCheck.IsChecked = false;
            else
                disableHashCheck.IsChecked = true;

        }

        private void save_Click(object sender, RoutedEventArgs e)
        {
            if(disableHashCheck.IsChecked == true)
            {
                Properties.Settings.Default["disableHashCheck"] = "true";
                Properties.Settings.Default.Save();
            }
            else
            {
                Properties.Settings.Default["disableHashCheck"] = "false";
                Properties.Settings.Default.Save();
            }
            if(forgeVersion.Text != "")
            {
                config.forgeversion = forgeVersion.Text;
            }
            if (resetoptions.IsChecked == true)
            {
                Properties.Settings.Default["download_threads"] = "4";
                Properties.Settings.Default["autoCheckForUpdates"] = true;
                Properties.Settings.Default["autoUpdate"] = false;
                Properties.Settings.Default["startingPage"] = "Home";
                Properties.Settings.Default["JavaPath"] = "Empty";
                Properties.Settings.Default["DebugMaxLines"] = "30";
                Properties.Settings.Default["RAM"] = "1";
                Properties.Settings.Default["firstTimeHowTo"] = "true";
                Properties.Settings.Default["sessiondata"] = "";
                Properties.Settings.Default["keepMeLoggedIn"] = false;
                Properties.Settings.Default.Save();
            }

        }

        private void button_Click(object sender, RoutedEventArgs e)
        {

        }

        private void resetoptions_Checked(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Dopo il salvataggio bisogna riavviare il launcher altrimenti crasha");
        }
    }
}
