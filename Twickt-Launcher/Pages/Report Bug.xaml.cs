// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per Report_Bug.xaml
    /// </summary>
    public partial class Report_Bug : Page
    {
        int sum;
        public Report_Bug()
        {
            InitializeComponent();
            List<int> nums = Classes.AntiSpam.GenerateRandomNumbers();
            op1.Content = nums[0];
            op2.Content = nums[1];
            sum = nums[0] + nums[1];
        }

        private async void send_Click(object sender, RoutedEventArgs e)
        {
            if(result.Text != sum.ToString())
            {
                MessageBox.Show("Chapta Wrong");
                List<int> nums = Classes.AntiSpam.GenerateRandomNumbers();
                op1.Content = nums[0];
                op2.Content = nums[1];
                sum = nums[0] + nums[1];
                return;
            }
            var client = new WebClient();
            var values = new NameValueCollection();
            values["username"] = SessionData.username;
            values["message"] = body.Text;


            var response = client.UploadValues(config.bugReportWebService, values);

            var responseString = Encoding.Default.GetString(response);

            if(responseString.Contains("sent"))
            {
                MessageBox.Show("Message sent");
                body.Text = "";
                result.Text = "";
            }
            else
            {
                MessageBox.Show("There was an error! " + responseString);
            }


            List<int> nums1 = Classes.AntiSpam.GenerateRandomNumbers();
            op1.Content = nums1[0];
            op2.Content = nums1[1];
            sum = nums1[0] + nums1[1];

        }
    }
}
