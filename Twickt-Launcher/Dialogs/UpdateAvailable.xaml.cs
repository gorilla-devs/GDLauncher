// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher


/*Finestra di aggiornamento del launcher*/
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

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Logica di interazione per UpdateAvailable.xaml
    /// </summary>
    public partial class UpdateAvailable : UserControl
    {
        private CancellationTokenSource _cancellationTokenSource;


        public UpdateAvailable(string actualVersion, string newVersion, string message = "Do you want to update?")
        {
            InitializeComponent();
            updateVersion.Content = actualVersion + " -> " + newVersion;
            label1.Content = message;
        }
    }
}
