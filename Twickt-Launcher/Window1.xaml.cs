// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher


/*Classe di entrata del programma*/
using System;
using System.Windows;
using System.Globalization;
using System.Resources;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Navigation;
using System.Windows.Threading;

namespace Twickt_Launcher
{
    /// <summary>
    /// Logica di interazione per Window1.xaml
    /// </summary>
    public partial class Window1 : Window
    {
        public static Window1 singleton;
        public bool started = false;
        public static bool versionok = true;
        public Window1()
        {
            InitializeComponent();
            Dispatcher.BeginInvoke(DispatcherPriority.Loaded, new Action(() =>
            {
                var navWindow = Window.GetWindow(this) as NavigationWindow;
                if (navWindow != null) navWindow.ShowsNavigationUI = false;
            }));
            singleton = this;
        }
        private void button_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UIElement_OnPreviewMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            MenuToggleButton.IsChecked = false;
        }

        private void Home_Selected(object sender, RoutedEventArgs e)
        {
        }

        private void Options_Selected(object sender, RoutedEventArgs e)
        {
        }

        private void ColorZone_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                DragMove();
            }
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        private void NavigationMenu_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (started == true)
            {
                switch (NavigationMenu.SelectedItem.ToString())
                {
                    case "System.Windows.Controls.ListBoxItem: Home":
                        MainPage.Navigate(new Pages.Home());
                        break;
                    case "System.Windows.Controls.ListBoxItem: Options":
                        MainPage.Navigate(new Pages.Options());
                        break;
                    case "System.Windows.Controls.ListBoxItem: Debug":
                        MainPage.Navigate(new Pages.Debug());
                        break;
                    case "System.Windows.Controls.ListBoxItem: Installed Modpacks":
                        MainPage.Navigate(new Pages.Modpacks());
                        break;
                    case "System.Windows.Controls.ListBoxItem: Modpacks Market":
                        MainPage.Navigate(new Pages.ModpacksMarket());
                        break;
                    case "System.Windows.Controls.ListBoxItem: Commands":
                        MainPage.Navigate(new Pages.Commands());
                        break;
                    case "System.Windows.Controls.ListBoxItem: Report a bug":
                        MainPage.Navigate(new Pages.Report_Bug());
                        break;
                }
            }
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            MainPage.Navigate(new Pages.SplashScreen());
        }

        private void Button_Click_2(object sender, RoutedEventArgs e)
        {
            Windows.DebugOutputConsole debugconsole = new Windows.DebugOutputConsole();
            debugconsole.Show();
        }

        private void Button_Click_3(object sender, RoutedEventArgs e)
        {
            Properties.Settings.Default["Sessiondata"] = "";
            Properties.Settings.Default.Save();
            MainPage.Navigate(new Pages.Login());
            loggedinName.Text = "";
        }

        private void Button_Click_4(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private void Button_Click_5(object sender, RoutedEventArgs e)
        {
            string filePath = config.M_F_P;

            // combine the arguments together
            // it doesn't matter if there is a space after ','
            string argument = "/select, \"" + filePath + "\"";

            System.Diagnostics.Process.Start("explorer.exe", argument);
        }

        private void Button_Click_6(object sender, RoutedEventArgs e)
        {
            MainPage.Navigate(new Pages.Home());
        }
    }
}
