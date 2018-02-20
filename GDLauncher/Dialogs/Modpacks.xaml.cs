using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using GDLauncher.Classes;
using GDLauncher.Pages;
using GDLauncher.Properties;
using Ionic.Zip;
using MaterialDesignThemes.Wpf;
using Newtonsoft.Json;
using ComboBoxItem = System.Windows.Controls.ComboBoxItem;

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
        public int Id { get; set; }
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

    public class Fileino
    {
        public int fileID { get; set; }
        public int projectID { get; set; }
        public bool required { get; set; }
    }

    public class ModLoader
    {
        public string id { get; set; }
        public bool primary { get; set; }
    }

    public class Minecraft
    {
        public List<ModLoader> modLoaders { get; set; }
        public string version { get; set; }
    }

    public class ModpackManifest
    {
        public string author { get; set; }
        public List<Fileino> files { get; set; }
        public string manifestType { get; set; }
        public int manifestVersion { get; set; }
        public Minecraft minecraft { get; set; }
        public string name { get; set; }
        public string overrides { get; set; }
        public int projectID { get; set; }
        public string version { get; set; }
    }

    public partial class Modpacks : INotifyPropertyChanged
    {
        public static int numberOfObjectsPerPage = 5;
        public static int actualPage;
        public CurseRoot CurseData { get; set; }

        public ObservableCollection<Card> _packs { get; set; }


        public Modpacks()
        {
            DataContext = this;
            _packs = new ObservableCollection<Card>();
            InitializeComponent();
            DialogHostExtensions.SetCloseOnClickAway(this, true);
        }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
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

                CurseData = new CurseRoot();
                CurseData.Data = await Task.Run(async () =>
                JsonConvert.DeserializeObject<List<data>>(File.ReadAllText(config.M_F_P + "complete.json"))
                    .ToList());
            loading.Visibility = Visibility.Collapsed;
            //Packs.Items.Clear();
            sv.ScrollChanged += ScrollViewer_ScrollChanged;
            addPacks(0);
        }

        private void addPacks(int from, string search = "")
        {
            foreach (var loc in CurseData.Data.Where(s => s.CategorySection.Name == "Modpacks" && s.Name.ToLower().Contains(search.ToLower()))
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
                    /*Effect = new DropShadowEffect
                    {
                        BlurRadius = 0,
                        ShadowDepth = 0,
                        Direction = 270,
                        Opacity = .42,
                        RenderingBias = RenderingBias.Performance
                    }*/
                };
                /*card.MouseEnter += (ss, ee) =>
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
                };*/

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
                installBtn.Click += async (ss, ee) =>
                {
                    var x = await DialogHost.Show(new ModpackInstallDialog(loc.Id), "ModpacksDialog");
                    if (x != null)
                    {
                        dynamic y = x;
                        string url = "";
                        foreach (var locx in await CurseApis.getVersions(loc.Id))
                        {
                            if (locx.Name == y.version)
                            {
                                url = locx.URL;
                                break;
                            }
                        }
                        installBtn.Content = "Downloading..";

                        var webClient = new WebClient();
                        webClient.DownloadProgressChanged += (sss, eee) =>
                        {
                            ButtonProgressAssist.SetValue(installBtn, eee.ProgressPercentage);
                        };

                        var tempZip = await webClient.DownloadDataTaskAsync(url);
                        Stream stream = new MemoryStream(tempZip);

                        MemoryStream data = new MemoryStream();

                        var zipq = await Task.Factory.StartNew(() => ZipFile.Read(stream));

                        zipq["manifest.json"].Extract(data);
                        data.Seek(0, SeekOrigin.Begin);
                        var parsedManifest = await Task.Run(() => JsonConvert.DeserializeObject<ModpackManifest>(new StreamReader(data).ReadToEnd()));

                        ButtonProgressAssist.SetValue(installBtn, 0);
                        installBtn.Content = "Computing..";

                        var additionalMods = new List<string>();

                        /*foreach (var z in loc.LatestFiles.FirstOrDefault(s => s.FileName == y.version).Dependencies)
                        {
                            Console.WriteLine(z.AddOnId);
                        }*/
                        ServicePointManager.DefaultConnectionLimit = 30;
                        var block = new ActionBlock<Fileino>(async file =>
                        {
                            var modurl = await CurseApis.getDownloadURL(file.projectID, file.fileID);
                            foreach (var mod in modurl)
                            {
                                additionalMods.Add(mod);
                            }
                        }, new ExecutionDataflowBlockOptions { MaxDegreeOfParallelism = 30 });

                        foreach (var file in parsedManifest.files)
                        {
                            block.Post(file);
                        }
                        block.Complete();
                        try
                        {
                            await block.Completion;
                        }
                        catch (TaskCanceledException)
                        {
                            return;
                        }
                        installBtn.Content = "Install";

                        var install = await DialogHost.Show(new InstallDialog(y.instanceName, parsedManifest.minecraft.version, parsedManifest.minecraft.modLoaders[0].id.Replace("forge-", ""), loc.Name, y.version, additionalMods), "ModpacksDialog");
                        if (install == "Cancelled")
                            return;
                        Stream stream1 = new MemoryStream(tempZip);
                        string instanceDir = config.M_F_P + "Packs\\" + y.instanceName;

                        using (ZipFile zip = ZipFile.Read(stream1))
                        {
                            zip.ExtractAll(instanceDir,
                                ExtractExistingFileAction.OverwriteSilently);
                        }

                        await Task.Run(() =>
                        {
                            //Now Create all of the directories
                            foreach (string dirPath in Directory.GetDirectories(
                                instanceDir + "\\" + parsedManifest.overrides, "*",
                                SearchOption.AllDirectories))
                                Directory.CreateDirectory(dirPath.Replace(instanceDir + "\\" + parsedManifest.overrides,
                                    instanceDir));

                            //Copy all the files & Replaces any files with the same name
                            foreach (string newPath in Directory.GetFiles(instanceDir + "\\" + parsedManifest.overrides,
                                "*.*",
                                SearchOption.AllDirectories))
                                File.Move(newPath,
                                    newPath.Replace(instanceDir + "\\" + parsedManifest.overrides, instanceDir));

                            Directory.Delete(instanceDir + "\\" + parsedManifest.overrides, true);
                        });
                        //use the message queue to send a message.
                        var messageQueue = SnackbarThree.MessageQueue;
                        var message = "Installed. Enjoy :)";

                        //the message queue can be called from any thread
                        Task.Factory.StartNew(() => messageQueue.Enqueue(message));

                    }
                };
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
                _packs.Add(card);
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
                
                _packs.Clear();
                addPacks(0, search.Text);
            }
        }
    }
}