// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher
using System;
using System.Collections.Generic;
using System.Linq;
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
    /// Logica di interazione per ModpacksMarket.xaml
    /// </summary>
    public partial class ModpacksMarket : Page
    {
        public ModpacksMarket()
        {
            InitializeComponent();
            transition.SelectedIndex = 0;
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            transition.SelectedIndex = 1;
            await RefreshModpacks();
        }

        public async Task RefreshModpacks()
        {
            var remotelist = await Classes.RemoteModpacks.GetModpacksList();
            foreach (var x in remotelist.Split(new string[] { "<<<||;;||>>>" }, StringSplitOptions.RemoveEmptyEntries))
            {
                var z = x.Split(new string[] { "<<|;|>>" }, StringSplitOptions.None);
                CreateModpackCard(z[0], z[1]);
            }
        }

        protected void CreateModpackCard(string name, string description)
        {
            var card = new MaterialDesignThemes.Wpf.Card();
            card.Name = "card" + name.Replace(" ", "");
            try
            {
                modpacksContainer.RegisterName(card.Name, card);
            }
            catch
            {
                modpacksContainer.UnregisterName(card.Name);
                modpacksContainer.RegisterName(card.Name, card);
            }
            card.Height = 320;
            card.Width = 300;
            card.Margin = new Thickness(4);
            card.HorizontalAlignment = HorizontalAlignment.Left;

            var insiderStackPanel = new StackPanel();

            card.Content = insiderStackPanel;

            //INSIDE STACKPANEL
            Style buttonstyle = Application.Current.FindResource("MaterialDesignFloatingActionMiniAccentButton") as Style;

            var fullscreenbutton = new Button();
            var iconpackfullscreen = new MaterialDesignThemes.Wpf.PackIcon();
            iconpackfullscreen.Kind = MaterialDesignThemes.Wpf.PackIconKind.Fullscreen;
            fullscreenbutton.Content = iconpackfullscreen;
            fullscreenbutton.Style = buttonstyle;
            fullscreenbutton.HorizontalAlignment = HorizontalAlignment.Right;
            fullscreenbutton.VerticalAlignment = VerticalAlignment.Bottom;
            fullscreenbutton.Margin = new Thickness(0, 0, 16, -130);
            Panel.SetZIndex(fullscreenbutton, 10);
            fullscreenbutton.Click += new RoutedEventHandler((sender, e) => fullscreen_click(this, e, card.Name));

            var sharebutton = new Button();
            var iconpackshare = new MaterialDesignThemes.Wpf.PackIcon();
            iconpackshare.Kind = MaterialDesignThemes.Wpf.PackIconKind.ShareVariant;
            sharebutton.Content = iconpackshare;
            sharebutton.Style = buttonstyle;
            sharebutton.HorizontalAlignment = HorizontalAlignment.Right;
            sharebutton.VerticalAlignment = VerticalAlignment.Bottom;
            sharebutton.Margin = new Thickness(0, 0, 66, -130);
            Panel.SetZIndex(sharebutton, 10);

            var image = new Image();
            image.Source = new BitmapImage(new Uri(@"/Images/modpacks.jpg", UriKind.Relative));
            image.Stretch = Stretch.Fill;
            image.Width = 300;
            image.Height = 120;

            var title = new Label();
            title.Content = name;
            title.Margin = new Thickness(0, 10, 0, 0);
            title.FontSize = 15;
            title.HorizontalAlignment = HorizontalAlignment.Center;

            var scrollviewer = new ScrollViewer();
            scrollviewer.Height = 70;
            var textblock = new TextBlock();
            textblock.TextWrapping = TextWrapping.Wrap;
            textblock.Text = description;
            scrollviewer.Content = textblock;

            var ratingStackPanel = new StackPanel();
            ratingStackPanel.Orientation = Orientation.Horizontal;
            ratingStackPanel.HorizontalAlignment = HorizontalAlignment.Center;
            var ratingtitle = new Label();
            ratingtitle.VerticalAlignment = VerticalAlignment.Center;
            ratingtitle.Content = "Rate this modpack";
            var ratingbar = new MaterialDesignThemes.Wpf.RatingBar();
            ratingbar.Margin = new Thickness(10);
            ratingStackPanel.Children.Add(ratingtitle);
            ratingStackPanel.Children.Add(ratingbar);

            var buttonStackPanel = new StackPanel();
            buttonStackPanel.Orientation = Orientation.Horizontal;
            var button1 = new Button();
            var button2 = new Button();
            var button3 = new Button();
            button1.Foreground = new SolidColorBrush(Colors.White);
            button2.Foreground = new SolidColorBrush(Colors.White);
            button3.Foreground = new SolidColorBrush(Colors.White);
            button1.Margin = new Thickness(15, 0, 3, 0);
            button3.Margin = new Thickness(3, 0, 0, 0);
            button1.Content = "Install";
            button2.Content = "View Mods";
            button3.Content = "Website";
            buttonStackPanel.Children.Add(button1);
            buttonStackPanel.Children.Add(button2);
            buttonStackPanel.Children.Add(button3);


            insiderStackPanel.Children.Add(fullscreenbutton);
            insiderStackPanel.Children.Add(sharebutton);
            insiderStackPanel.Children.Add(image);
            insiderStackPanel.Children.Add(title);
            insiderStackPanel.Children.Add(scrollviewer);
            insiderStackPanel.Children.Add(ratingStackPanel);
            insiderStackPanel.Children.Add(buttonStackPanel);
            modpacksContainer.Children.Add(card);
        }

        async void fullscreen_click(object sender, RoutedEventArgs e, string card)
        {
            MaterialDesignThemes.Wpf.Card actual = (MaterialDesignThemes.Wpf.Card)modpacksContainer.FindName(card);
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.ModpackFullScreen(), "RootDialog");
        }

        private void goToInstalledModpacks_Click(object sender, RoutedEventArgs e)
        {
            Window1.singleton.MainPage.Navigate(new Pages.Modpacks());
            Window1.singleton.NavigationMenu.SelectedIndex = 3;
        }

        private async void refresh_Click(object sender, RoutedEventArgs e)
        {
            modpacksContainer.Children.Clear();
            await RefreshModpacks();
        }
    }
}
