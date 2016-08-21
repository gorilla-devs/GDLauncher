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
            
        }
        public static async Task loadChangelog()
        {
            if (SessionData.changelog == "")
            {
                var client = new WebClient();
                var values = new System.Collections.Specialized.NameValueCollection();

                var response = await client.UploadValuesTaskAsync(config.changelogsWebService, values);

                var responseString = Encoding.Default.GetString(response);

                if (!responseString.Contains("0results"))
                {
                    SessionData.changelog = responseString;
                }
                else
                {
                    MessageBox.Show("Error getting modpacks");
                }
            }
        }

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            await loadChangelog();
            var rows = SessionData.changelog.Split(new string[] { "<<<<|||;;;|||>>>>" }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var row in rows)
            {
                var x = new MaterialDesignThemes.Wpf.Card();
                x.Margin = new Thickness(5);
                x.Width = 400;
                container.Children.Add(x);
                var insiderStackPanel = new StackPanel();
                var title = new Label();
                title.FontSize = 17;
                var content = new TextBlock();
                content.TextWrapping = TextWrapping.Wrap;
                content.Margin = new Thickness(5);
                var segment = row.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries);
                title.Content = segment[0];
                var lines = segment[1].Split(new string[] { "<<|;|>>" }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    content.Text += line;
                }
                insiderStackPanel.Children.Add(title);
                insiderStackPanel.Children.Add(content);
                x.Content = insiderStackPanel;
            }
        }
    }
}
