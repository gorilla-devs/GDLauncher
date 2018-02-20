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
using System.ComponentModel;
using System.IO;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using GDLauncher.Classes;
using MaterialDesignThemes.Wpf;
using Microsoft.WindowsAPICodePack.Taskbar;

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for InstallDialog.xaml
    /// </summary>
    public partial class InstallDialog : UserControl
    {
        public string instanceName;
        public string MCVersion;
        public string forgeVersion;
        public string modpackName = "";
        public string modpackVersion = "";
        public List<string> additionalMods = null;
        public static CancellationTokenSource ctoken;

        MinecraftDownloader downloader = new MinecraftDownloader();
        public InstallDialog(string instanceName, string MCVersion, string forgeVersion = null, string modpackName = null, string modpackVersion = null, List<string> additionalMods = null)
        {
            InitializeComponent();
            DataContext = downloader;
            this.instanceName = instanceName;
            this.MCVersion = MCVersion;
            this.forgeVersion = forgeVersion;
            this.modpackName = modpackName;
            this.modpackVersion = modpackVersion;
            this.additionalMods = additionalMods;
            DialogHostExtensions.SetCloseOnClickAway(this, false);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        private void OnPropertyChanged(string info)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(info));
        }

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            ctoken = new CancellationTokenSource();
            await downloader.MCDownload(instanceName, MCVersion, forgeVersion, ctoken.Token, modpackName, modpackVersion, additionalMods);
            DialogHost.CloseDialogCommand.Execute(this, this);

        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            await Task.Run(() => ctoken.Cancel());

            await Task.Run(() => Application.Current.Dispatcher.Invoke(new Action(() =>
            {
                try
                {
                    Directory.Delete(config.M_F_P + "Packs\\" + instanceName, true);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.InnerException);
                }
            })));
            TaskbarManager.Instance.SetProgressState(TaskbarProgressBarState.NoProgress);
            DialogHost.CloseDialogCommand.Execute("Cancelled", this);
        }
    }
}
