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

        }
    }
}
