// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher


/*Dati di sessione*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDLauncher
{
    class SessionData
    {
        public static string latestVersion = "";
        public static long AverageDownloadSpeed;
        //DATI utente
        public static string username = "";
        public static bool premium = false;
        public static string uuidPremium = "0";
        public static string accessToken = "0";
        public static bool isLegacy = false;
    }
}
