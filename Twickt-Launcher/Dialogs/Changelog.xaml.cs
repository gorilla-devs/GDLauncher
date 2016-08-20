using System;
using System.Collections.Generic;
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
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Twickt_Launcher.Dialogs
{
    /// <summary>
    /// Interaction logic for Changelog.xaml
    /// </summary>
    public partial class Changelog : UserControl
    {
        public Changelog()
        {
            InitializeComponent();
            Task.Factory.StartNew(() => loadChangelog()).Wait();
            //for(qualcosa)
            //crea una nuova card

        }
        public static async Task loadChangelog()
        {
            string data = "";
            WebClient c = new WebClient();
            c.DownloadStringCompleted += (s, ex) =>
            {
                try
                {
                    data = ex.Result;
                }
                catch
                {
                    MessageBox.Show("Non e' stato possibile scaricare il changelogs");
                }
            };
            /*changelogs.Text = "Loading...";
            changelogs.FontSize = 32;
            changelogs.FontSize = 12;*/
            if (SessionData.changelog == "")
            {
                await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "/changelog.html"));
                SessionData.changelog = data;
                //changelogs.Text = data;
            }
            else
            {
                //changelogs.Text = SessionData.changelog;
            }
        }
    }
}
