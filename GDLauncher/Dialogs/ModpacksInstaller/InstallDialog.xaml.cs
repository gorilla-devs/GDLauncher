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
using System.Runtime.CompilerServices;
using System.Threading;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using GDLauncher.Classes;
using MaterialDesignThemes.Wpf;

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
        public static CancellationTokenSource ctoken;

        MinecraftDownloader downloader = new MinecraftDownloader();
        public InstallDialog(string instanceName, string MCVersion, string forgeVersion = null)
        {
            InitializeComponent();
            DataContext = downloader;
            this.instanceName = instanceName;
            this.MCVersion = MCVersion;
            this.forgeVersion = forgeVersion;
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
            await downloader.MCDownload(instanceName, MCVersion, forgeVersion, ctoken.Token);
            DialogHost.CloseDialogCommand.Execute(this, this);

        }
    }
}
