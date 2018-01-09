// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Console di debug*/
using System;
using System.Collections.Generic;
using System.IO;
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
using System.Windows.Shapes;

namespace Twickt_Launcher.Windows
{
    /// <summary>
    /// Logica di interazione per DebugOutputConsole.xaml
    /// </summary>
    public partial class DebugOutputConsole : Window
    {
        public static DebugOutputConsole singleton;
        bool _shown;
        public static string consoleText = "";
        public DebugOutputConsole()
        {
            InitializeComponent();
            singleton = this;
            if(SessionData.isAdmin == "true")
            {
                button3.Visibility = Visibility.Visible;
            }
            else
            {
                button3.Visibility = Visibility.Hidden;
            }

            
        }

        public async void Write(string message)
        {
            await Task.Run(() =>
            {
                Application.Current.Dispatcher.Invoke(new Action(() =>
                {
                    int lines;
                    if (Int32.TryParse(Properties.Settings.Default["DebugMaxLines"].ToString(), out lines))
                    {

                        while (debug.LineCount > lines)
                        {
                            debug.SelectionStart = 0;
                            debug.SelectionLength = debug.Text.IndexOf("\n", 0) + 1;
                            debug.SelectedText = "";
                        }
                    }
                    consoleText += ("[" + DateTime.Now.ToString("dd-MM-yyyy hh:mm:ss") + "] " + message + "\n\r");
                    debug.Text += ("[" + DateTime.Now.ToString("dd-MM-yyyy hh:mm:ss") + "] " + message + "\n\r");
                    debug.CaretIndex = debug.Text.Length;
                }));
            });
        }

        protected override void OnContentRendered(EventArgs e)
        {
            base.OnContentRendered(e);

            if (_shown)
                return;

            _shown = true;

            debug.Text = consoleText;
        }

        private void button_Click(object sender, RoutedEventArgs e)
        {
            File.WriteAllText(config.logfile, consoleText);
        }

        private void button3_Click(object sender, RoutedEventArgs e)
        {
            //Window1.singleton.MainPage.Navigate(new Pages.Admin());
            //Window1.singleton.MenuToggleButton.IsEnabled = true;
        }

        private void button1_Click(object sender, RoutedEventArgs e)
        {
            Clipboard.SetText(debug.Text);
            MessageBox.Show("Copied to clipboard");
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
                e.Cancel = true;
                Visibility = Visibility.Hidden;
        }
    }
}
