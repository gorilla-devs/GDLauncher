// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace Twickt_Launcher
{
    /// <summary>
    /// Logica di interazione per App.xaml
    /// </summary>
    public partial class App : Application
    {
        void App_Startup(object sender, StartupEventArgs e)
        {
            AppDomain.CurrentDomain.UnhandledException += CurrentDomainOnUnhandledException;
        }

        private void CurrentDomainOnUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            MessageBox.Show("We are truly sorry for this. Some big and unhandled errors happened. The application will now shut down but we will fix this! We promise! Wait a second while we collect some informations");
            var client = new WebClient();
            var values = new NameValueCollection();
            values["username"] = SessionData.username;
            values["message"] = "AUTOMATIC ERROR REPORTING -- <br><br><br>" + e.ExceptionObject.ToString();

            try
            {
                var response = client.UploadValues(config.bugReportWebService, values);
                var responseString = Encoding.Default.GetString(response);
                if (responseString.Contains("sent"))
                {
                    MessageBox.Show("Thank you for your patience!");
                }
            }
            catch
            {
                MessageBox.Show("There are too many fucking errors here. Application is going to shut down");
            }
            Application.Current.Shutdown();
        }
    }
}
