// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Gestisce il download delle mods dei pacchetti*/
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace Twickt_Launcher.Classes
{
    class RemoteModpacks
    {
        public static Dictionary<string, string> description = new Dictionary<string, string>();
        public static async Task<string> GetModpacksList(string type)
        {
            var result = await Task.Run(() => RefreshRemote(type));
            //Window1.singleton.MenuToggleButton.IsChecked = false;
            return result;
        }

        private static async Task<string> RefreshRemote(string type)
        {
            try
            {
                var client = new WebClient();
                var values = new System.Collections.Specialized.NameValueCollection();
                values["target"] = "generic";
                values["type"] = type;

                var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

                var responseString = Encoding.Default.GetString(response);

                if(!responseString.Contains("0results"))
                    return responseString;
                else
                {
                    return null;
                }

            }
            catch
            {
                return null;
            }
        }

        public static async Task<string> GetSpecificModpackInfo(string name)
        {
            try
            {
                var client = new WebClient();
                var values = new System.Collections.Specialized.NameValueCollection();
                values["target"] = "specific";
                values["name"] = name;

                var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

                var responseString = Encoding.Default.GetString(response);

                if (!responseString.Contains("0results"))
                {
                    return responseString;
                }
                else
                {
                    MessageBox.Show("Error getting modpacks");
                    return null;
                }

            }
            catch
            {
                return null;
            }
        }

        public static async Task<List<string[]>> GetModpacksFiles(string modpackname, string versionName, string instanceName)
        {
            List<string[]> libraries = new List<string[]>();
            string[] temp;
            var client = new WebClient();
            var values = new System.Collections.Specialized.NameValueCollection();
            values["target"] = "specificVersion";
            values["name"] = modpackname;
            values["versionName"] = versionName;


            var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

            var responseString = Encoding.Default.GetString(response);

            if (!responseString.Contains("0results"))
                temp = responseString.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
            else
            {
                MessageBox.Show(Pages.SplashScreen.singleton.manager.GetString("couldNotGetModpacksList"));
                return null;
            }

            dynamic json = JsonConvert.DeserializeObject(temp[3]);

                foreach (var item in json["libraries"])
                {
                    var package = (string)item["name"];

                    //RESTITUISCE L'URL COMPLETO DEL DOWNLOAD
                    libraries.Add(new string[4] { System.IO.Path.GetFileName(package), null, "Packs\\" + instanceName + "\\mods\\" + System.IO.Path.GetFileName(package), package });
                }
                return libraries;
        }

        public static async Task<List<string>> GetModpackInfo(string modpackname)
        {
            if (modpackname != "Minecraft Vanilla")
            {
                var result = await Task.Run(() => RemoteModpacks.GetSpecificModpackInfo(modpackname));
                var info = result.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                List<string> returned = new List<string>();
                returned.Add(info[2]);
                returned.Add(info[4]);
                returned.Add(info[3]);
                returned.Add(info[5]);
                return returned;
            }
            return null;
        }


    }
}
