// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
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
        public static async Task<string> GetModpacksList()
        {
            var result = await Task.Run(() => RefreshRemote());
            Window1.singleton.MenuToggleButton.IsChecked = false;
            return result;
        }

        private static async Task<string> RefreshRemote()
        {
            try
            {
                var client = new WebClient();
                var values = new System.Collections.Specialized.NameValueCollection();
                values["target"] = "generic";

                var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

                var responseString = Encoding.Default.GetString(response);

                if(!responseString.Contains("0results"))
                    return responseString;
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
                    return responseString;
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

        public static async Task<List<string[]>> GetModpacksFiles(string modpackname, bool justname = false)
        {
            List<string[]> libraries = new List<string[]>();
            string temp;
            var client = new WebClient();
            var values = new System.Collections.Specialized.NameValueCollection();
            values["target"] = "specific";
            values["name"] = modpackname;
            values["allinfo"] = "true";

            var response = await client.UploadValuesTaskAsync(config.modpacksWebService, values);

            var responseString = Encoding.Default.GetString(response);

            if (!responseString.Contains("0results"))
                temp = responseString.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None)[6];
            else
            {
                MessageBox.Show("Error getting modpacks");
                return null;
            }
            dynamic json = JsonConvert.DeserializeObject(temp);

                foreach (var item in json["libraries"])
                {
                    var package = (string)item["name"];
                    var hash = (string)item["hash"]; ;
                    var url = (string)item["url"]; ;
                    var check = (string)item["check"];
                    var baseurl = config.updateWebsite;
                    var finalurl = "";


                    string[] lines = package.Split(':');
                    bool first = true;
                    foreach (string s in lines)
                    {
                        if (first == true)
                        {
                            finalurl += s;
                            first = false;
                        }
                        else
                        {
                            if (justname == true)
                            {
                                finalurl = s;
                            }
                            else
                            {
                                finalurl += "/" + s;
                            }
                        }
                    }
                    libraries.Add(new string[5] { package, hash, @"\instances\" + finalurl.Replace("/", "\\"), config.updateWebsite + url, check });

                }
                return libraries;
        }

        public static async Task<string> IsModpackForgeNeeded(string modpackname)
        {
            var result = await Task.Run(() => RemoteModpacks.GetSpecificModpackInfo(modpackname));
            var info = result.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
            return info[3];

        }

        public static async Task<string> GetModpacksDir(string modpackname)
        {
            var result = await Task.Run(() => RemoteModpacks.GetSpecificModpackInfo(modpackname));
            var info = result.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
            return info[4];
        }

        public static async Task<List<string>> GetMinecraftUrlsAndData(string modpackname)
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


    }
}
