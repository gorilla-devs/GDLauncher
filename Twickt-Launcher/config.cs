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
        public static string updateWebsite = "https://dl.gorilladevs.com/";
        public static string minecraftfolder = "GorillaDevs";
        public static string forgeversion = "";
        public static string mainclass = "";
        public static string arguments = "";
        public static string forgefilepath = "";
        public static string logfile = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\launcher_logs.txt";
        public static string M_F_P = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\";
        public static string javaLocal = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\";
        public static string LocalModpacks = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\" + minecraftfolder + @"\LocalModpacks\";
        public static string loginWebService = "https://api.twickt.com/login.php";
        public static string bugReportWebService = "https://api.twickt.com/bugs.php";
        public static string changelogsWebService = "https://api.twickt.com/changelogs.php";
        public static string updatessWebService = "https://dl.gorilladevs.com/launcher_versions.json";
        public static string javaDownloadURL32 = "java8_152";
        public static string javaDownloadURL64 = "java8_152_64";

    }
}
