/*Pagina di upload delle modpacks*/

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
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
    /// Logica di interazione per Upload_Your_Pack.xaml
    /// </summary>
    public partial class Upload_Your_Pack : UserControl
    {
        public Upload_Your_Pack()
        {
            InitializeComponent();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            var folderbrowser = new WPFFolderBrowser.WPFFolderBrowserDialog();
            var path = folderbrowser.ShowDialog();
            FolderPath.Text = folderbrowser.FileName;
        }

        private async void FolderPath_TextChanged(object sender, TextChangedEventArgs e)
        {
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            fileslist.Children.Clear();
            if (String.IsNullOrEmpty(modpackname.Text))
            {
                MessageBox.Show("Il nome della modpack non puo' essere vuoto");
                return;
            }
            Application.Current.Dispatcher.Invoke(new Action(async () =>
            {
                String[] allfiles = new string[90000000];
                await Task.Run(() => {
                    Application.Current.Dispatcher.Invoke(new Action(() =>
                    {
                        allfiles = System.IO.Directory.GetFiles(FolderPath.Text, "*.*", System.IO.SearchOption.AllDirectories);
                    }));
                });

                foreach (var file in allfiles)
                {
                    var stack = new StackPanel();
                    var card = new MaterialDesignThemes.Wpf.Card();
                    stack.Orientation = Orientation.Vertical;
                    var filename = file.Replace(FolderPath.Text, "");
                    var dirs = filename.Replace(System.IO.Path.GetFileName(filename), "");
                    filename = System.IO.Path.GetFileName(filename);
                    var dirstext = new Label();
                    dirstext.Foreground = Brushes.Red;
                    dirstext.Content = dirs;
                    dirstext.HorizontalAlignment = HorizontalAlignment.Right;
                    var filetext = new Label();
                    filetext.Foreground = Brushes.Green;
                    filetext.Content = filename;
                    filetext.HorizontalAlignment = HorizontalAlignment.Right;
                    var textbox = new TextBox();
                    MaterialDesignThemes.Wpf.HintAssist.SetHint(textbox, "URL");
                    textbox.Width = 500;
                    var combo = new ComboBox();
                    combo.Margin = new Thickness(10, 0, 0, 0);
                    MaterialDesignThemes.Wpf.HintAssist.SetHint(combo, "Select URL");
                    MaterialDesignThemes.Wpf.HintAssist.SetIsFloating(textbox, true);
                    combo.Items.Add("Curse");
                    combo.Items.Add("Twickt");
                    combo.SelectionChanged += new SelectionChangedEventHandler((senderx, e1) => combo_selectionchanged(this, e, textbox, combo));
                    var testsstack = new StackPanel();
                    testsstack.Orientation = Orientation.Horizontal;
                    testsstack.Children.Add(dirstext);
                    testsstack.Children.Add(filetext);
                    var boxcombo = new StackPanel();
                    boxcombo.Orientation = Orientation.Horizontal;
                    boxcombo.Children.Add(textbox);
                    boxcombo.Children.Add(combo);
                    stack.Margin = new Thickness(5, 10, 5, 15);
                    stack.Children.Add(testsstack);
                    stack.Children.Add(boxcombo);
                    card.Content = stack;
                    card.Margin = new Thickness(10);
                    fileslist.Children.Add(card);
                }
            }));
        }

        async void combo_selectionchanged(object sender, RoutedEventArgs e, TextBox textbox, ComboBox combo)
        {
            string selecteditem = combo.SelectedItem.ToString().Replace("System.Windows.Controls.ComboBoxItem: ", "");
            if (selecteditem == "Twickt")
                textbox.Text = "http://dl.twickt.com/packs/" + modpackname.Text + "/mods/filename.jar";
            else
                textbox.Text = "https://minecraft.curseforge.com/projects/NomeDellaMod/files/IdDellaMod";
        }

        private async void jsonCreate_Click(object sender, RoutedEventArgs e)
        {
            var client = new System.Net.WebClient();
            var values = new NameValueCollection();
            values["upload"] = "";
            values["name"] = modpackname.Text;

            try
            {
                var response = await client.UploadValuesTaskAsync(config.modpacksupload, values);
                var responseString = Encoding.Default.GetString(response);
                MessageBox.Show(responseString);
                if (responseString.Contains("MatchFound"))
                {
                    MessageBox.Show("Nome gia' preso");
                    return;
                }
                MessageBox.Show("CARICATA");
            }
            catch(Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }
    }
    }
