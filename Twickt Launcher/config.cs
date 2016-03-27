using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Twickt_Launcher
{
    class config
    {
        public static string updateWebsite = "https://launcher.twickt.com/";
        public static string minecraftfolder = "minecraft";
        public static string forgeversion = "1.7.10-10.13.4.1614-1.7.10";
        public static string logfile = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location) + @"\" + minecraftfolder + @"\launcher_logs.txt";
        public static string M_F_P = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location) + @"\" + minecraftfolder + @"\";
        public static string profiles = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location) + @"\profiles\";
        public static string MCEditLink = "https://download.nodecdn.net/containers/mcedit/download/dev/mcedit2-win64-2.0.0alpha-921.exe";
        public static string loginWebService = "https://webservices.twickt.com/login.php";
        public static string bugReportWebService = "https://webservices.twickt.com/bugs.php";

        /* public static byte[] client_privateKey = Utilities.HexToBinary("e4e60492628af3697e10760f73bc1673750f5a5d6d084ece9181f734fe15fa66");
         public static byte[] client_publicKey = Utilities.HexToBinary("08cca3e936bd0f08ab70a645dca5c1cb058eaee99396b9fd1e764dc7f2a3347f");

         public static byte[] server_publicKey = Utilities.HexToBinary("2816d35eb47b81cabb2d8a8681be39534299039f41cb3aed71af3cb8799a9c13");
         public static byte[] server_privateKey = Utilities.HexToBinary("58132f3cab70ef9677b0793a5ec534feb61d7519729edc8dcc9046c4926004e5");

         public static byte[] nonce = Utilities.HexToBinary("26d67326a0beb3fc358e5ee36143d57207d4730fdc3dff76");*/

    }
}
