// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher


/*Registrazione*/
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.IO;
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
        string ACCESS_TOKEN;
        public Register()
        {
            InitializeComponent();

            List<int> nums1 = Classes.AntiSpam.GenerateRandomNumbers();
            sum = nums1[0] + nums1[1];
            MaterialDesignThemes.Wpf.HintAssist.SetHint(controllo, (nums1[0] + " + " + nums1[1] + " = "));
            linkMojang.IsChecked = true;
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
            if(linkMojang.IsChecked == true)
            {
                if (String.IsNullOrEmpty(mojanguser.Text))
                {
                    error.Visibility = Visibility.Visible;
                    error.Content = "Inserisci un nome utente Mojang";
                    return;
                }
                if (String.IsNullOrEmpty(mojangpass.Password))
                {
                    error.Visibility = Visibility.Visible;
                    error.Content = "Inserisci una password Mojang";
                    return;
                }
                if(mojanguser.Text == username.Text || mojanguser.Text == email.Text)
                {

                }
                else
                {
                    error.Visibility = Visibility.Visible;
                    error.Content = "Il nome utente/mail di Twickt deve essere uguale a quello di Mojang";
                    return;
                }
            }
            if (TOS.IsChecked == false)
            {
                error.Visibility = Visibility.Visible;
                error.Content = "Devi accettare le condizioni di servizio";
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
            try
            {
                var client = new WebClient();
                var values = new NameValueCollection();
                values["username"] = username.Text;
                values["email"] = email.Text;
                values["password"] = Pages.Login.sha256(password.Password);
                register.IsEnabled = false;
                if (linkMojang.IsChecked == true)
                {
                    ObtainAccessToken(mojanguser.Text, mojangpass.Password);
                    MessageBox.Show(GetAccessToken());
                }
                var response = await client.UploadValuesTaskAsync(config.RegisterWebService, values);

                var responseString = Encoding.Default.GetString(response);
                if (responseString.Contains("OK") && responseString.Contains("sent"))
                {
                    MessageBox.Show("Registrazione completata, attiva l'account via mail e poi potrai loggarti. Se non attivato entro 24 ore da questo momento, l'account verra' automaticamente cancellato ");
                }
                else if (responseString.Contains("email_taken"))
                {
                    error.Visibility = Visibility.Visible;
                    error.Content = "Email gia' in uso";
                    register.IsEnabled = true;
                    return;
                }
                else if (responseString.Contains("username_taken"))
                {
                    error.Visibility = Visibility.Visible;
                    error.Content = "Username gia' in uso";
                    register.IsEnabled = true;
                    return;
                }
                else
                {
                    MessageBox.Show("C'e' stato un errore con la registrazione. Riprova piu' tardi o contatta il supporto");
                }
            }
            catch (TimeoutException timeout)
            {
                MessageBox.Show("Timeout del server. Probabilmente hai una connessione molto instabile");
            }
            catch (WebException interneterror)
            {
                MessageBox.Show("C'e' stato un errore con la rete." + interneterror.Message);
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



        public string GetAccessToken()
        {
            return ACCESS_TOKEN;
        }
        public void ObtainAccessToken(string username, string password)
        {
            //RITORNA 403 FORBIDDEN SE I DATI SONO SBAGLIATI
            var httpWebRequest = (HttpWebRequest)WebRequest.Create("https://authserver.mojang.com/authenticate");
            httpWebRequest.ContentType = "application/json";
            httpWebRequest.Method = "POST";

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                string json = "{\"agent\":{\"name\":\"Minecraft\",\"version\":1},\"username\":\"" + username + "\",\"password\":\"" + password + "\",\"clientToken\":\"6c9d237d-8fbf-44ef-b46b-0b8a854bf391\"}";

                streamWriter.Write(json);
                streamWriter.Flush();
                streamWriter.Close();

                var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    var result = streamReader.ReadToEnd();
                    ACCESS_TOKEN = result;
                }
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

        private void Hyperlink_Click(object sender, RoutedEventArgs e)
        {
            System.Diagnostics.Process.Start("https://twickt.com/terms-of-service/");
        }

        private void linkMojang_Checked(object sender, RoutedEventArgs e)
        {
                mojanguser.IsEnabled = true;
                mojangpass.IsEnabled = true;
        }

        private void linkMojang_Unchecked(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("If you do not link a minecraft premium account, your Twickt account will have low priority. This means that if someone else registers with the same username as you but with a linked Premium account, your account will be deleted and the premium account will be created. We suggest you to link a minecraft premium account to have high priority!");
            mojanguser.IsEnabled = false;
            mojangpass.IsEnabled = false;
        }
    }
}
