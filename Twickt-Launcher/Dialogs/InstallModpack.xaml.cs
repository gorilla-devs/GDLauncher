using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
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
    /// Logica di interazione per InstallModpack.xaml
    /// </summary>
    public partial class InstallModpack : UserControl
    {
        static string name;
        public InstallModpack(string modpackname)
        {
            InitializeComponent();
            name = modpackname;
            var client = new WebClient();
            var values = new NameValueCollection();
            values["target"] = "specific";
            values["name"] = name;

            var response = client.UploadValues(config.modpacksWebService, values);

            var responseString = Encoding.Default.GetString(response);
            foreach (var x in responseString.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries))
            {
                var z = x.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                //DIVIDE LE STRINGHE RESTITUENDO z[0] (il nome della modpack) e z[1] (la descrizione della modpack)
                versionsList.Items.Add(z[0]);
            }
        }

        private async void versionsList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var client = new WebClient();
            var values = new NameValueCollection();
            values["target"] = "specific";
            values["name"] = name;

            var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

            var responseString = Encoding.Default.GetString(response);
            foreach (var x in responseString.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries))
            {
                var z = x.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                //DIVIDE LE STRINGHE RESTITUENDO z[0] (il nome della modpack) e z[1] (la descrizione della modpack)
                if(versionsList.Text == z[0])
                {
                    JObject jObj = (JObject)JsonConvert.DeserializeObject(z[3]);
                    modpackname.Content = z[0];
                    mc_version.Content = z[4];
                    forge_version.Content = z[2];
                    mods_numb.Content = jObj["libraries"].Count();
                    creation_date.Content = z[5];
                }
            }
        }

        private async void install_Click(object sender, RoutedEventArgs e)
        {
            var urls = await Classes.RemoteModpacks.GetModpacksFiles("BrotherHood Of Heroes"); //BISOGNA METTERE LA VERSIONE DELLA MODPACK
            foreach (var url in urls)
            {
                MessageBox.Show(url[0]);
            }
        }
    }
}
