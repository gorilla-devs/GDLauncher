// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Questa classe gestisce il sistema antispam*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Twickt_Launcher.Classes
{
    class AntiSpam
    {
        public static List<int> GenerateRandomNumbers()
        {
            List<int> nums = new List<int>();
            var seed = Convert.ToInt32(Regex.Match(Guid.NewGuid().ToString(), @"\d+").Value);
            nums.Add(new Random(seed).Next(0, 30));
            nums.Add(new Random((int)(DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond)).Next(0, 30));
            return nums;
        }
    }

}
