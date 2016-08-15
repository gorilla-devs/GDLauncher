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

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            if (String.IsNullOrEmpty(username.Text) || String.IsNullOrEmpty(password.Password) || String.IsNullOrEmpty(passwordcheck.Password) || String.IsNullOrEmpty(email.Text))
            {
                error.Visibility = Visibility.Visible;
                error.Content = "Compila tutti i campi";
                return;
            }
            if(username.Text.Length > 20)
            {
                error.Visibility = Visibility.Visible;
                error.Content = "L'username non puo' essere piu' lungo di 20 caratteri";
                return;
            }
            if (password.Password.Length < 6)
            {
                error.Visibility = Visibility.Visible;
                error.Content = "La password deve essere lunga almeno 6 caratteri";
                return;
            }
            if (!IsValidEmail(email.Text))
            {
                error.Visibility = Visibility.Visible;
                error.Content = "Email non valida";
                return;
            }
            if (password.Password != passwordcheck.Password)
            {
                error.Visibility = Visibility.Visible;
                error.Content = "Le password non corrispondono";
                return;
            }
            if (controllo.Text != sum.ToString())
            {
                //Per evitare lo spam automatico delle registrazioni sono necessari parecchi controlli
                error.Visibility = Visibility.Visible;
                error.Content = "Controllo errato - Aspetta 5 secondi";
                List<int> nums1 = Classes.AntiSpam.GenerateRandomNumbers();
                sum = nums1[0] + nums1[1];
                MaterialDesignThemes.Wpf.HintAssist.SetHint(controllo, (nums1[0] + " + " + nums1[1] + " = "));
                controllo.Text = "";
                register.IsEnabled = false;
                back.IsEnabled = false;
                username.IsEnabled = false;
                email.IsEnabled = false;
                password.IsEnabled = false;
                passwordcheck.IsEnabled = false;
                controllo.IsEnabled = false;
                await Task.Delay(1000);
                error.Content = "Controllo errato - Aspetta 4 secondi";
                await Task.Delay(1000);
                error.Content = "Controllo errato - Aspetta 3 secondi";
                await Task.Delay(1000);
                error.Content = "Controllo errato - Aspetta 2 secondi";
                await Task.Delay(1000);
                error.Content = "Controllo errato - Aspetta 1 secondi";
                await Task.Delay(1000);
                error.Content = "Controllo errato";
                register.IsEnabled = true;
                back.IsEnabled = true;
                username.IsEnabled = true;
                email.IsEnabled = true;
                password.IsEnabled = true;
                passwordcheck.IsEnabled = true;
                controllo.IsEnabled = true;
                return;
            }

            var client = new WebClient();
            var values = new NameValueCollection();
            values["username"] = username.Text;
            values["email"] = email.Text;
            values["password"] = Pages.Login.sha256(password.Password);
            register.IsEnabled = false;
            var response = await client.UploadValuesTaskAsync(config.RegisterWebService, values);

            var responseString = Encoding.Default.GetString(response);
            MessageBox.Show(responseString);
            if (responseString.Contains("OK") && responseString.Contains("sent"))
            {
                MessageBox.Show("Registrazione completata, attiva l'account via mail e poi potrai loggarti ");
            }
            else
            {
                MessageBox.Show("C'e' stato un errore con la registrazione. Riprova piu' tardi o contatta il supporto");
            }
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
        #region Hide Error on Textbox Focus
        private void username_GotFocus(object sender, RoutedEventArgs e)
        {
            error.Visibility = Visibility.Hidden;
        }

        private void email_GotFocus(object sender, RoutedEventArgs e)
        {
            error.Visibility = Visibility.Hidden;
        }

        private void password_GotFocus(object sender, RoutedEventArgs e)
        {
            error.Visibility = Visibility.Hidden;
        }

        private void passwordcheck_GotFocus(object sender, RoutedEventArgs e)
        {
            error.Visibility = Visibility.Hidden;
        }

        private void controllo_GotFocus(object sender, RoutedEventArgs e)
        {
            error.Visibility = Visibility.Hidden;
        }
        #endregion
    }
}
