using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Twickt_Launcher.Classes
{
    class LocalModpacks
    {
        public static async Task<string[]> GetModpacksDirectoryList()
        {
            List<string> info = new List<string>();
            /*
             * Serve
             * -la versione
             * l'url del json
             * 
             * */
            WebClient c = new WebClient();
            string data = "";
            c.DownloadStringCompleted += (sender, e) =>
            {
                data = e.Result;
            };
            await c.DownloadStringTaskAsync(new Uri(config.updateWebsite + "Modpacks.json"));
            dynamic json = JsonConvert.DeserializeObject(data);
            foreach (var item in json["Modpacks"])
            {
                var directory = (string)item["directory"];
                info.Add(directory);
            }
            return info.ToArray();
        }

    }
}
