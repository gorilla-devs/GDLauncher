using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using GDLauncher.Models;
using GDLauncher.Properties;
using Newtonsoft.Json;

namespace GDLauncher.Classes
{
    class CurseApis
    {
        public static string defaultURL = "https://cursemeta.nikky.moe";

        public static async Task<List<ModpackVersions>> getVersions(int id)
        {
            var list = new List<ModpackVersions>();

            HttpClient client = new HttpClient();

            var response = await client.GetAsync(defaultURL + "/api/addon/" + id + "/files");

            var responseString = await response.Content.ReadAsStringAsync();

            dynamic x = JsonConvert.DeserializeObject(responseString);

            foreach (var y in x)
            {
                list.Add(new ModpackVersions
                {
                    Name = y.fileName,
                    URL = y.downloadURL,
                    GameVersion = y.gameVersion[0]
                });
            }

            return list;
        }

        public static async Task<List<string>> getDownloadURL(int projectId, int fileId)
        {
            var list = new List<string>();
            var client = new WebClient();
            try
            {
                
                var response =
                    await client.DownloadStringTaskAsync(defaultURL + "/api/addon/" + projectId +
                                                         "/files/" + fileId);
                dynamic x = JsonConvert.DeserializeObject(response);
                list.Add(x.downloadURL.ToString());
                /*if (x.dependencies != null || x.dependencies.Length != 0)
                {
                    foreach (var loc in x.dependencies)
                    {
                        list.AddRange(ResolveDependancies(loc.addOnId, x.gameVersion));
                    }
                }*/
                return list;

            }
            catch (Exception e)
            {
                Console.WriteLine("Could not download " + defaultURL + "/api/addon/" + projectId +
                                  "/files/" + fileId + e.Message);
            }

            return null;
        }

        public static async Task<List<string>> ResolveDependancies(int projectId, string[] versions)
        {
            var list = new List<string>();
            var client = new WebClient();
            try
            {
                var response =
                    await client.DownloadStringTaskAsync(defaultURL + "/api/addon/" + projectId + "/files");
                dynamic x = JsonConvert.DeserializeObject(response);
                foreach (var version in versions)
                {
                    var found = false;
                    foreach (var loc in x)
                    {
                        var pos = Array.FindIndex(loc, version);
                        if (pos != -1)
                        {
                            list.Add(loc[pos].downloadURL);
                            if (loc[pos].dependencies != null || loc[pos].dependencies.Length != 0)
                            {
                                foreach (var loc1 in loc[pos].dependencies)
                                {
                                    list.AddRange(ResolveDependancies(loc1, loc[pos].gameVersion));
                                }
                            }
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        break;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Could not download " + defaultURL + "/api/addon/" + projectId +
                                  "/files");
            }

            return list;
        }
    }
}
