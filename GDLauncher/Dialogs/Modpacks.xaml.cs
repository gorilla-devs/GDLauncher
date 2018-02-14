using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using GDLauncher.Pages;
using GDLauncher.Properties;
using MaterialDesignThemes.Wpf;
using Newtonsoft.Json;

namespace GDLauncher.Dialogs
{
    /// <summary>
    ///     Interaction logic for Modpacks.xaml
    /// </summary>
    public class CurseRoot
    {
        public List<data> Data { get; set; }
    }

    public class data
    {
        public string Name { get; set; }
        public CategorySection CategorySection { get; set; }
        public Attachments[] Attachments { get; set; }
        public Authors[] Authors { get; set; }
        public string PrimaryCategoryAvatarUrl { get; set; }
        public string PrimaryCategoryName { get; set; }

        public string DownloadCount { get; set; }
        public int IsFeatured { get; set; }
        public double PopularityScore { get; set; }
        public string Summary { get; set; }
    }

    public class Attachments
    {
        public string ThumbnailUrl { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public string Title { get; set; }
        public bool IsDefault { get; set; }
    }

    public class Authors
    {
        public string Name { get; set; }
        public string Url { get; set; }
    }

    public class CategorySection
    {
        public string Name { get; set; }
    }

    public partial class Modpacks
    {
        public static int numberOfObjectsPerPage = 3;
        public static int actualPage;


        public Modpacks()
        {
            InitializeComponent();
            DialogHostExtensions.SetCloseOnClickAway(this, true);
            DataContext = this;
        }

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            var vanillaBtn = new Button
            {
                Content = new StackPanel
                {
                    Orientation = Orientation.Horizontal,
                    VerticalAlignment = VerticalAlignment.Center,
                    Children =
                    {
                        new PackIcon
                        {
                            Width = 70,
                            Height = 70,
                            Kind = PackIconKind.CubeOutline
                        },
                        new Label
                        {
                            Content = "Vanilla",
                            FontSize = 32,
                            VerticalAlignment = VerticalAlignment.Center,
                            Foreground = (SolidColorBrush) new BrushConverter().ConvertFrom("#00A843")
                        }
                    }
                },
                FontSize = 24,
                Width = 255,
                Height = 140,
                Style = Application.Current.FindResource("MaterialDesignFlatButton") as Style

            };
            vanillaBtn.Click += async (ss, ee) =>
            {
                var x = await DialogHost.Show(new VanillaInstallDialog(), "ModpacksDialog");
                if (x != null)
                {
                    dynamic result = x;
                    await DialogHost.Show(new InstallDialog(result.instanceName, result.MCVersion, null), "ModpacksDialog");
                    //use the message queue to send a message.
                    var messageQueue = SnackbarThree.MessageQueue;
                    var message = "Installed. Enjoy :)";

                    //the message queue can be called from any thread
                    Task.Factory.StartNew(() => messageQueue.Enqueue(message));
                }
            };
            var vanilla = new Card
            {
                Height = 140,
                Width = 255,
                Margin = new Thickness(0, 0, 10, 10),
                Content = vanillaBtn
            };
            var forgeBtn = new Button
            {
                Content = new StackPanel
                {
                    Orientation = Orientation.Horizontal,
                    VerticalAlignment = VerticalAlignment.Center,
                    Children =
                    {
                        new PackIcon
                        {
                            Width = 70,
                            Height = 70,
                            Kind = PackIconKind.Minecraft
                        },
                        new Label
                        {
                            Content = "Forge",
                            FontSize = 32,
                            VerticalAlignment = VerticalAlignment.Center,
                            Foreground = (SolidColorBrush) new BrushConverter().ConvertFrom("#00A843")
                        }
                    }
                },
                FontSize = 24,
                Width = 255,
                Height = 140,
                Style = Application.Current.FindResource("MaterialDesignFlatButton") as Style

            };
            forgeBtn.Click += async (ss, ee) =>
            {
                var x = await DialogHost.Show(new ForgeInstallDialog(), "ModpacksDialog");
                if (x != null)
                {
                    dynamic result = x;
                    await DialogHost.Show(new InstallDialog(result.instanceName, result.MCVersion, result.forgeVersion), "ModpacksDialog");
                    //use the message queue to send a message.
                    var messageQueue = SnackbarThree.MessageQueue;
                    var message = "Installed. Enjoy :)";

                    //the message queue can be called from any thread
                    Task.Factory.StartNew(() => messageQueue.Enqueue(message));
                }
            };
            var forge = new Card
            {
                Height = 140,
                Width = 255,
                Margin = new Thickness(0, 0, 0, 11),
                Content = forgeBtn
            };
            defaultStackPanel.Children.Add(vanilla);
            defaultStackPanel.Children.Add(forge);

            if (Home.singleton.CurseData == null)
            {
                Home.singleton.CurseData = new CurseRoot();
                Home.singleton.CurseData.Data = await Task.Run(() =>
                    JsonConvert.DeserializeObject<CurseRoot>(File.ReadAllText(config.M_F_P + "complete.json"))
                        .Data.Where(s => s.CategorySection.Name == "Modpacks").ToList());
            }
            Packs.Items.Clear();
            sv.ScrollChanged += ScrollViewer_ScrollChanged;

            addPacks(0);
            GC.Collect();
        }

        private void addPacks(int from, string search = "")
        {
            foreach (var loc in Home.singleton.CurseData.Data.Where(s => s.CategorySection.Name == "Modpacks" && s.Name.ToLower().Contains(search.ToLower()))
                .OrderByDescending(p => p.PopularityScore).Skip(numberOfObjectsPerPage * from)
                .Take(numberOfObjectsPerPage))
            {
                var leftStackPanel = new StackPanel
                {
                    Children =
                    {
                        new Grid
                        {
                            Children =
                            {
                                new ProgressBar
                                {
                                    IsIndeterminate = true,
                                    Style = Application.Current.FindResource("MaterialDesignCircularProgressBar") as Style
                                },
                                new Image
                                {
                                    Source = new BitmapImage(new Uri(loc.Attachments.Where(p => p.IsDefault)
                                        .FirstOrDefault()
                                        .ThumbnailUrl)),
                                    Width = 100,
                                    Height = 100,
                                    VerticalAlignment = VerticalAlignment.Top
                                }
                            }
                        },
                        new StackPanel
                        {
                            Orientation = Orientation.Horizontal,
                            HorizontalAlignment = HorizontalAlignment.Left,
                            Children =
                            {
                                new Image
                                {
                                    Source = new BitmapImage(new Uri(loc.PrimaryCategoryAvatarUrl)),
                                    Height = 17,
                                    Width = 17,
                                    Margin = new Thickness(10, 10, 0, 10),
                                    ToolTip = loc.PrimaryCategoryName
                                },
                                new PackIcon()
                                {
                                    Visibility = loc.IsFeatured == 1 ? Visibility.Visible : Visibility.Hidden,
                                    Kind = PackIconKind.Star,
                                    Margin = new Thickness(10, 10, 0, 10),
                                    Width = 17,
                                    Height = 17,
                                    ToolTip = "Featured",
                                    Foreground = (SolidColorBrush)new BrushConverter().ConvertFrom("#f7cd24")
                                }
                            }
                        }
                    }
                };

                var card = new Card
                {
                    MinHeight = 160,
                    Margin = new Thickness(0, 3, 0, 0),
                    Effect = new DropShadowEffect
                    {
                        BlurRadius = 0,
                        ShadowDepth = 0,
                        Direction = 270,
                        Opacity = .42,
                        RenderingBias = RenderingBias.Performance
                    }
                };
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

                //MAIN CONTENT

                var authors = loc.Authors.Aggregate("Authors: ",
                    (str, s) => str += s.Name + ", ",
                    str => str.Substring(0, str.Length - 2));


                var installBtn = new Button
                {
                    Style = Application.Current.FindResource("MaterialDesignRaisedButton") as Style,
                    Content = "Install",
                    HorizontalAlignment = HorizontalAlignment.Right,
                    VerticalAlignment = VerticalAlignment.Bottom,
                    Margin = new Thickness(0, 20, 0, 10)
                };
                ButtonProgressAssist.SetValue(installBtn, 30);
                //installBtn.Click += async (ss, ee) => { await DialogHost.Show(new Dialogs.InstallDialog(), "ModpacksDialog"); };
                var contentStackPanel = new StackPanel
                {
                    Orientation = Orientation.Vertical,
                    Width = 370,
                    Children =
                    {
                        new Label
                        {
                            Content = loc.Name,
                            HorizontalAlignment = HorizontalAlignment.Left,
                            FontSize = 19
                        },
                        new Label
                        {
                            HorizontalAlignment = HorizontalAlignment.Left,
                            Content = authors
                        },
                        new TextBlock
                        {
                            Text = loc.Summary,
                            TextWrapping = TextWrapping.Wrap,
                            Margin = new Thickness(10, 0, 10, 0),
                            MinHeight = 70
                        },
                        installBtn
                    }
                };

                //THE END
                var mainStackPanel = new StackPanel
                {
                    Orientation = Orientation.Horizontal
                };
                mainStackPanel.Children.Add(leftStackPanel);
                mainStackPanel.Children.Add(contentStackPanel);
                card.Content = mainStackPanel;
                Packs.Items.Add(card);
            }
        }

        private void ScrollViewer_ScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            var verticalOffset = sv.VerticalOffset;
            var maxVerticalOffset = sv.ScrollableHeight; //sv.ExtentHeight - sv.ViewportHeight;

            if (maxVerticalOffset < 0 ||
                verticalOffset == maxVerticalOffset)
            {
                // Scrolled to bottom
                actualPage++;
                addPacks(actualPage, search.Text);
            }
        }

        private async void TextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            TextBox tb = (TextBox)sender;
            int startLength = tb.Text.Length;

            await Task.Delay(400);
            if (startLength == tb.Text.Length)
            {
                sv.ScrollToTop();
                Packs.Items.Clear();
                addPacks(0, search.Text);
            }
        }
    }
}