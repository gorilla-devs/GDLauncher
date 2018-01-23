using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace GDLauncher.Windows
{
    /// <summary>
    /// Interaction logic for ServerManager.xaml
    /// </summary>
    public partial class ServerManager : Window
    {
        public string Dir;
        bool started = false;
        public Process process;
        public static ServerManager singleton;
        public string data;
        public ServerManager(string serverName)
        {
            InitializeComponent();
            this.Title = Path.GetFileName(serverName) + " Manager";
            headerTitle.Content = Path.GetFileName(serverName) + " Manager";
            singleton = this;
            this.Dir = serverName;

            System.Windows.Threading.DispatcherTimer timer = new System.Windows.Threading.DispatcherTimer();
            timer.Interval = new TimeSpan(0, 0, 2);
            timer.Tick += ((sender, e) =>
            {
                console.Height += 10;

                if (_scrollViewer.VerticalOffset == _scrollViewer.ScrollableHeight)
                {
                    _scrollViewer.ScrollToEnd();
                }
            });
            timer.Start();

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
            if(started)
                process.StandardInput.WriteLine("stop");
            Dialogs.ServerList.singleton.started = false;
            this.Close();
        }

        private void Button_Click_4(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private async void start_Click(object sender, RoutedEventArgs e)
        {
            if (!started)
            {
                if (!File.Exists(Dir + "\\eula.txt"))
                    File.WriteAllText(Dir + "\\eula.txt", "eula=true");
                process = new Process();
                process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                process.StartInfo.CreateNoWindow = true;
                process.StartInfo.FileName = Classes.ComputerInfoDetect.GetJavaInstallationPath() + "//bin//java.exe";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.RedirectStandardError = true;
                process.StartInfo.RedirectStandardInput = true;
                process.StartInfo.WorkingDirectory = Dir;
                process.StartInfo.Arguments = "-jar " + Dir + "\\" + "server.jar --nogui";
                process.OutputDataReceived += new DataReceivedEventHandler((s, es) =>
                {
                    if (es.Data != null)
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            console.Text += es.Data.ToString() + "\n";
                        }));

                    }
                });
                process.ErrorDataReceived += new DataReceivedEventHandler((s, es) =>
                {
                    if (es.Data != null)
                    {
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            console.Text += es.Data.ToString() + "\n";
                        }));
                    }
                });
                await Task.Run(() => process.Start());
                started = true;
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                actions.IsEnabled = true;
                start.Content = "STOP";
            }
            else
            {
                process.StandardInput.WriteLine("stop");
                started = false;
                actions.IsEnabled = false;
                start.Content = "START";
            }
        }

        private async void sayCommand_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.Say(), "ServerDialog");
        }

        private async void kick_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.Kick(), "ServerDialog");
        }


        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (started)
                process.StandardInput.WriteLine("stop");
            Dialogs.ServerList.singleton.started = false;
        }

        private void execCustomCommand_Click(object sender, RoutedEventArgs e)
        {
            Windows.ServerManager.singleton.process.StandardInput.WriteLine(customCommandText.Text);
            customCommandText.Text = "";
        }

        private void customCommandText_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.Key.Equals(Key.Return))
            {
                execCustomCommand.RaiseEvent(new RoutedEventArgs(System.Windows.Controls.Primitives.ButtonBase.ClickEvent));
            }
        }

        private async void ban_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.Ban(), "ServerDialog");
        }

        private async void pardon_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.Pardon(), "ServerDialog");

        }

        private async void teleport_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.Teleport(), "ServerDialog");
        }

        private async void gamemode_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.Gamemode(), "ServerDialog");
        }

        private async void giveItem_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.GiveItem(), "ServerDialog");
        }

        private async void op_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.OP(), "ServerDialog");
        }

        private async void DEOP_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Commands.DEOP(), "ServerDialog");
        }

        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            WebClient client = new WebClient();
            data = await client.DownloadStringTaskAsync("http://minecraft-ids.grahamedgecombe.com/items.json");
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.Settings(Dir), "ServerDialog");
        }
    }
}
