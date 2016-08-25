// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
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
    /// Logica di interazione per AddPack.xaml
    /// </summary>
    public partial class AddPack : UserControl
    {
        public static bool close = false;
        public AddPack()
        {
            InitializeComponent();
        }

        private void add_Click(object sender, RoutedEventArgs e)
        {
            if(String.IsNullOrEmpty(code.Text))
            {
                error.Visibility = Visibility.Visible;
                error.Content = "Codice vuoto";
                return;
            }
        }

        private void code_GotFocus(object sender, RoutedEventArgs e)
        {
            error.Visibility = Visibility.Hidden;
        }
    }
}
