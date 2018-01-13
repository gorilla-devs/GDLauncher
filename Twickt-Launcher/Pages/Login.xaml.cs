// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Pagina di login*/
using MaterialDesignThemes.Wpf;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace GDLauncher.Pages
{
    /// <summary>
    /// Logica di interazione per Login.xaml
    /// </summary>
    public partial class Login : Page
    {
        public Login()
        {
            InitializeComponent();
            //Window1.singleton.MenuToggleButton.IsEnabled = false;
            Window1.singleton.popupbox.IsEnabled = false;
            transition.SelectedIndex = 0;
            //language.Text = Thread.CurrentThread.CurrentUICulture.Name;

        }

        private async void button_Click(object sender, RoutedEventArgs e)
        {
            button.IsEnabled = false;
            loading.Visibility = Visibility.Visible;
            if(username.Text == "")
            {
                error.Content = "L'username non puo' essere vuoto";
                error.Visibility = Visibility.Visible;
                loading.Visibility = Visibility.Hidden;
                button.IsEnabled = true;
                return;
            }
            SessionData.username = username.Text;
            SessionData.email = username.Text;
            SessionData.isAdmin = "false";

            //Window1.singleton.MenuToggleButton.IsEnabled = true;
            Window1.singleton.popupbox.IsEnabled = true;
            //Window1.singleton.loggedinName.Text = "Logged in as " + username.Text;
            transition.SelectedIndex = 2;
            await Task.Delay(500);
            if (keepMeIn.IsChecked == true)
            {
                Properties.Settings.Default["RememberUsername"] = username.Text;
                Properties.Settings.Default.Save();
            }
            else
            {
                Properties.Settings.Default["RememberUsername"] = "";
                Properties.Settings.Default.Save();
            }
            Window1.singleton.MainPage.Navigate(new Pages.Home());
            Window1.singleton.NavigationMenu.SelectedIndex = 0;
            loading.Visibility = Visibility.Hidden;
            button.IsEnabled = true;
        }

        private void Page_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key.Equals(Key.Return))
            {
                button.RaiseEvent(new RoutedEventArgs(ButtonBase.ClickEvent));
            }
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await Task.Delay(50);
            username.Focus();
            transition.SelectedIndex = 1;
            if (Properties.Settings.Default["RememberUsername"].ToString() != "")
            {
                username.Text = Properties.Settings.Default["RememberUsername"].ToString();
                keepMeIn.IsChecked = true;
            }

        }
    }
}
