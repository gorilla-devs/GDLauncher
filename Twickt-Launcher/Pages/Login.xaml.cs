using MaterialDesignThemes.Wpf;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
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
    /// Logica di interazione per Login.xaml
    /// </summary>
    public partial class Login : Page
    {
        public Login()
        {
            InitializeComponent();
            Window1.singleton.MenuToggleButton.IsEnabled = false;
            Window1.singleton.popupbox.IsEnabled = false;
        }

        static byte[] GetBytes(string str)
        {
            byte[] bytes = new byte[str.Length * sizeof(char)];
            System.Buffer.BlockCopy(str.ToCharArray(), 0, bytes, 0, bytes.Length);
            return bytes;
        }

        static string GetString(byte[] bytes)
        {
            char[] chars = new char[bytes.Length / sizeof(char)];
            System.Buffer.BlockCopy(bytes, 0, chars, 0, bytes.Length);
            return new string(chars);
        }

        static string sha256(string password)
        {
            System.Security.Cryptography.SHA256Managed crypt = new System.Security.Cryptography.SHA256Managed();
            System.Text.StringBuilder hash = new System.Text.StringBuilder();
            byte[] crypto = crypt.ComputeHash(Encoding.UTF8.GetBytes(password), 0, Encoding.UTF8.GetByteCount(password));
            foreach (byte theByte in crypto)
            {
                hash.Append(theByte.ToString("x2"));
            }
            return hash.ToString();
        }

        private async void button_Click(object sender, RoutedEventArgs e)
        {
            loading.Visibility = Visibility.Visible;
            sha256(password.Password);
            var client = new WebClient();
            var values = new NameValueCollection();
            values["username"] = username.Text;
            values["password"] = sha256(password.Password);

            var response = client.UploadValues(config.loginWebService, values);

            var responseString = Encoding.Default.GetString(response);
            if (responseString.Contains("true"))
            {
                var userdata = responseString.Split(';');

                SessionData.username = userdata[1];
                SessionData.email = userdata[2];
                SessionData.isAdmin = userdata[3];
                if(userdata[3] == "false")
                {
                    using (var webClient = new System.Net.WebClient())
                    {
                        var json = webClient.DownloadString(config.updateWebsite + "/Modpacks.json");
                        dynamic stuff = JObject.Parse(json);
                        string OnlyAdmin = stuff.OnlyAdmin;
                        if (OnlyAdmin.ToString() == "true")
                        {
                            await DialogHost.Show(new Dialogs.OptionsUpdates("Actually only Admins can login. We are sorry for that!", 350), "RootDialog", ExtendedOpenedEventHandler);
                            loading.Visibility = Visibility.Hidden;
                            return;
                        }
                    }
                }
                Window1.singleton.MenuToggleButton.IsEnabled = true;
                Window1.singleton.popupbox.IsEnabled = true;
                Window1.singleton.loggedinName.Text = "Logged in as " + userdata[1];
                if (keepMeIn.IsChecked == true)
                {
                    Properties.Settings.Default["keepMeLoggedIn"] = true;
                    Properties.Settings.Default.Save();
                }
                else
                {
                    Properties.Settings.Default["keepMeLoggedIn"] = false;
                    Properties.Settings.Default.Save();
                }
                if(Properties.Settings.Default["firstTimeHowTo"].ToString() == "true")
                {
                    Window1.singleton.MainPage.Navigate(new Dialogs.HowTo());
                }
                else
                {
                    if (Properties.Settings.Default["startingPage"].ToString() == "Home")
                    {
                        Window1.singleton.MainPage.Navigate(new Pages.Home());
                        Window1.singleton.NavigationMenu.SelectedIndex = 0;
                    }

                    else if (Properties.Settings.Default["startingPage"].ToString() == "Modpacks")
                    {
                        Window1.singleton.MainPage.Navigate(new Pages.Modpacks());
                        Window1.singleton.NavigationMenu.SelectedIndex = 2;
                    }
                }

            }
            else
            {
                await DialogHost.Show(new Dialogs.OptionsUpdates("Wrong username or password"), "RootDialog", ExtendedOpenedEventHandler);
            }

            //alice encrypts a message for bob
            //var encrypted = PublicKeyBox.Create(MESSAGE, nonce, alice.PrivateKey, bob.PublicKey);
            //bob decrypt the message
            //var decrypted = PublicKeyBox.Open(encrypted, nonce, bob.PrivateKey, alice.PublicKey);
            loading.Visibility = Visibility.Hidden;
        }

        private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                await Task.Delay(1200);
                eventArgs.Session.Close();
            }
            catch
            {
                /*cancelled by user...tidy up and dont close as will have already closed */
            }
        }

        private void button1_Click(object sender, RoutedEventArgs e)
        {
            username.Text = "test";
            password.Password = "test";
        }

        private void button1_Copy_Click(object sender, RoutedEventArgs e)
        {
            username.Text = "Admin";
            password.Password = "Admin";
        }

        private async void label1_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            var error = new Dialogs.OptionsUpdates("Contact Davide Ceschia for registration!", 350);
            await MaterialDesignThemes.Wpf.DialogHost.Show(error, "RootDialog", erroropenEvent);
        }


        private static async void erroropenEvent(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            try
            {
                await Task.Delay(2000);
                eventArgs.Session.Close();
            }
            catch (TaskCanceledException)
            {
                /*cancelled by user...tidy up and dont close as will have already closed */
            }
            catch
            {

            }
        }

        private void Page_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key.Equals(Key.Return))
            {
                button.RaiseEvent(new RoutedEventArgs(ButtonBase.ClickEvent));
            }
        }
    }
}
