using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace GDLauncher.Classes
{
    class MojangAPIs
    {

        public async Task<string> Authenticate(string username, string password)
        {
            HttpClient client = new HttpClient();
            var content = new StringContent("{    \"agent\": {  \"name\": \"Minecraft\", \"version\": 1       },    \"username\": \"" + username + "\", \"password\": \"" + password + "\", \"requestUser\": true}", Encoding.UTF8, "application/json");
            var response = await client.PostAsync("https://authserver.mojang.com/authenticate", content);

            var responseString = await response.Content.ReadAsStringAsync();
            return responseString;
        }


    }
}
