// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Pagina di login*/
using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;

namespace GDLauncher.Pages
{
    /// <summary>
    /// Logica di interazione per Login.xaml
    /// </summary>
    public partial class Login : Page
    {
        public string Error = "";
        public Login(string error = "")
        {
            InitializeComponent();
            //Window1.singleton.MenuToggleButton.IsEnabled = false;
            transition.SelectedIndex = 0;
            //language.Text = Thread.CurrentThread.CurrentUICulture.Name;
            this.Error = error;
        }

        
        private void Page_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key.Equals(Key.Return))
            {
                premiumLogin.RaiseEvent(new RoutedEventArgs(ButtonBase.ClickEvent));
            }

        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await Task.Delay(50);
            transition.SelectedIndex = 1;

            premiumError.Content = Error;
            premiumUsername.Focus();

            mainCard.Effect = new DropShadowEffect
            {
                BlurRadius = 0,
                ShadowDepth = 0,
                Direction = 270,
                Opacity = .42,
                RenderingBias = RenderingBias.Performance,
            };

            mainCard.MouseEnter += (ss, ee) =>
            {
                var da = new DoubleAnimation
                {
                    From = 0,
                    To = 1.5,
                    Duration = new Duration(TimeSpan.FromSeconds(0.125))
                };
                var da1 = new DoubleAnimation
                {
                    From = 0,
                    To = 8,
                    Duration = new Duration(TimeSpan.FromSeconds(0.125))
                };
                mainCard.Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                mainCard.Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);


            };

            mainCard.MouseLeave += (ss, ee) =>
            {
                var da = new DoubleAnimation
                {
                    From = 1.5,
                    To = 0,
                    Duration = new Duration(TimeSpan.FromSeconds(0.125))
                };
                var da1 = new DoubleAnimation
                {
                    From = 8,
                    To = 0,
                    Duration = new Duration(TimeSpan.FromSeconds(0.125))
                };
                mainCard.Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                mainCard.Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);

            };
        }

        private async void TextBlock_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            /*MojangOrOffline.Content = "Offline";
            loginKind.SelectedIndex = 1;*/
            System.Diagnostics.Process.Start("https://account.mojang.com/password");

        }

        private void TextBlock_MouseLeftButtonUp_1(object sender, MouseButtonEventArgs e)
        {
            MojangOrOffline.Content = "Mojang";
            loginKind.SelectedIndex = 0;
            premiumUsername.Focus();

        }

        private async void premiumLogin_Click(object sender, RoutedEventArgs e)
        {
            premiumLogin.IsEnabled = false;
            loading.Visibility = Visibility.Visible;
            if (premiumUsername.Text == "")
            {
                premiumError.Content = "Username cannot be empty";
                premiumError.Visibility = Visibility.Visible;
                loading.Visibility = Visibility.Hidden;
                premiumLogin.IsEnabled = true;
                return;
            }
            if (premiumPassword.Password == "")
            {
                premiumError.Content = "Password cannot be empty";
                premiumError.Visibility = Visibility.Visible;
                loading.Visibility = Visibility.Hidden;
                premiumLogin.IsEnabled = true;
                return;
            }

            string x = await Classes.MojangAPIs.Authenticate(premiumUsername.Text, premiumPassword.Password);
            dynamic json = Newtonsoft.Json.JsonConvert.DeserializeObject(x);
            string accessToken = "";
            string username = "";
            string Puuid = "";
            bool isLegacy = false;

            try
            {
                accessToken = json.accessToken;
                username = json.selectedProfile.name;
                Puuid = json.selectedProfile.id;
                if(json.selectedProfile.legacy != null)
                {
                    isLegacy = true;
                }
            }
            catch(Exception eex)
            {
                string xx = json.errorMessage;
                premiumError.Content = json.errorMessage.ToString();
                premiumError.Visibility = Visibility.Visible;
                loading.Visibility = Visibility.Hidden;
                premiumLogin.IsEnabled = true;
                Console.WriteLine(eex.Message);
                return;
            }
            //await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.PostLogin());

            Window1.singleton.offlineMode.Visibility = Visibility.Visible;
            Window1.singleton.offlineMode.Foreground = (SolidColorBrush)(new BrushConverter().ConvertFrom("#00A843"));
            Window1.singleton.offlineMode.ToolTip = "Playing in Online-Mode";
            Window1.singleton.offlineMode.Kind = MaterialDesignThemes.Wpf.PackIconKind.GoogleController;

            SessionData.username = username;
            SessionData.premium = true;
            SessionData.uuidPremium = Puuid;
            SessionData.accessToken = accessToken;
            SessionData.isLegacy = isLegacy;
            if (premiumRemember.IsChecked == true)
            {
                Properties.Settings.Default.premiumAccessToken = accessToken;
                Properties.Settings.Default.premiumUUID = Puuid;
                Properties.Settings.Default.premiumUsername = username;
                Properties.Settings.Default.isLegacy = isLegacy;
                Properties.Settings.Default.Save();
            }
            else
            {
                Properties.Settings.Default.premiumAccessToken = "";
                Properties.Settings.Default.premiumUUID = "";
                Properties.Settings.Default.premiumUsername = "";
                Properties.Settings.Default.isLegacy = true;
                Properties.Settings.Default.Save();
            }
            Window1.singleton.settings.IsEnabled = true;
            Window1.singleton.logout.IsEnabled = true;
            transition.SelectedIndex = 2;
            await Task.Delay(500);
            Window1.singleton.MainPage.Navigate(new Pages.Home());
            loading.Visibility = Visibility.Hidden;
            premiumLogin.IsEnabled = true;
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            System.Diagnostics.Process.Start("https://help.mojang.com/customer/en/portal/articles/428478-minecraft-java-edition-account-types");
        }
    }
}
