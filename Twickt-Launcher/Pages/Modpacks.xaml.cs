// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher


/*Pagina delle modpacks installate*/

using MaterialDesignThemes.Wpf;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Twickt_Launcher.Classes;

namespace Twickt_Launcher.Pages
{
    /// <summary>
    /// Logica di interazione per Modpacks.xaml
    /// </summary>
    public partial class Modpacks : Page
    {
        public static Modpacks singleton;
        public List<string> registrationList;
        public static Dialogs.ModpackLoading loading;
        public static List<string> downloadingVersion;
        private bool loaded = false;
        private object lastSelectedModpacksType;
        public Modpacks()
        {
            InitializeComponent();
            Window1.singleton.MenuToggleButton.IsEnabled = true;
            singleton = this;
            transition.SelectedIndex = 0;
        }
        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            transition.SelectedIndex = 1;
            if(!Directory.Exists(config.M_F_P + "Packs\\"))
            {
                Directory.CreateDirectory(config.M_F_P + "Packs\\");
            }
            await modpacksUpdate();
        }

        public async Task modpacksUpdate()
        {
            modpacksListContainer.Children.Clear();
            var dirlist = Directory.GetDirectories(config.M_F_P + "Packs\\");
            if (dirlist.Count() != 0)
            {
                foreach (var dir in dirlist)
                {
                    string modpackversion;
                    string modpackname;
                    string mcversion;
                    try
                    {
                        var json = System.IO.File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
                        dynamic jObj = JsonConvert.DeserializeObject(json);
                        modpackname = jObj.modpackName;
                        modpackversion = jObj.modpackVersion;
                        mcversion = jObj.mc_version;

                    }
                    catch (FileNotFoundException ex)
                    {
                        continue;
                    }
                    catch(JsonException)
                    {
                        MessageBox.Show("Errore durante il parsing del JSON di " + "card" + new DirectoryInfo(dir.Replace(" ", "")).Name);
                        continue;
                    }
                    var card = new MaterialDesignThemes.Wpf.Card();
                    card.Name = "card" + new DirectoryInfo(dir.Replace(" ", "")).Name;
                    try
                    {
                        modpacksListContainer.RegisterName(card.Name, card);
                    }
                    catch(ArgumentException e)
                    {
                        modpacksListContainer.UnregisterName(card.Name);
                        modpacksListContainer.RegisterName(card.Name, card);
                    }
                    catch
                    {
                        modpacksListContainer.UnregisterName(card.Name);
                        modpacksListContainer.RegisterName(card.Name, card);
                    }
                    card.Height = 200;
                    card.Width = 620;
                    card.Margin = new Thickness(10);
                    card.HorizontalAlignment = HorizontalAlignment.Left;
                    var insiderStackPanel = new StackPanel();
                    insiderStackPanel.Orientation = Orientation.Horizontal;

                    card.Content = insiderStackPanel;
                    //INSIDE STACKPANEL

                    Style buttonstyle = Application.Current.FindResource("MaterialDesignFloatingActionMiniAccentButton") as Style;

                    var bookmarkbutton = new Button();
                    var iconpackbookmark = new MaterialDesignThemes.Wpf.PackIcon();
                    System.Collections.Specialized.StringCollection x = (System.Collections.Specialized.StringCollection)Properties.Settings.Default["bookmarks"];
                    if(x.Contains(dir))
                    {
                        iconpackbookmark.Kind = MaterialDesignThemes.Wpf.PackIconKind.BookmarkCheck;
                        bookmarkbutton.ToolTip = "This modpack is bookmarked";
                    }
                    else
                    {
                        iconpackbookmark.Kind = MaterialDesignThemes.Wpf.PackIconKind.Bookmark;
                        bookmarkbutton.ToolTip = "This modpack is not bookmarked";
                    }
                    bookmarkbutton.Content = iconpackbookmark;
                    bookmarkbutton.Style = buttonstyle;
                    bookmarkbutton.HorizontalAlignment = HorizontalAlignment.Right;
                    bookmarkbutton.VerticalAlignment = VerticalAlignment.Bottom;
                    bookmarkbutton.Margin = new Thickness(0, 0, -35, 0);
                    Panel.SetZIndex(bookmarkbutton, 10);
                    bookmarkbutton.Click += new RoutedEventHandler((sender, e) => bookmark_click(this, e, card.Name, dir, bookmarkbutton));

                    var cloudbutton = new Button();
                    var iconpackcloud = new MaterialDesignThemes.Wpf.PackIcon();
                    iconpackcloud.Kind = MaterialDesignThemes.Wpf.PackIconKind.Cloud;
                    cloudbutton.ToolTip = "Cloud Syncing Service";
                    cloudbutton.Content = iconpackcloud;
                    cloudbutton.Style = buttonstyle;
                    cloudbutton.HorizontalAlignment = HorizontalAlignment.Right;
                    cloudbutton.VerticalAlignment = VerticalAlignment.Bottom;
                    cloudbutton.Margin = new Thickness(0, 0, -80, 0);
                    Panel.SetZIndex(cloudbutton, 10);
                    cloudbutton.Click += new RoutedEventHandler((sender, e) => cloud_click(this, e, card.Name, dir));

                    var image = new Image();
                    image.Source = new BitmapImage(new Uri(@"/Images/modpacks.jpg", UriKind.Relative));
                    image.Stretch = Stretch.Fill;
                    image.Width = 300;
                    image.Height = 120;

                    var datastackpanel = new StackPanel();
                    datastackpanel.Width = 290;

                    insiderStackPanel.Children.Add(bookmarkbutton);
                    insiderStackPanel.Children.Add(cloudbutton);
                    insiderStackPanel.Children.Add(image);
                    insiderStackPanel.Children.Add(datastackpanel);

                    var title = new Label();
                    title.FontSize = 15;
                    title.FontWeight = FontWeights.ExtraBold;
                    title.HorizontalAlignment = HorizontalAlignment.Center;
                    title.Content = new DirectoryInfo(dir).Name;
                    datastackpanel.Children.Add(title);

                    var modpackName = new Label();
                    modpackName.Content = "Modpack Name: " + modpackname;
                    datastackpanel.Children.Add(modpackName);

                    var modpackVersion = new Label();
                    modpackVersion.Content = "Modpack Version: " + modpackversion;
                    datastackpanel.Children.Add(modpackVersion);

                    var minecraftversion = new Label();
                    minecraftversion.Content = "MC Version: " + mcversion;
                    datastackpanel.Children.Add(minecraftversion);


                    var buttonStackPanel = new StackPanel();
                    buttonStackPanel.Orientation = Orientation.Horizontal;
                    buttonStackPanel.HorizontalAlignment = HorizontalAlignment.Center;
                    datastackpanel.Children.Add(buttonStackPanel);

                    var playbutton = new Button();
                    playbutton.Content = "Play";
                    playbutton.Foreground = new SolidColorBrush(Colors.White);
                    playbutton.Margin = new Thickness(20, 30, 3, 0);
                    playbutton.Click += new RoutedEventHandler((sender, e) => play_click(this, e, card.Name, dir));

                    var deletebutton = new Button();
                    deletebutton.Content = "Delete";
                    deletebutton.Foreground = new SolidColorBrush(Colors.White);
                    deletebutton.Margin = new Thickness(3, 30, 0, 0);
                    deletebutton.Click += new RoutedEventHandler((sender, e) => delete_click(this, e, card.Name, dir));

                    buttonStackPanel.Children.Add(playbutton);
                    buttonStackPanel.Children.Add(deletebutton);

                    modpacksListContainer.Children.Add(card);
                }
            }
            else
            {
                var label = new Label();
                label.Name = "nomodpacks";
                label.Content = "No installed modpack";
                label.FontSize = 30;
                modpacksListContainer.Children.Add(label);
            }
        }


        async void play_click(object sender, RoutedEventArgs e, string card, string dir)
        {
            MaterialDesignThemes.Wpf.Card actual = (MaterialDesignThemes.Wpf.Card)modpacksListContainer.FindName(card);
            try
            {
                var json = System.IO.File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
            }
            catch (FileNotFoundException ex)
            {
                MessageBox.Show("This cannot be run. We suggest you to delete it");
                return;
            }

            Classes.MinecraftStarter.Minecraft_Start(dir);
        }

        async void cloud_click(object sender, RoutedEventArgs e, string card, string dir)
        {
            MaterialDesignThemes.Wpf.Card actual = (MaterialDesignThemes.Wpf.Card)modpacksListContainer.FindName(card);
            await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.SyncToCloud(), "RootDialog");
        }

        async void bookmark_click(object sender, RoutedEventArgs e, string card, string dir, Button bookmark)
        {
            MaterialDesignThemes.Wpf.Card actual = (MaterialDesignThemes.Wpf.Card)modpacksListContainer.FindName(card);

            var iconpackbookmark = new MaterialDesignThemes.Wpf.PackIcon();
            System.Collections.Specialized.StringCollection x = (System.Collections.Specialized.StringCollection)Properties.Settings.Default["bookmarks"];
            var numbookmarks = x.Count;
            foreach(var i in x)
            {
                if (i == dir)
                {
                    x.Remove(dir);
                    iconpackbookmark = new MaterialDesignThemes.Wpf.PackIcon();
                    iconpackbookmark.Kind = MaterialDesignThemes.Wpf.PackIconKind.Bookmark;
                    bookmark.Content = iconpackbookmark;
                    bookmark.ToolTip = "This modpack is not bookmarked";
                    Properties.Settings.Default.Save();
                    return;
                }
            }
            try
            {
                var json = System.IO.File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
            }
            catch(FileNotFoundException ex)
            {
                MessageBox.Show("This modpack cannot be bookmarked. We suggest you to delete it");
                return;
            }
            if (numbookmarks < 3)
            {
                x.Add(dir);
                iconpackbookmark = new MaterialDesignThemes.Wpf.PackIcon();
                iconpackbookmark.Kind = MaterialDesignThemes.Wpf.PackIconKind.BookmarkCheck;
                bookmark.Content = iconpackbookmark;
                bookmark.ToolTip = "This modpack is bookmarked";
                Properties.Settings.Default.Save();
            }
            else
            {
                MessageBox.Show("You can have maximum 3 bookmarks");
                return;
            }
        }

        async void delete_click(object sender, RoutedEventArgs e, string card, string dir)
        {
            MaterialDesignThemes.Wpf.Card actual = (MaterialDesignThemes.Wpf.Card)modpacksListContainer.FindName(card);
            System.Collections.Specialized.StringCollection x = (System.Collections.Specialized.StringCollection)Properties.Settings.Default["bookmarks"];
            foreach (var i in x)
            {
                if (i == dir)
                {
                    x.Remove(dir);
                    break;
                }
            }
            Properties.Settings.Default.Save();
                try
                {
                    if (Directory.Exists(dir))
                    {
                        Directory.Delete(dir, true);
                    }
                }
                catch(Exception)
                {
                    MessageBox.Show("Cannot delete directory. Try again");
                }
            await modpacksUpdate();
        }

        private void gotoMarket_Click(object sender, RoutedEventArgs e)
        {
            Window1.singleton.MainPage.Navigate(new Pages.ModpacksMarket());
            Window1.singleton.NavigationMenu.SelectedIndex = 2;
        }

        private async void refresh_Click(object sender, RoutedEventArgs e)
        {
            await modpacksUpdate();
        }
    }
}
