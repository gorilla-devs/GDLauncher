using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
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
    /// Logica di interazione per UpdateAvailable.xaml
    /// </summary>
    public partial class UpdateAvailable : UserControl
    {
        private CancellationTokenSource _cancellationTokenSource;


        public UpdateAvailable(string actualVersion, string newVersion)
        {
            InitializeComponent();
            updateVersion.Content = actualVersion + " -> " + newVersion;
        }
    }
}
