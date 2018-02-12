using GDLauncher.Properties;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using Newtonsoft.Json;

namespace GDLauncher.Classes
{
    class AuthenticateJSON
    {
        public string username;
        public string password;
        public string clientToken;
        public bool requestUser;
        public Agent agent;
    }

    class Agent
    {
        public string name;
        public int version;
    }


    class ValidateJSON
    {
        public string accessToken;
        public string clientToken;
    }

    class MojangAPIs
    {
        public static async Task<string> Authenticate(string username, string password)
        {
            var vjson = new AuthenticateJSON
            {
                username = username,
                password = password,
                clientToken = Settings.Default.clientToken,
                requestUser = true,
                agent = new Agent
                {
                    name = "Minecraft",
                    version = 1
                }
            };

            HttpClient client = new HttpClient();

            var content = new StringContent(JsonConvert.SerializeObject(vjson), Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://authserver.mojang.com/authenticate", content);

            var responseString = await response.Content.ReadAsStringAsync();
            /*if (responseString.Contains("error"))
            {
                var x = await Signout(username, password);
                Console.WriteLine(x);
            }*/

            return responseString;
        }

        public static async Task<string> Signout(string username, string password)
        {
            var vjson = new AuthenticateJSON
            {
                username = username,
                password = password,
            };

            HttpClient client = new HttpClient();

            var content = new StringContent(JsonConvert.SerializeObject(vjson), Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://authserver.mojang.com/signout", content);

            var responseString = await response.Content.ReadAsStringAsync();

            return responseString;
        }

        public static async Task<bool> InvalidateToken(string token)
        {
            var vjson = new ValidateJSON
            {
                accessToken = token,
                clientToken = Settings.Default.clientToken
            };

            var client = new HttpClient();

            var content = new StringContent(JsonConvert.SerializeObject(vjson), Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://authserver.mojang.com/invalidate", content);

            var responseString = await response.Content.ReadAsStringAsync();

            return responseString == "";
        }

        public static async Task<bool> IsTokenValid(string token)
        {
            var vjson = new ValidateJSON
            {
                accessToken = token,
                clientToken = Settings.Default.clientToken
            };

            var client = new HttpClient();

            var content = new StringContent(JsonConvert.SerializeObject(vjson), Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://authserver.mojang.com/validate", content);

            var responseString = await response.Content.ReadAsStringAsync();

            return responseString == "";
        }

    }
}
