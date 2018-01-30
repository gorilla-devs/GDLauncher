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
using System.Timers;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.IO;
using System.Collections.Generic;

namespace GDLauncher
{
    /// <summary>
    /// Logica di interazione per Window1.xaml
    /// </summary>
    public partial class Window1 : Window
    {
        public static Window1 singleton;
        public bool started = false;
        public static bool versionok = true;
        public Windows.DebugOutputConsole debugconsole = new Windows.DebugOutputConsole();
        public Window1()
        {
            InitializeComponent();
            singleton = this;
            MainPage.JournalOwnership = JournalOwnership.OwnsJournal;
            MainPage.Navigated += new NavigatedEventHandler(NavigationService_Navigated);
            Timer myTimer = new Timer();
            myTimer.Elapsed += new ElapsedEventHandler(DisplayTimeEvent);
            myTimer.Interval = 5000; // 1000 ms is one second
            myTimer.Start();
        }

        public void DisplayTimeEvent(object source, ElapsedEventArgs e)
        {
            try
            {
                using (var client = new System.Net.WebClient())
                {
                    using (var stream = client.OpenRead("https://www.google.com"))
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            internetDisabled.Visibility = Visibility.Hidden;
                        }));
                    }
                }
            }
            catch(Exception)
            {
                Application.Current.Dispatcher.Invoke(new Action(() =>
                {
                    internetDisabled.Visibility = Visibility.Visible;
                }));
            }
        }

        private void button_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UIElement_OnPreviewMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            //MenuToggleButton.IsChecked = false;
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

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            MainPage.Navigate(new Pages.SplashScreen());
        }

        private void Button_Click_2(object sender, RoutedEventArgs e)
        {
            debugconsole.Show();
        }

        private void Button_Click_3(object sender, RoutedEventArgs e)
        {
            Window1.singleton.offlineMode.Visibility = Visibility.Hidden;
            Properties.Settings.Default.premiumaAccessToken = "";
            Properties.Settings.Default.RememberUsername = "";
            Properties.Settings.Default.premiumUUID = "";
            Properties.Settings.Default.premiumUsername = "";
            Properties.Settings.Default.Save();
            settings.IsEnabled = false;
            server.IsEnabled = false;
            logout.IsEnabled = false;

            MainPage.Navigate(new Pages.Login());
        }

        private void Button_Click_4(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private async void Button_Click_5(object sender, RoutedEventArgs e)
        {
            string filePath = config.M_F_P;

            // combine the arguments together
            // it doesn't matter if there is a space after ','
            string argument = "/select, \"" + filePath + "\"";
            await Task.Run(() => {
                System.Diagnostics.Process.Start("explorer.exe", argument);
            });
        }

        private void Button_Click_6(object sender, RoutedEventArgs e)
        {
            MainPage.Navigate(new Pages.Home());
        }

        private void Window_Closed(object sender, EventArgs e)
        {
            Application.Current.Shutdown();
        }

        private async void Button_Click_7(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Options(), "RootDialog");
        }

        private void NavigationService_Navigated(object sender, NavigationEventArgs e)
        {
            MainPage.RemoveBackEntry();
        }

        private async void server_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(Pages.Home.singleton.serverList, "RootDialog");

        }

        private void consoleBtn_Click(object sender, RoutedEventArgs e)
        {
            debugconsole.Show();

        }

        private async void parse_Click(object sender, RoutedEventArgs e)
        {
             await Task.Run(() => {
                var file = File.ReadAllText("complete.json");
                 List<string> lista = new List<string>();
                dynamic x = JsonConvert.DeserializeObject(file);
                 foreach(var y in x["data"])
                 {
                     lista.Add(y["Name"].ToString());
                 }
                 x = null;
                 foreach(var aa in lista)
                    Console.WriteLine(aa);
            });
        }
    }
}
