// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
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
            string[] temp;
            var client = new WebClient();
            var values = new System.Collections.Specialized.NameValueCollection();
            values["target"] = "generic";

            var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

            var responseString = Encoding.Default.GetString(response);

            if (!responseString.Contains("0results"))
            {
                foreach (var x in responseString.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var z = x.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                    info.Add(z[4]);
                }
            }
            else
            {
                System.Windows.MessageBox.Show(Pages.SplashScreen.singleton.manager.GetString("couldNotGetModpacksList"));
                return null;
            }
            return info.ToArray();
        }

        public static async Task<List<string>> GetModpackInfo(string modpackname)
        {
            List<string> info = new List<string>();

            // Read the file and display it line by line.
            string text = System.IO.File.ReadAllText(config.M_F_P + @"LocalModpacks\" + modpackname.Replace(" ", "_") + "\\" + modpackname.Replace(" ", "_") + ".dat");
            Dictionary<string, string> htmlAttributes = JsonConvert.DeserializeObject<Dictionary<string, string>>(text);
            info.Add(htmlAttributes["version"]);
            info.Add(@"LocalModpacks\" + modpackname.Replace(" ", "_"));
            info.Add(htmlAttributes["forge"]);

            return info;
        }

    }
}
