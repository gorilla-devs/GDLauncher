using MaterialDesignThemes.Wpf;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using GDLauncher;
using GDLauncher.Pages;
using GDLauncher.Properties;

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Logica di interazione per Options.xaml
    /// </summary>
    public partial class Options : INotifyPropertyChanged
    {
        CheckBox lastChecked;
        CheckBox actualChecked;
        private ShadowDepth _cardShadowDepth;
        public ShadowDepth CardShadowDepth
        {
            get => _cardShadowDepth;
            set
            {
                _cardShadowDepth = value;
                OnPropertyChanged("CardShadowDepth");
            }
        }


        public Options()
        {
            InitializeComponent();
            DataContext = this;
            DialogHostExtensions.SetCloseOnClickAway(this, true);
            if (Settings.Default.graphicsPerformance == "Material Design")
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#ffffff");
            else
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#eeeeee");

            if (Settings.Default.graphicsPerformance == "Flat" ||
                Settings.Default.graphicsPerformance == "GorillaDevs's Style")
                CardShadowDepth = ShadowDepth.Depth0;
            else
                CardShadowDepth = ShadowDepth.Depth1;
        }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private void closeDialog_Click(object sender, RoutedEventArgs e)
        {
            DialogHost.CloseDialogCommand.Execute(this, this);
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            version.Content = "v. " + Properties.Settings.Default.version;
            for (int i = 1; i <= 30; i++)
            {
                downloadThreads.Items.Add(i.ToString());
            }
            if (Classes.ComputerInfoDetect.GetComputerArchitecture() == 32)
            {
                ram.Items.Add("1.5");
            }
            else
            {
                ram.Items.Add("1");
                ram.Items.Add("2");
                ram.Items.Add("3");
                ram.Items.Add("4");
                ram.Items.Add("5");
                ram.Items.Add("6");
                ram.Items.Add("7");
                ram.Items.Add("8");
            }

            windowSizes.Items.Add("600x700");
            windowSizes.Items.Add("1000x700");

            instancesFont.Items.Add("Roboto");
            instancesFont.Items.Add("Roboto Thin");
            instancesFont.Items.Add("Roboto Bold");
            instancesFont.Items.Add("Minecrafter");
            instancesFont.Items.Add("Minecrafter Alt");
            


            windowSizes.SelectedValue = Settings.Default["windowSize"];
            instancesFont.SelectedValue = Settings.Default["instancesFont"];

            downloadThreads.SelectedValue = Settings.Default["download_threads"];
            ram.SelectedValue = Settings.Default["RAM"];
            JavaPath.Text = ShortenPath(Classes.ComputerInfoDetect.GetJavaInstallationPath(), 60);
            switch (Settings.Default.graphicsPerformance)
            {
                case "GorillaDevs's Style":
                    gorilladevs.IsChecked = true;
                    lastChecked = gorilladevs;
                    actualChecked = gorilladevs;
                    break;
                case "Flat":
                    flat.IsChecked = true;
                    lastChecked = flat;
                    actualChecked = flat;
                    break;
                case "Material Design":
                    md.IsChecked = true;
                    lastChecked = md;
                    actualChecked = md;
                    break;
                default:
                    gorilladevs.IsChecked = true;
                    lastChecked = gorilladevs;
                    actualChecked = gorilladevs;
                    break;
            }
            downloadThreads.SelectionChanged += downloadThreads_SelectionChanged;
            ram.SelectionChanged += ram_SelectionChanged;
            windowSizes.SelectionChanged += windowSizes_SelectionChanged;
            instancesFont.SelectionChanged += instancesFont_SelectionChanged;


            if (Properties.Settings.Default.autoHideLauncher == true) autoHideLauncher.IsChecked = true;
            else autoHideLauncher.IsChecked = false;
            autoHideLauncher.Checked += new RoutedEventHandler(autoHideLauncher_Checked);
            autoHideLauncher.Unchecked += new RoutedEventHandler(autoHideLauncher_Unchecked);


        }

        private void downloadThreads_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            Properties.Settings.Default["download_threads"] = downloadThreads.SelectedValue;
            Properties.Settings.Default.Save();
            saved("Parallel Downloads Saved: " + Properties.Settings.Default["download_threads"]);
        }

        private async void saved(string message)
        {
            snackbarSave.Message = new MaterialDesignThemes.Wpf.SnackbarMessage
            {
                Content = message
            };
            snackbarSave.IsActive = true; 
             await Task.Delay(3000);
            snackbarSave.IsActive = false;
        }

        private void JavaPathFolderBrowser_Click(object sender, RoutedEventArgs e)
        {
            var folderbrowser = new WPFFolderBrowser.WPFFolderBrowserDialog();
            folderbrowser.InitialDirectory = Classes.ComputerInfoDetect.GetJavaInstallationPath();
            var path = folderbrowser.ShowDialog();
            JavaPathFolderBrowser.IsChecked = false;

            try
            {
                var tempPath = folderbrowser.FileName;
                do
                {
                    if (tempPath.Substring(tempPath.Length - 1) == "\\")
                    {
                        JavaPath.Text = tempPath.Substring(0, tempPath.Length - 1) + "";
                    }
                }
                while (tempPath.Substring(tempPath.Length - 1) == "\\");

                if (!File.Exists(tempPath + "\\bin\\java.exe"))
                {
                    MessageBox.Show("Not a valid path");
                    return;
                }
                JavaPath.Text = tempPath;
                Properties.Settings.Default["JavaPath"] = JavaPath.Text;
                Properties.Settings.Default.Save();
                saved("Java Path Saved");
            }
            catch {}
        }

        private void ram_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            Properties.Settings.Default["RAM"] = ram.SelectedValue;
            Properties.Settings.Default.Save();
            saved("Dedicated RAM Saved: " + Properties.Settings.Default["RAM"]);
        }


        private void instancesFont_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            Properties.Settings.Default["instancesFont"] = instancesFont.SelectedValue;
            Properties.Settings.Default.Save();
            saved("New Font: " + Properties.Settings.Default["instancesFont"]);
            Pages.Home.singleton.ModpacksUpdate();
        }

        private void windowSizes_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            Properties.Settings.Default["windowSize"] = windowSizes.SelectedValue;
            Properties.Settings.Default.Save();
            Window1.singleton.Width = double.Parse(Properties.Settings.Default["windowSize"].ToString().Split('x')[0]);
            Window1.singleton.Height = double.Parse(Properties.Settings.Default["windowSize"].ToString().Split('x')[1]);

            double screenWidth = System.Windows.SystemParameters.PrimaryScreenWidth;
            double screenHeight = System.Windows.SystemParameters.PrimaryScreenHeight;
            double windowWidth = Window1.singleton.Width;
            double windowHeight = Window1.singleton.Height;
            Window1.singleton.Left = (screenWidth / 2) - (windowWidth / 2);
            Window1.singleton.Top = (screenHeight / 2) - (windowHeight / 2);

            saved("Window size changed");
        }

        private void autoHideLauncher_Checked(object sender, RoutedEventArgs e)
        {
            Properties.Settings.Default.autoHideLauncher = true;
            Properties.Settings.Default.Save();
            saved("Saved");
        }

        private void autoHideLauncher_Unchecked(object sender, RoutedEventArgs e)
        {
            Properties.Settings.Default.autoHideLauncher = false;
            Properties.Settings.Default.Save();
            saved("Saved");
        }

        public static string ShortenPath(string path, int maxLength)
        {
            string ellipsisChars = "...";
            char dirSeperatorChar = System.IO.Path.DirectorySeparatorChar;
            string directorySeperator = dirSeperatorChar.ToString();

            //simple guards
            if (path.Length <= maxLength)
            {
                return path;
            }
            int ellipsisLength = ellipsisChars.Length;
            if (maxLength <= ellipsisLength)
            {
                return ellipsisChars;
            }


            //alternate between taking a section from the start (firstPart) or the path and the end (lastPart)
            bool isFirstPartsTurn = true; //drive letter has first priority, so start with that and see what else there is room for

            //vars for accumulating the first and last parts of the final shortened path
            string firstPart = "";
            string lastPart = "";
            //keeping track of how many first/last parts have already been added to the shortened path
            int firstPartsUsed = 0;
            int lastPartsUsed = 0;

            string[] pathParts = path.Split(dirSeperatorChar);
            for (int i = 0; i < pathParts.Length; i++)
            {
                if (isFirstPartsTurn)
                {
                    string partToAdd = pathParts[firstPartsUsed] + directorySeperator;
                    if ((firstPart.Length + lastPart.Length + partToAdd.Length + ellipsisLength) > maxLength)
                    {
                        break;
                    }
                    firstPart = firstPart + partToAdd;
                    if (partToAdd == directorySeperator)
                    {
                        //this is most likely the first part of and UNC or relative path 
                        //do not switch to lastpart, as these are not "true" directory seperators
                        //otherwise "\\myserver\theshare\outproject\www_project\file.txt" becomes "\\...\www_project\file.txt" instead of the intended "\\myserver\...\file.txt")
                    }
                    else
                    {
                        isFirstPartsTurn = false;
                    }
                    firstPartsUsed++;
                }
                else
                {
                    int index = pathParts.Length - lastPartsUsed - 1; //-1 because of length vs. zero-based indexing
                    string partToAdd = directorySeperator + pathParts[index];
                    if ((firstPart.Length + lastPart.Length + partToAdd.Length + ellipsisLength) > maxLength)
                    {
                        break;
                    }
                    lastPart = partToAdd + lastPart;
                    if (partToAdd == directorySeperator)
                    {
                        //this is most likely the last part of a relative path (e.g. "\websites\myproject\www_myproj\App_Data\")
                        //do not proceed to processing firstPart yet
                    }
                    else
                    {
                        isFirstPartsTurn = true;
                    }
                    lastPartsUsed++;
                }
            }

            if (lastPart == "")
            {
                //the filename (and root path) in itself was longer than maxLength, shorten it
                lastPart = pathParts[pathParts.Length - 1];//"pathParts[pathParts.Length -1]" is the equivalent of "Path.GetFileName(pathToShorten)"
                lastPart = lastPart.Substring(lastPart.Length + ellipsisLength + firstPart.Length - maxLength, maxLength - ellipsisLength - firstPart.Length);
            }

            return firstPart + ellipsisChars + lastPart;
        }

        private void chk_Click(object sender, RoutedEventArgs e)
        {
            CheckBox activeCheckBox = sender as CheckBox;
            if (activeCheckBox != lastChecked && lastChecked != null)
            {
                lastChecked.IsChecked = false;
                actualChecked = activeCheckBox;
            }
            else if (activeCheckBox == lastChecked)
                activeCheckBox.IsChecked = true;
            lastChecked = (bool)activeCheckBox.IsChecked ? activeCheckBox : null;

            if (activeCheckBox.Name == "gorilladevs" ||
                activeCheckBox.Name == "flat")
            {
                /*CardEffect = activeCheckBox.Name == "flat"
                    ? new DropShadowEffect
                    {
                        BlurRadius = 0,
                        ShadowDepth = 0,
                        Direction = 0,
                        Opacity = 0,
                        RenderingBias = RenderingBias.Performance,
                    }
                    : new DropShadowEffect
                    {
                        BlurRadius = 0,
                        ShadowDepth = 0,
                        Direction = 270,
                        Opacity = .42,
                        RenderingBias = RenderingBias.Performance,
                    };*/
                CardShadowDepth = ShadowDepth.Depth0;
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#eeeeee");
            }
            else
            {
                CardShadowDepth = ShadowDepth.Depth1;
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#ffffff");
            }
            Settings.Default.graphicsPerformance = actualChecked.Name == "gorilladevs"
                ? "GorillaDevs's Style"
                : (actualChecked.Name == "md" ? "Material Design" : "Flat");
            Home.singleton.ModpacksUpdate();
            saved("Saved");
        }

        private void gorilladevs_OnMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            gorilladevs.IsChecked = true;
            chk_Click(gorilladevs, null);
        }

        private void flat_OnMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            flat.IsChecked = true;
            chk_Click(flat, null);
        }

        private void md_OnMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            md.IsChecked = true;
            chk_Click(md, null);
        }
    }
}
