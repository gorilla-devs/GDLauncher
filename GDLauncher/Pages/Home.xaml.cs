// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Pagina principale del launcher, nonche' quella iniziale*/
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
using GDLauncher.Classes;
using System.Windows.Media.Animation;

namespace GDLauncher.Pages
{
    /// <summary>
    /// Logica di interazione per Home.xaml
    /// </summary>
    public partial class Home : Page
    {
        public static Dialogs.ModpackLoading loading = new Dialogs.ModpackLoading();
        public static Home singleton;
        public Dialogs.ServerList serverList = new Dialogs.ServerList();


        public Home()
        {
            InitializeComponent();
            singleton = this;
            Dispatcher.BeginInvoke(DispatcherPriority.Loaded, new Action(() =>
            {
                var navWindow = Window.GetWindow(this) as NavigationWindow;
                if (navWindow != null) navWindow.ShowsNavigationUI = false;
            }));
            transition.SelectedIndex = 0;

        }

        private async void Page_Loaded(object senderx, RoutedEventArgs ee)
        {

            transition.SelectedIndex = 1;
            if (!Directory.Exists(config.M_F_P + "Packs\\"))
            {
                Directory.CreateDirectory(config.M_F_P + "Packs\\");
            }
            await ModpacksUpdate();
            if (Properties.Settings.Default["firstTimeHowTo"].ToString() == "true")
            {
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.HowTo(), "RootDialog");
            }
            if (Properties.Settings.Default["justUpdated"].ToString() == "true")
            {
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Changelog(), "RootDialog");
                Properties.Settings.Default["justUpdated"] = "false";
                Properties.Settings.Default.Save();
            }

            if(Properties.Settings.Default.premiumUsername != "//--//")
            {
                //use the message queue to send a message.
                var messageQueue = SnackbarThree.MessageQueue;
                var message = "Welcome back " + Properties.Settings.Default.premiumUsername + "! :)";

                //the message queue can be called from any thread
                Task.Factory.StartNew(() => messageQueue.Enqueue(message));
            }
            //mainLogo.Cursor = Cursors.Hand;
            mainLogo.MouseEnter += (ss, eee) => {
                DoubleAnimation da = new DoubleAnimation();
                da.From = 1;
                da.To = 0.6;
                da.Duration = new Duration(TimeSpan.FromSeconds(0.125));
                mainLogo.BeginAnimation(OpacityProperty, da);
            };

            mainLogo.MouseLeave += (ss, eee) => {
                DoubleAnimation da = new DoubleAnimation();
                da.From = 0.6;
                da.To = 1;
                da.Duration = new Duration(TimeSpan.FromSeconds(0.125));
                mainLogo.BeginAnimation(OpacityProperty, da);
            };
        }



        public async Task ModpacksUpdate()
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
                    string forge;
                    try
                    {
                        var json = System.IO.File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
                        dynamic jObj = JsonConvert.DeserializeObject(json);
                        modpackversion = jObj.modpackVersion;
                        mcversion = jObj.mc_version;
                        forge = jObj.forgeVersion;

                    }
                    catch (FileNotFoundException)
                    {
                        continue;
                    }
                    catch (JsonException)
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
                    catch (ArgumentException)
                    {
                        modpacksListContainer.UnregisterName(card.Name);
                        modpacksListContainer.RegisterName(card.Name, card);
                    }
                    catch
                    {
                        modpacksListContainer.UnregisterName(card.Name);
                        modpacksListContainer.RegisterName(card.Name, card);
                    }
                    card.Height = 285;
                    card.Width = 240;
                    card.Margin = new Thickness(0, 3, 10, 10);
                    card.HorizontalAlignment = HorizontalAlignment.Left;
                    var insiderStackPanel = new StackPanel();
                    var topStackPanel = new StackPanel();
                    topStackPanel.Background = new SolidColorBrush(Colors.Black);
                    topStackPanel.Height = 130;
                    topStackPanel.Width = 230;
                    card.Content = insiderStackPanel;
                    //INSIDE STACKPANEL

                    Style buttonstyle = Application.Current.FindResource("MaterialDesignFloatingActionButton") as Style;

                    var startBtn = new Button();
                    var iconpackplay = new MaterialDesignThemes.Wpf.PackIcon();
                    iconpackplay.Kind = MaterialDesignThemes.Wpf.PackIconKind.Play;
                    startBtn.ToolTip = "Start Pack";
                    startBtn.Content = iconpackplay;
                    startBtn.Foreground = new SolidColorBrush(Colors.White);
                    startBtn.Style = buttonstyle;
                    startBtn.HorizontalAlignment = HorizontalAlignment.Right;
                    startBtn.VerticalAlignment = VerticalAlignment.Bottom;
                    startBtn.Margin = new Thickness(0, -30, 15, 0);
                    Panel.SetZIndex(startBtn, 10);
                    startBtn.Click += new RoutedEventHandler((sender, e) => play_click(this, e, card.Name, dir));

                    var image = new Image();
                    image.Source = new BitmapImage(new Uri(@"/Images/block.png", UriKind.Relative));
                    image.Stretch = Stretch.UniformToFill;
                    image.VerticalAlignment = VerticalAlignment.Top;
                    image.Height = 130;



                    /*LinearGradientBrush OpacityBrushReset = new LinearGradientBrush();
                    GradientStop TransparentStopReset = new GradientStop(Colors.Transparent, 0);
                    OpacityBrushReset.GradientStops.Add(TransparentStopReset);
                    image.OpacityMask = OpacityBrushReset;*/


                    var title = new Label();
                    title.Foreground = new SolidColorBrush(Colors.White);
                    title.FontSize = 20;
                    title.FontWeight = FontWeights.ExtraBold;
                    title.Margin = new Thickness(0, -130, 0, 0);
                    title.HorizontalAlignment = HorizontalAlignment.Center;
                    title.HorizontalContentAlignment = HorizontalAlignment.Center;
                    title.VerticalAlignment = VerticalAlignment.Center;
                    title.VerticalContentAlignment = VerticalAlignment.Center;
                    title.Content = new DirectoryInfo(dir).Name;
                    title.Cursor = Cursors.Hand;
                    title.ToolTip = "Manage";
                    title.Height = 130;
                    title.Width = 230;
                    image.Opacity = 1;
                    title.MouseEnter += (ss, ee) => {
                        DoubleAnimation da = new DoubleAnimation();
                        da.From = 1;
                        da.To = 0.6;
                        da.Duration = new Duration(TimeSpan.FromSeconds(0.125));
                        image.BeginAnimation(OpacityProperty, da);
                    };

                    title.MouseLeave += (ss, ee) => {
                        DoubleAnimation da = new DoubleAnimation();
                        da.From = 0.6;
                        da.To = 1;
                        da.Duration = new Duration(TimeSpan.FromSeconds(0.125));
                        image.BeginAnimation(OpacityProperty, da);
                    };
                    title.MouseLeftButtonUp += async (ss, ee) =>
                    {
                        await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.ManagePack(dir), "RootDialog");
                        await ModpacksUpdate();
                    };


                    var datastackpanel = new StackPanel();
                    topStackPanel.Children.Add(image);
                    topStackPanel.Children.Add(title);
                    insiderStackPanel.Children.Add(topStackPanel);
                    insiderStackPanel.Children.Add(startBtn);
                    insiderStackPanel.Children.Add(datastackpanel);


                    var minecraftversion = new Label();
                    minecraftversion.HorizontalAlignment = HorizontalAlignment.Center;
                    minecraftversion.Content = "Version: " + mcversion;
                    datastackpanel.Children.Add(minecraftversion);


                    var ForgeVersion = new Label();
                    ForgeVersion.HorizontalAlignment = HorizontalAlignment.Center;
                    if (forge != "false")
                    {
                        ForgeVersion.Content = "Forge Version: " + forge;
                    }
                    else
                    {
                        ForgeVersion.Content = "Vanilla";
                    }
                    datastackpanel.Children.Add(ForgeVersion);


                    var buttonStackPanel = new StackPanel();
                    buttonStackPanel.Orientation = Orientation.Horizontal;
                    buttonStackPanel.HorizontalAlignment = HorizontalAlignment.Center;
                    buttonStackPanel.Margin = new Thickness(12, 26, 12, 12);
                    datastackpanel.Children.Add(buttonStackPanel);

                    Style btnStyle = Application.Current.FindResource("MaterialDesignToolButton") as Style;


                    var folderButton = new Button();
                    var iconpackfolder = new MaterialDesignThemes.Wpf.PackIcon();
                    iconpackfolder.Kind = MaterialDesignThemes.Wpf.PackIconKind.Folder;
                    folderButton.Content = iconpackfolder;
                    MaterialDesignThemes.Wpf.RippleAssist.SetIsCentered(folderButton, true);
                    folderButton.Width = 30;
                    folderButton.Style = btnStyle;
                    folderButton.Margin = new Thickness(0, 0, 0, 0);
                    folderButton.ToolTip = "Open Pack's Folder";
                    folderButton.Padding = new Thickness(2, 0, 2, 0);//delete_click(this, e, card.Name, dir)
                    folderButton.Click += new RoutedEventHandler((sender, e) =>
                    {
                        // combine the arguments together
                        // it doesn't matter if there is a space after ','
                        string argument = "\"" + dir + "\"";

                        System.Diagnostics.Process.Start("explorer.exe", argument);
                    });

                    var manageBtn = new Button();
                    var iconpackwrench = new MaterialDesignThemes.Wpf.PackIcon();
                    iconpackwrench.Kind = MaterialDesignThemes.Wpf.PackIconKind.Wrench;
                    manageBtn.Content = iconpackwrench;
                    manageBtn.Width = 30;
                    MaterialDesignThemes.Wpf.RippleAssist.SetIsCentered(manageBtn, true);
                    manageBtn.Margin = new Thickness(0, 0, 0, 0);
                    manageBtn.Padding = new Thickness(2, 0, 2, 0);
                    manageBtn.ToolTip = "Manage This Pack";
                    manageBtn.Style = btnStyle;
                    manageBtn.Click += new RoutedEventHandler(async (sender, e) => {
                        await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.ManagePack(dir), "RootDialog");
                        await ModpacksUpdate();
                    });

                    var deletebutton = new Button();
                    var iconpackdelete = new MaterialDesignThemes.Wpf.PackIcon();
                    iconpackdelete.Kind = MaterialDesignThemes.Wpf.PackIconKind.Delete;
                    deletebutton.Content = iconpackdelete;
                    MaterialDesignThemes.Wpf.RippleAssist.SetIsCentered(deletebutton, true);
                    deletebutton.Width = 30;
                    deletebutton.Foreground = (SolidColorBrush)(new BrushConverter().ConvertFrom("#F44336"));
                    deletebutton.Style = btnStyle;
                    deletebutton.Margin = new Thickness(0, 0, 0, 0);
                    deletebutton.ToolTip = "Delete This Pack";
                    deletebutton.Padding = new Thickness(2, 0, 2, 0);//delete_click(this, e, card.Name, dir)
                    deletebutton.Click += new RoutedEventHandler(async (sender, e) =>
                    {
                        deletebutton.IsEnabled = false;
                        MaterialDesignThemes.Wpf.ButtonProgressAssist.SetIsIndicatorVisible(startBtn, true);
                        MaterialDesignThemes.Wpf.ButtonProgressAssist.SetIsIndeterminate(startBtn, true);
                        MaterialDesignThemes.Wpf.ButtonProgressAssist.SetIndicatorForeground(startBtn, (SolidColorBrush)(new BrushConverter().ConvertFrom("#183b45")));
                        MaterialDesignThemes.Wpf.Card actual = (MaterialDesignThemes.Wpf.Card)modpacksListContainer.FindName(card.Name);
                        await Task.Delay(500);
                        try
                        {
                            if (Directory.Exists(dir))
                            {
                                await Task.Run(() => Directory.Delete(dir, true));
                            }
                        }
                        catch (Exception)
                        {
                            MessageBox.Show("Cannot delete directory. Try again");
                        }
                        if (!Directory.Exists(config.M_F_P + "Packs\\"))
                        {
                            Directory.CreateDirectory(config.M_F_P + "Packs\\");
                        }
                        await ModpacksUpdate();
                    });


                    buttonStackPanel.Children.Add(folderButton);
                    //buttonStackPanel.Children.Add(manageBtn);
                    buttonStackPanel.Children.Add(deletebutton);
                    modpacksListContainer.Children.Add(card);
                }

            }
            Style styleaddNew = Application.Current.FindResource("MaterialDesignFloatingActionButton") as Style;

            var addNewBtn = new Button();
            var iconpackplus = new MaterialDesignThemes.Wpf.PackIcon();
            iconpackplus.Kind = MaterialDesignThemes.Wpf.PackIconKind.Plus;
            addNewBtn.ToolTip = "Add New Instance";
            addNewBtn.Content = iconpackplus;
            addNewBtn.Foreground = new SolidColorBrush(Colors.White);
            addNewBtn.Style = styleaddNew;
            addNewBtn.HorizontalAlignment = HorizontalAlignment.Center;
            addNewBtn.VerticalAlignment = VerticalAlignment.Center;
            Panel.SetZIndex(addNewBtn, 10);
            addNewBtn.Click += new RoutedEventHandler(async (sender, e) =>
            {
                await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.InstallModpack(), "RootDialog");
                if (!Directory.Exists(config.M_F_P + "Packs\\"))
                {
                    Directory.CreateDirectory(config.M_F_P + "Packs\\");
                }
                await ModpacksUpdate();
            });


            var addNew = new MaterialDesignThemes.Wpf.Card();
            addNew.Height = 285;
            addNew.Width = 240;
            addNew.Margin = new Thickness(0, 3, 10, 10);
            addNew.HorizontalAlignment = HorizontalAlignment.Left;
            addNew.Content = addNewBtn;

            modpacksListContainer.Children.Add(addNew);
        }

        void play_click(object sender, RoutedEventArgs e, string card, string dir)
        {
            MaterialDesignThemes.Wpf.Card actual = (MaterialDesignThemes.Wpf.Card)modpacksListContainer.FindName(card);
            try
            {
                var json = System.IO.File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
            }
            catch (FileNotFoundException)
            {
                MessageBox.Show("This cannot be run. We suggest you to delete it");
                return;
            }

            Classes.MinecraftStarter.Minecraft_Start(dir);
        }

        private void ScrollViewer_PreviewMouseWheel(object sender, MouseWheelEventArgs e)
        {
            ScrollViewer scrollviewer = sender as ScrollViewer;
            if (e.Delta > 0)
            {
                scrollviewer.LineLeft();
                scrollviewer.LineLeft();
                scrollviewer.LineLeft();
                scrollviewer.LineLeft();
                scrollviewer.LineLeft();
                scrollviewer.LineLeft();
            }
            else
            {
                scrollviewer.LineRight();
                scrollviewer.LineRight();
                scrollviewer.LineRight();
                scrollviewer.LineRight();
                scrollviewer.LineRight();
                scrollviewer.LineRight();

            }
            e.Handled = true;
        }

        private static async void ExtendedOpenedEventHandler(object sender, MaterialDesignThemes.Wpf.DialogOpenedEventArgs eventArgs)
        {
            await Task.Delay(1200);
            eventArgs.Session.Close();
        }


        private async void server_Click(object sender, RoutedEventArgs e)
        {
            await MaterialDesignThemes.Wpf.DialogHost.Show(Pages.Home.singleton.serverList, "RootDialog");

        }
    }
}
