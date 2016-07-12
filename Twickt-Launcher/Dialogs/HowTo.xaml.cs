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

namespace Twickt_Launcher.Dialogs
{
    /// <summary>
    /// Interaction logic for HowTo.xaml
    /// </summary>
    public partial class HowTo : Page
    {
        public HowTo()
        {
            InitializeComponent();
        }

        private void button_Click(object sender, RoutedEventArgs e)
        {
            Properties.Settings.Default["firstTimeHowTo"] = "false";
            Properties.Settings.Default.Save();
            Window1.singleton.MainPage.Navigate(new Pages.Home());
            Window1.singleton.NavigationMenu.SelectedIndex = 0;
        }
    }
}
