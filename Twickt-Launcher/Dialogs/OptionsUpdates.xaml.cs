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
    /// Logica di interazione per OptionsUpdates.xaml
    /// </summary>
    public partial class OptionsUpdates : UserControl
    {
        public OptionsUpdates(string message, int width = 248, int height = 57)
        {
            InitializeComponent();
            label.Content = message;
            this.Width = width;
            this.Height = height;
            label.Height = height - 18;
            label.Width = width - 18;
        }
    }
}
