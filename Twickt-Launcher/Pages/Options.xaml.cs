using System;
using System.Collections.Generic;
using System.IO;
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
using System.Windows.Threading;
using Twickt_Launcher.Classes;

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per Options.xaml
    /// </summary>
    public partial class Options : Page
    {
        private static CancellationTokenSource _cancellationTokenSource;
        public static bool optionsrequest = false;
        public Options()
        {
            InitializeComponent();
            Dispatcher.BeginInvoke(DispatcherPriority.Loaded, new Action(() =>
            {
                var navWindow = Window.GetWindow(this) as NavigationWindow;
                if (navWindow != null) navWindow.ShowsNavigationUI = false;
            }));

            for (int i = 1; i <= 30; i++)
            {
                downloadThreads.Items.Add(i.ToString());
            }

            startingPageValue.Items.Add("Home");
            startingPageValue.Items.Add("Modpacks");

            if(Classes.ComputerInfoDetect.GetComputerArchitecture() == 32)
            {
                ram.Items.Add("1.5");
            }
            else
            {
                ram.Items.Add("1");
                ram.Items.Add("2");
                ram.Items.Add("3");
                ram.Items.Add("4");
                ram.Items.Add("5");
                ram.Items.Add("6");
                ram.Items.Add("7");
                ram.Items.Add("8");
            }

        }

        private void Page_Loaded(object sender, RoutedEventArgs e)
        {
            downloadThreads.SelectedValue = Properties.Settings.Default["download_threads"];
            autoCheckForUpdates.IsChecked = (bool)Properties.Settings.Default["autoCheckForUpdates"];
            autoUpdate.IsChecked = (bool)Properties.Settings.Default["autoUpdate"];
            startingPageValue.SelectedValue  = Properties.Settings.Default["startingPage"];
            JavaPath.Text = ComputerInfoDetect.GetJavaInstallationPath();
            ConsoleMaxLines.Text = Properties.Settings.Default["DebugMaxLines"].ToString();
            ram.SelectedValue = Properties.Settings.Default["RAM"];
        }

        private async void checkUpdatesNow_Click(object sender, RoutedEventArgs e)
        {
            optionsrequest = true;
            string update = await AutoUpdater.CheckVersion();
            await AutoUpdater.Download(update);
            optionsrequest = false;
        }

        private async void OPsucc(string message)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.OptionsUpdates(message), "RootDialog", ExtendedOpenedEventHandler, ExtendedClosingEventHandler);
        }
        private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            _cancellationTokenSource = new CancellationTokenSource();
            try
            {
                await Task.Delay(900, _cancellationTokenSource.Token);
                eventArgs.Session.Close();
            }
            catch (TaskCanceledException)
            {
                /*cancelled by user...tidy up and dont close as will have already closed */
            }
        }

        private void ExtendedClosingEventHandler(object sender, MaterialDesignThemes.Wpf.DialogClosingEventArgs eventArgs)
        {

        }

        private async void save_Click(object sender, RoutedEventArgs e)
        {
            do
            {
                if (JavaPath.Text.Substring(JavaPath.Text.Length - 1) == "\\")
                {
                    JavaPath.Text = JavaPath.Text.Substring(0, JavaPath.Text.Length - 1) + "";
                }
            }
            while (JavaPath.Text.Substring(JavaPath.Text.Length - 1) == "\\");

            if (!File.Exists(JavaPath.Text + "\\bin\\java.exe"))
            {
                var error = new Dialogs.OptionsUpdates("Java Path is wrong. Check it matches the example!");
                await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                return;
            }
            int value;
            if (!int.TryParse(ConsoleMaxLines.Text, out value))
            {
                var error = new Dialogs.OptionsUpdates("Max Lines must be a number!");
                await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
                return;
            }
            Properties.Settings.Default["download_threads"] = downloadThreads.SelectedValue;
            Properties.Settings.Default["autoCheckForUpdates"] = autoCheckForUpdates.IsChecked;
            Properties.Settings.Default["autoUpdate"] = autoUpdate.IsChecked;
            Properties.Settings.Default["startingPage"] = startingPageValue.SelectedValue;
            Properties.Settings.Default["JavaPath"] = JavaPath.Text;
            Properties.Settings.Default["DebugMaxLines"] = ConsoleMaxLines.Text;
            Properties.Settings.Default["RAM"] = ram.SelectedValue;
            Properties.Settings.Default.Save();

            OPsucc("Options Updated Succesfully");
        }

        private static async void erroropenEvent(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                await Task.Delay(1200);
                eventArgs.Session.Close();
            }
            catch (TaskCanceledException)
            { }
            catch
            { }
        }
    }
}
