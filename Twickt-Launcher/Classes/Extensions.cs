using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Extensions
{
    public static class Extensions
    {
        public static async Task DownloadFileTaskAsync(this WebClient webClient, string url, string filename, CancellationToken cancellationToken)
        {
            cancellationToken.Register(webClient.CancelAsync);
            await webClient.DownloadFileTaskAsync(url, filename);
            return;
        }
    }
}
