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
			transitioner.SelectedIndex = 0;
		}

		private void graphics_Click(object sender, RoutedEventArgs e)
		{
			transitioner.SelectedIndex = 1;

		}

		private void preferences_Click(object sender, RoutedEventArgs e)
		{
			transitioner.SelectedIndex = 2;

		}

		private void others_Click(object sender, RoutedEventArgs e)
		{
			transitioner.SelectedIndex = 3;

		}
	}
}
