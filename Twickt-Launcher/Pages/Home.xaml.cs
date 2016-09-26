// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
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
using System.Windows.Threading;
using Twickt_Launcher.Classes;

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per Home.xaml
    /// </summary>
    public partial class Home : Page
    {
        public static Dialogs.ModpackLoading loading = new Dialogs.ModpackLoading();
        public Home()
        {
            InitializeComponent();
            Dispatcher.BeginInvoke(DispatcherPriority.Loaded, new Action(() =>
            {
                var navWindow = Window.GetWindow(this) as NavigationWindow;
                if (navWindow != null) navWindow.ShowsNavigationUI = false;
            }));
            transition.SelectedIndex = 0;
            if (SessionData.isAdmin == "true")
                welcomeadmin.Visibility = Visibility.Visible;
        }

        private async void Page_Loaded(object senderx, RoutedEventArgs ee)
        {
            System.Collections.Specialized.StringCollection x = (System.Collections.Specialized.StringCollection)Properties.Settings.Default["bookmarks"];
            if (x.Count != 0)
            {
                foreach (var i in x)
                {
                    try
                    {
                        var json = System.IO.File.ReadAllText(i + "\\" + new DirectoryInfo(i).Name + ".json");
                        dynamic decoded = JsonConvert.DeserializeObject(json);
                        var card = new MaterialDesignThemes.Wpf.Card();
                        card.Height = 170;
                        card.Width = 190;
                        card.Margin = new Thickness(5, 0, 3, 3);
                        Label lab = new Label();
                        lab.Content = decoded.instanceName;
                        lab.FontWeight = FontWeights.ExtraBold;
                        Label modpacknamelabel = new Label();
                        modpacknamelabel.Content = "Pack Name: " + decoded.modpackName;
                        Label mcversionlabel = new Label();
                        mcversionlabel.Content = "MC Version: " + decoded.mc_version;
                        Button play = new Button();
                        play.Content = "Play";
                        play.Foreground = new SolidColorBrush(Colors.White);
                        play.Click += new RoutedEventHandler((sender, e) => play_click(this, e, i));
                        bookmarksContainer.Children.Add(card);
                        StackPanel panel = new StackPanel();
                        play.Margin = new Thickness(10, 20, 10, 0);
                        lab.HorizontalAlignment = HorizontalAlignment.Center;
                        panel.Children.Add(lab);
                        panel.Children.Add(modpacknamelabel);
                        panel.Children.Add(mcversionlabel);
                        panel.Children.Add(play);
                        card.Content = panel;
                    }
                    catch(Exception ex)
                    {
                        x.Remove(i);
                        Label lab = new Label();
                        lab.FontSize = 15;
                        var sadface = new MaterialDesignThemes.Wpf.PackIcon();
                        sadface.VerticalAlignment = VerticalAlignment.Center;
                        sadface.Width = 30;
                        sadface.Height = 30;
                        sadface.Margin = new Thickness(3, 0, 0, 0);
                        sadface.Kind = MaterialDesignThemes.Wpf.PackIconKind.EmoticonSad;
                        lab.Content = " An error occurred. We fixed it. Reload this page";
                        bookmarksContainer.Children.Add(sadface);
                        bookmarksContainer.Children.Add(lab);
                        break;
                    }
                }
            }
            else
            {
                Label lab = new Label();
                var sadface = new MaterialDesignThemes.Wpf.PackIcon();
                sadface.VerticalAlignment = VerticalAlignment.Center;
                sadface.Width = 30;
                sadface.Height = 30;
                sadface.Margin = new Thickness(3, 0, 0, 0);
                sadface.Kind = MaterialDesignThemes.Wpf.PackIconKind.EmoticonSad;
                lab.FontSize = 15;
                lab.Content = " No bookmarks. Go to installed modpacks and bookmark some modpacks there";
                bookmarksContainer.Children.Add(sadface);
                bookmarksContainer.Children.Add(lab);
            }
            transition.SelectedIndex = 1;
            if(Properties.Settings.Default["justUpdated"].ToString() == "true")
            {
                await Task.Delay(400);
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Changelog(), "RootDialog");
                Properties.Settings.Default["justUpdated"] = "false";
                Properties.Settings.Default.Save();
            }
        }

        async void play_click(object sender, RoutedEventArgs e, string dir)
        {
            Classes.MinecraftStarter.Minecraft_Start(dir);
        }

        private void websiteLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("https://twickt.com");
        }

        private void facebookLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("https://www.facebook.com/twicktlauncher/");
        }

        private void twitterLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("https://twitter.com/twicktlab");
        }

        private void emailLink_MouseDown(object sender, MouseButtonEventArgs e)
        {
            System.Diagnostics.Process.Start("mailto:davide.ceschia@twickt.com");
        }

        private void image1_AnimationCompleted(object sender, RoutedEventArgs e)
        {

        }

        private async void modpack2start_Click(object sender, RoutedEventArgs e)
        {
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.OptionsUpdates("Questa funzione non e' ancora disponibile", 250, 50), "RootDialog", ExtendedOpenedEventHandler, ExtendedClosingEventHandler);
        }
        private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            await Task.Delay(1200);
            eventArgs.Session.Close();
        }

        private static void ExtendedClosingEventHandler(object sender, MaterialDesignThemes.Wpf.DialogClosingEventArgs eventArgs)
        {

        }

        private void modpack2start_Loaded(object sender, RoutedEventArgs e)
        {

        }

        private async void changelog_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Changelog(), "RootDialog");
        }

        private async void problems_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.OptionsUpdates(@"Per risolvere i tuoi problemi con il launcher, il primo tentativo e' di cancellare la cartella di minecraft del launcher.
                                                                                        Cliccando su procedi verrai portato alla cartella minecraft dove potrai spostare i tuoi salvataggi del gioco e successivamente cancellare la cartella. Per un funzionamento ottimale del launcher ti consigliamo di riavviarlo dopo tale procedura
                                                                                        ", 330, 270, true, "Procedi"), "RootDialog");
            
            string filePath = config.M_F_P;

            // combine the arguments together
            // it doesn't matter if there is a space after ','
            string argument = "/select, \"" + filePath + "\"";

            System.Diagnostics.Process.Start("explorer.exe", argument);

        }

        private void installedModpacks_Click(object sender, RoutedEventArgs e)
        {
            Window1.singleton.MainPage.Navigate(new Pages.Modpacks());
            Window1.singleton.NavigationMenu.SelectedIndex = 3;
        }

        private void MarketModpacks_Click(object sender, RoutedEventArgs e)
        {
            Window1.singleton.MainPage.Navigate(new Pages.ModpacksMarket());
            Window1.singleton.NavigationMenu.SelectedIndex = 2;
        }
    }
}
