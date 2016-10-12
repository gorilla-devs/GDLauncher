// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Classe di configurazione*/
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
        public static string updateWebsite = "https://dl.twickt.com/";
        public static string minecraftfolder = "twickt";
        public static string forgeversion = "";
        public static string mainclass = "";
        public static string arguments = "";
        public static string forgefilepath = "";
        public static string logfile = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\launcher_logs.txt";
        public static string M_F_P = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\";
        public static string javaLocal = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\";
        public static string LocalModpacks = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\LocalModpacks\";
        public static string loginWebService = "https://webservices.twickt.com/login.php";
        public static string bugReportWebService = "https://webservices.twickt.com/bugs.php";
        public static string RegisterWebService = "https://webservices.twickt.com/process.php";
        public static string modpacksWebService = "https://webservices.twickt.com/modpacks1.php";
        public static string launcherStatusWebService = "https://webservices.twickt.com/launcher_status.php";
        public static string changelogsWebService = "https://webservices.twickt.com/changelogs.php";
        public static string updatessWebService = "https://webservices.twickt.com/updates.php";
        public static string modpacksupload = "https://webservices.twickt.com/modpacksupload.php";

        public static string javaDownloadURL32 = "jPortable_8_Update_101.paf";
        public static string javaDownloadURL64 = "jPortable64_8_Update_101.paf";

        /* public static byte[] client_privateKey = Utilities.HexToBinary("e4e60492628af3697e10760f73bc1673750f5a5d6d084ece9181f734fe15fa66");
         public static byte[] client_publicKey = Utilities.HexToBinary("08cca3e936bd0f08ab70a645dca5c1cb058eaee99396b9fd1e764dc7f2a3347f");

         public static byte[] server_publicKey = Utilities.HexToBinary("2816d35eb47b81cabb2d8a8681be39534299039f41cb3aed71af3cb8799a9c13");
         public static byte[] server_privateKey = Utilities.HexToBinary("58132f3cab70ef9677b0793a5ec534feb61d7519729edc8dcc9046c4926004e5");

         public static byte[] nonce = Utilities.HexToBinary("26d67326a0beb3fc358e5ee36143d57207d4730fdc3dff76");*/

    }
}
