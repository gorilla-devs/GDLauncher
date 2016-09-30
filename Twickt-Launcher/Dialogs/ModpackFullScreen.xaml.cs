/*Pagina delle informazioni riguardanti i pacchetti*/

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
    /// Logica di interazione per ModpackFullScreen.xaml
    /// </summary>
    public partial class ModpackFullScreen : UserControl
    {
        public ModpackFullScreen(string modpackName, bool mods = false)
        {
            InitializeComponent();
            if(mods == true)
            {
                modpackstypeselection.SelectedIndex = 1;
            }
            modpackNameLabel.Content = modpackName;
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            if(modpackstypeselection.SelectedIndex == 1)
            {
                ListBox modslist = new ListBox();
                Main.Children.Add(modslist);
            }
        }
    }
}
