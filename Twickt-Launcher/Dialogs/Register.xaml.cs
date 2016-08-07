using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
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

namespace Twickt_Launcher.Dialogs
{
    /// <summary>
    /// Interaction logic for Register.xaml
    /// </summary>
    public partial class Register : UserControl
    {
        public static bool close = false;
        bool invalid = false;
        int sum;
        public Register()
        {
            InitializeComponent();

            List<int> nums1 = Classes.AntiSpam.GenerateRandomNumbers();
            sum = nums1[0] + nums1[1];
            MaterialDesignThemes.Wpf.HintAssist.SetHint(controllo, (nums1[0] + " + " + nums1[1] + " = "));
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (String.IsNullOrEmpty(username.Text) || String.IsNullOrEmpty(password.Password) || String.IsNullOrEmpty(passwordcheck.Password) || String.IsNullOrEmpty(email.Text))
            {
                MessageBox.Show("Compila tutti i campi");
                return;
            }
            if(!IsValidEmail(email.Text))
            {
                MessageBox.Show("Email non valida");
                return;
            }
            if (password.Password != passwordcheck.Password)
            {
                MessageBox.Show("Le password non corrispondono");
                return;
            }
            if (controllo.Text != sum.ToString())
            {
                MessageBox.Show("Controllo errato");
                return;
            }

            var client = new WebClient();
            var values = new NameValueCollection();
            values["username"] = username.Text;
            values["email"] = email.Text;
            values["password"] = Pages.Login.sha256(password.Password);

            var response = client.UploadValues(config.RegisterWebService, values);

            var responseString = Encoding.Default.GetString(response);
            //FARE UN CONTROLLO SULLA REGISTRAZUIBE
                close = true;
        }

        public bool IsValidEmail(string strIn)
        {
            invalid = false;
            if (String.IsNullOrEmpty(strIn))
                return false;

            // Use IdnMapping class to convert Unicode domain names.
            try
            {
                strIn = Regex.Replace(strIn, @"(@)(.+)$", this.DomainMapper,
                                      RegexOptions.None, TimeSpan.FromMilliseconds(200));
            }
            catch (RegexMatchTimeoutException)
            {
                return false;
            }

            if (invalid)
                return false;

            // Return true if strIn is in valid e-mail format.
            try
            {
                return Regex.IsMatch(strIn,
                      @"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
                      @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$",
                      RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250));
            }
            catch (RegexMatchTimeoutException)
            {
                return false;
            }
        }

        private string DomainMapper(Match match)
        {
            // IdnMapping class with default property values.
            IdnMapping idn = new IdnMapping();

            string domainName = match.Groups[2].Value;
            try
            {
                domainName = idn.GetAscii(domainName);
            }
            catch (ArgumentException)
            {
                invalid = true;
            }
            return match.Groups[1].Value + domainName;
        }
    }
}
