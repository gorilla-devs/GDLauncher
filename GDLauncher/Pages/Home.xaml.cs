// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Pagina principale del launcher, nonche' quella iniziale*/

using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Threading;
using GDLauncher.Classes;
using GDLauncher.Dialogs;
using GDLauncher.Properties;
using MaterialDesignThemes.Wpf;
using Newtonsoft.Json;

namespace GDLauncher.Pages
{
    /// <summary>
    ///     Logica di interazione per Home.xaml
    /// </summary>
    public partial class Home : Page
    {
        public static ModpackLoading loading = new ModpackLoading();
        public static Home singleton;
        public ServerList serverList = new ServerList();
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
            if (!Directory.Exists(config.M_F_P + "Packs\\")) Directory.CreateDirectory(config.M_F_P + "Packs\\");
            ModpacksUpdate();
            if (Settings.Default["firstTimeHowTo"].ToString() == "true")
                await DialogHost.Show(new HowTo(), "RootDialog");
            if (Settings.Default["justUpdated"].ToString() == "true")
            {
                await DialogHost.Show(new Changelog(), "RootDialog");
                Settings.Default["justUpdated"] = "false";
                Settings.Default.Save();
            }

            if (Settings.Default.premiumUsername != "")
            {
                //use the message queue to send a message.
                var messageQueue = SnackbarThree.MessageQueue;
                var message = "Welcome back " + Settings.Default.premiumUsername + "! :)";

                //the message queue can be called from any thread
                Task.Factory.StartNew(() => messageQueue.Enqueue(message));
            }

            //mainLogo.Cursor = Cursors.Hand;
            mainLogo.MouseEnter += (ss, eee) =>
            {
                var da = new DoubleAnimation();
                da.From = 1;
                da.To = 0.6;
                da.Duration = new Duration(TimeSpan.FromSeconds(0.125));
                mainLogo.BeginAnimation(OpacityProperty, da);
            };

            mainLogo.MouseLeave += (ss, eee) =>
            {
                var da = new DoubleAnimation();
                da.From = 0.6;
                da.To = 1;
                da.Duration = new Duration(TimeSpan.FromSeconds(0.125));
                mainLogo.BeginAnimation(OpacityProperty, da);
            };
        }


        public void ModpacksUpdate()
        {
            modpacksListContainer.Children.Clear();
            var dirlist = Directory.GetDirectories(config.M_F_P + "Packs\\");
            if (dirlist.Count() != 0)
                foreach (var dir in dirlist)
                {
                    string mcversion;
                    string forge;
                    try
                    {
                        var json = File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
                        dynamic jObj = JsonConvert.DeserializeObject(json);
                        mcversion = jObj.mc_version;
                        forge = jObj.forgeVersion;
                    }
                    catch (FileNotFoundException)
                    {
                        continue;
                    }
                    catch (JsonException)
                    {
                        MessageBox.Show("Error while parsing " + "card" + new DirectoryInfo(dir.Replace(" ", "")).Name);
                        continue;
                    }

                    var card = new Card
                    {
                        Name = "card" + new DirectoryInfo(dir.Replace(" ", "")).Name,
                        Height = 285,
                        Width = 270,
                        Margin = new Thickness(0, 3, 10, 10),
                        HorizontalAlignment = HorizontalAlignment.Left,
                        Effect = new DropShadowEffect
                        {
                            BlurRadius = 0,
                            ShadowDepth = 0,
                            Direction = 270,
                            Opacity = .42,
                            RenderingBias = RenderingBias.Performance,
                        }
                    };

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

                    var insiderStackPanel = new StackPanel();
                    var topStackPanel = new StackPanel
                    {
                        Background = new SolidColorBrush(Colors.Black),
                        Height = 130,
                        Width = 270
                    };
                    card.Content = insiderStackPanel;
                    //INSIDE STACKPANEL

                    var buttonstyle = Application.Current.FindResource("MaterialDesignFloatingActionButton") as Style;

                    var startBtn = new Button();
                    var iconpackplay = new PackIcon();
                    iconpackplay.Kind = PackIconKind.Play;
                    startBtn.ToolTip = "Start Pack";
                    startBtn.Content = iconpackplay;
                    startBtn.Foreground = new SolidColorBrush(Colors.White);
                    startBtn.Style = buttonstyle;
                    startBtn.HorizontalAlignment = HorizontalAlignment.Right;
                    startBtn.VerticalAlignment = VerticalAlignment.Bottom;
                    startBtn.Margin = new Thickness(0, -30, 15, 0);
                    Panel.SetZIndex(startBtn, 10);
                    startBtn.Click += (sender, e) => play_click(this, e, card.Name, dir);

                    var image = new Image();
                    image.Source = new BitmapImage(new Uri(@"/Images/block.png", UriKind.Relative));
                    image.Stretch = Stretch.UniformToFill;
                    image.VerticalAlignment = VerticalAlignment.Top;
                    image.Height = 130;


                    var title = new Label
                    {
                        Foreground = new SolidColorBrush(Colors.White),
                        FontSize = 26,
                        //title.FontWeight = FontWeights.ExtraBold;
                        FontFamily = new FontFamily(new Uri("pack://application:,,,/Assets/"), "./#" + Settings.Default["instancesFont"]),
                        Margin = new Thickness(0, -120, 0, 0),
                        HorizontalAlignment = HorizontalAlignment.Center,
                        HorizontalContentAlignment = HorizontalAlignment.Center,
                        VerticalAlignment = VerticalAlignment.Center,
                        VerticalContentAlignment = VerticalAlignment.Center,
                        Content = new DirectoryInfo(dir).Name,
                        Height = 130,
                        Width = 270
                    };
                    image.Opacity = 1;
                    card.MouseEnter += (ss, ee) =>
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
                        card.Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                        card.Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);


                    };

                    card.MouseLeave += (ss, ee) =>
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
                        card.Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                        card.Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);

                    };
                    /*card.MouseLeftButtonUp += async (ss, ee) =>
                    {
                        await DialogHost.Show(new ManagePack(dir), "RootDialog");
                        ModpacksUpdate();
                    };*/


                    var datastackpanel = new StackPanel();
                    datastackpanel.Margin = new Thickness(10, -13, 10, 0);
                    topStackPanel.Children.Add(image);
                    topStackPanel.Children.Add(title);
                    insiderStackPanel.Children.Add(topStackPanel);
                    insiderStackPanel.Children.Add(startBtn);
                    insiderStackPanel.Children.Add(datastackpanel);


                    var minecraftversion = new Chip
                    {
                        HorizontalAlignment = HorizontalAlignment.Left,
                        Content = mcversion,
                        Icon = "V",
                        Cursor = Cursors.Arrow
                    };
                    datastackpanel.Children.Add(minecraftversion);


                    var forgeVersion = new Chip
                    {
                        HorizontalAlignment = HorizontalAlignment.Left,
                        Margin = new Thickness(0, 8, 0, 0),
                        Cursor = Cursors.Arrow
                    };
                    if (forge != null)
                    {
                        forgeVersion.Icon = "F";
                        forgeVersion.Content = forge;
                        datastackpanel.Children.Add(forgeVersion);
                    }


                    var buttonStackPanel = new StackPanel
                    {
                        Orientation = Orientation.Horizontal,
                        HorizontalAlignment = HorizontalAlignment.Center,
                        Margin = new Thickness(12, 0, 12, 0)
                    };

                    var separator = new Separator
                    {
                        Height = 0.6,
                        Margin = (forge == null) ? new Thickness(0, 50, 0, 7) : new Thickness(0, 10, 0, 7)
                    };
                    insiderStackPanel.Children.Add(separator);
                    insiderStackPanel.Children.Add(buttonStackPanel);

                    var btnStyle = Application.Current.FindResource("MaterialDesignToolButton") as Style;


                    var folderButton = new Button();
                    var iconpackfolder = new PackIcon
                    {
                        Kind = PackIconKind.Folder
                    };
                    folderButton.Content = iconpackfolder;
                    RippleAssist.SetIsCentered(folderButton, true);
                    folderButton.Width = 30;
                    folderButton.Style = btnStyle;
                    folderButton.Margin = new Thickness(0, 0, 0, 0);
                    folderButton.ToolTip = "Open Pack's Folder";
                    folderButton.Padding = new Thickness(2, 0, 2, 0); //delete_click(this, e, card.Name, dir)
                    folderButton.Click += (sender, e) =>
                    {
                        // combine the arguments together
                        // it doesn't matter if there is a space after ','
                        var argument = "\"" + dir + "\"";

                        Process.Start("explorer.exe", argument);
                    };



                    var manageBtn = new Button();
                    var iconpackwrench = new MaterialDesignThemes.Wpf.PackIcon();
                    iconpackwrench.Kind = MaterialDesignThemes.Wpf.PackIconKind.PlusCircle;
                    manageBtn.Content = iconpackwrench;
                    manageBtn.Width = 30;
                    MaterialDesignThemes.Wpf.RippleAssist.SetIsCentered(manageBtn, true);
                    manageBtn.Margin = new Thickness(0, 0, 0, 0);
                    manageBtn.Padding = new Thickness(2, 0, 2, 0);
                    manageBtn.ToolTip = "Add Mods";
                    manageBtn.Style = btnStyle;
                    manageBtn.Click += async (sender, e) => {
                        await MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.ManagePack(dir), "RootDialog");
                        ModpacksUpdate();
                    };

                    var deletebutton = new Button();
                    var iconpackdelete = new PackIcon
                    {
                        Kind = PackIconKind.Delete
                    };
                    deletebutton.Content = iconpackdelete;
                    RippleAssist.SetIsCentered(deletebutton, true);
                    deletebutton.Width = 30;
                    deletebutton.Foreground = (SolidColorBrush)new BrushConverter().ConvertFrom("#F44336");
                    deletebutton.Style = btnStyle;
                    deletebutton.Margin = new Thickness(0, 0, 0, 0);
                    deletebutton.ToolTip = "Delete This Pack";
                    deletebutton.Padding = new Thickness(2, 0, 2, 0); //delete_click(this, e, card.Name, dir)
                    deletebutton.Click += async (sender, e) =>
                    {
                        deletebutton.IsEnabled = false;
                        ButtonProgressAssist.SetIsIndicatorVisible(startBtn, true);
                        ButtonProgressAssist.SetIsIndeterminate(startBtn, true);
                        ButtonProgressAssist.SetIndicatorForeground(startBtn,
                            (SolidColorBrush)new BrushConverter().ConvertFrom("#183b45"));
                        var actual = (Card)modpacksListContainer.FindName(card.Name);
                        await Task.Delay(500);
                        try
                        {
                            if (Directory.Exists(dir)) await Task.Run(() => Directory.Delete(dir, true));
                        }
                        catch (Exception)
                        {
                            MessageBox.Show("Cannot delete directory. Try again");
                        }

                        if (!Directory.Exists(config.M_F_P + "Packs\\"))
                            Directory.CreateDirectory(config.M_F_P + "Packs\\");
                        ModpacksUpdate();
                    };


                    var popupbox = new PopupBox
                    {
                        StaysOpen = false,
                        PlacementMode = PopupBoxPlacementMode.RightAndAlignTopEdges,
                    };
                    var popupBoxStackPanel = new StackPanel
                    {
                        //Width = 300,
                        //Height = 300
                    };
                    popupbox.PopupContent = popupBoxStackPanel;
                    var duplicateStackPanel = new StackPanel
                    {
                        Orientation = Orientation.Horizontal,
                        VerticalAlignment = VerticalAlignment.Center,
                        Margin = new Thickness(0, 20, 0, 0)
                    };

                    var duplicatePackIcon = new PackIcon
                    {
                        Kind = PackIconKind.ContentDuplicate,
                        VerticalAlignment = VerticalAlignment.Center
                    };

                    var duplicateLabel = new Label
                    {
                        Content = "Duplicate",
                        VerticalAlignment = VerticalAlignment.Center
                    };

                    duplicateStackPanel.Children.Add(duplicatePackIcon);
                    duplicateStackPanel.Children.Add(duplicateLabel);

                    var renameDockPanel = new StackPanel
                    {
                        Orientation = Orientation.Horizontal,
                        VerticalAlignment = VerticalAlignment.Center,
                        Margin = new Thickness(0, 20, 0, 0)

                    };

                    var renamePackIcon = new PackIcon
                    {
                        Kind = PackIconKind.RenameBox,
                        VerticalAlignment = VerticalAlignment.Center
                    };

                    var renameLabel = new Label
                    {
                        Content = "Rename",
                        VerticalAlignment = VerticalAlignment.Center
                    };

                    renameDockPanel.Children.Add(renamePackIcon);
                    renameDockPanel.Children.Add(renameLabel);


                    var duplicateButton = new Button
                    {
                        Content = duplicateStackPanel,
                        VerticalContentAlignment = VerticalAlignment.Center,
                        VerticalAlignment = VerticalAlignment.Center
                    };
                    duplicateButton.Click += async (sender, args) =>
                    {
                        await DialogHost.Show(new Dialogs.DuplicateInstance(dir));
                        ModpacksUpdate();
                    };
                    popupBoxStackPanel.Children.Add(duplicateButton);

                    var renameButton = new Button
                    {
                        Content = renameDockPanel,
                        VerticalContentAlignment = VerticalAlignment.Center,
                        VerticalAlignment = VerticalAlignment.Center
                    };
                    renameButton.Click += async (sender, args) =>
                    {
                        await DialogHost.Show(new Dialogs.RenameInstance(dir));
                        ModpacksUpdate();
                    };
                    popupBoxStackPanel.Children.Add(renameButton);


                    Panel.SetZIndex(popupBoxStackPanel, 100);
                    RippleAssist.SetIsCentered(popupbox, false);


                    buttonStackPanel.Children.Add(folderButton);
                    buttonStackPanel.Children.Add(manageBtn);
                    buttonStackPanel.Children.Add(deletebutton);
                    buttonStackPanel.Children.Add(popupbox);
                    modpacksListContainer.Children.Add(card);
                }

            var styleaddNew = Application.Current.FindResource("MaterialDesignFloatingActionButton") as Style;

            var addNewBtn = new Button();
            var iconpackplus = new PackIcon
            {
                Kind = PackIconKind.Plus
            };
            addNewBtn.ToolTip = "Add New Instance";
            addNewBtn.Content = iconpackplus;
            addNewBtn.Foreground = new SolidColorBrush(Colors.White);
            addNewBtn.Style = styleaddNew;
            addNewBtn.HorizontalAlignment = HorizontalAlignment.Center;
            addNewBtn.VerticalAlignment = VerticalAlignment.Center;
            Panel.SetZIndex(addNewBtn, 10);
            addNewBtn.Click += async (sender, e) =>
            {
                var installModpack = new Modpacks();
                await DialogHost.Show(installModpack, "RootDialog");
                GC.Collect();

                if (!Directory.Exists(config.M_F_P + "Packs\\")) Directory.CreateDirectory(config.M_F_P + "Packs\\");
                ModpacksUpdate();
            };


            var addNew = new Card
            {
                Height = 285,
                Width = 270,
                Margin = new Thickness(0, 3, 10, 10),
                HorizontalAlignment = HorizontalAlignment.Left,
                Content = addNewBtn,
                Effect = new DropShadowEffect
                {
                    BlurRadius = 0,
                    ShadowDepth = 0,
                    Direction = 270,
                    Opacity = .42,
                    RenderingBias = RenderingBias.Performance,
                }
            };
            addNew.MouseEnter += (ss, ee) =>
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
                addNew.Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                addNew.Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);


            };

            addNew.MouseLeave += (ss, ee) =>
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
                addNew.Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                addNew.Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);

            };


            modpacksListContainer.Children.Add(addNew);
        }

        private void play_click(object sender, RoutedEventArgs e, string card, string dir)
        {
            try
            {
                var json = File.ReadAllText(dir + "\\" + new DirectoryInfo(dir).Name + ".json");
            }
            catch (FileNotFoundException)
            {
                MessageBox.Show("This cannot be run. We suggest you to delete it");
                return;
            }

            MinecraftStarter.Minecraft_Start(dir);
        }

        private void ScrollViewer_PreviewMouseWheel(object sender, MouseWheelEventArgs e)
        {
            var scrollviewer = sender as ScrollViewer;
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

        private static async void ExtendedOpenedEventHandler(object sender, DialogOpenedEventArgs eventArgs)
        {
            await Task.Delay(1200);
            eventArgs.Session.Close();
        }


        private async void server_Click(object sender, RoutedEventArgs e)
        {
            await DialogHost.Show(singleton.serverList, "RootDialog");
        }
    }
}