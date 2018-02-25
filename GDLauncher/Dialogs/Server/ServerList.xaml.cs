using System;
using System.Collections.Generic;
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

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for ManageServers.xaml
    /// </summary>
    public partial class ServerList : UserControl
    {
        public static ServerList singleton;
        public bool started = false;
        public ServerList()
        {
            InitializeComponent();
            singleton = this;
            DialogHostExtensions.SetCloseOnClickAway(this, true);
            refreshServers();

        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            if (!Directory.Exists(config.M_F_P + "Servers\\"))
            {
                Directory.CreateDirectory(config.M_F_P + "Servers\\");
            }
        }

        public void refreshServers()
        {
            var dirlist = Directory.GetDirectories(config.M_F_P + "Servers\\");
            foreach (var dir in dirlist)
            {
                var dockpanel = new DockPanel();
                MaterialDesignThemes.Wpf.Card item = new MaterialDesignThemes.Wpf.Card();
                item.Margin = new Thickness(0, 0, 0, 10);
                item.Height = 70;
                item.Content = dockpanel;

                var label = new Label();
                label.FontSize = 16;
                label.Margin = new Thickness(10, 0, 0, 0);
                label.VerticalAlignment = VerticalAlignment.Center;
                label.Content = Path.GetFileName(dir);
                label.HorizontalAlignment = HorizontalAlignment.Left;

                var buttonsPanel = new DockPanel();
                buttonsPanel.HorizontalAlignment = HorizontalAlignment.Right;


                Style buttonstyle = Application.Current.FindResource("MaterialDesignFlatButton") as Style;

                var delete = new Button();
                delete.Width = 60;
                delete.Style = buttonstyle;
                delete.Foreground = (SolidColorBrush)(new BrushConverter().ConvertFrom("#F44336"));
                var iconpackplay = new MaterialDesignThemes.Wpf.PackIcon();
                iconpackplay.Kind = MaterialDesignThemes.Wpf.PackIconKind.Delete;
                delete.Content = iconpackplay;
                delete.Margin = new Thickness(0, 0, 10, 0);
                delete.Click += (s, ex) =>
                {
                    try
                    {
                        if (Directory.Exists(dir))
                        {
                            Directory.Delete(dir, true);
                        }
                        serversList.Children.Remove(item);
                    }
                    catch { }

                };



                var button = new Button();
                button.Width = 130;
                button.Style = buttonstyle;
                button.Content = "Open Manager";
                button.Click += async (s, ex) =>
                {
                    if (Directory.Exists(dir))
                    {
                        if (!started)
                        {
                            button.IsEnabled = false;
                            delete.IsEnabled = false;
                            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
                            await Task.Delay(300);
                            Windows.ServerManager manager = new Windows.ServerManager(dir);
                            started = true;
                            label.Content = Path.GetFileName(dir) + " (active)";
                            manager.Show();
                            manager.Closed += (ss, ee) =>
                            {
                                button.IsEnabled = true;
                                delete.IsEnabled = true;
                                label.Content = Path.GetFileName(dir);
                            };
                        }
                    }
                    else
                    {
                        MessageBox.Show("This server does not exist. Maybe it has been manually deleted");
                    }
                };
                

                dockpanel.Children.Add(label);
                buttonsPanel.Children.Add(button);
                buttonsPanel.Children.Add(delete);
                dockpanel.Children.Add(buttonsPanel);

                serversList.Children.Add(item);
            }
        }


        public void addNew(string dir)
        {
            var dockpanel = new DockPanel();
            MaterialDesignThemes.Wpf.Card item = new MaterialDesignThemes.Wpf.Card();
            item.Margin = new Thickness(0, 0, 0, 10);
            item.Height = 70;
            item.Content = dockpanel;

            var label = new Label();
            label.FontSize = 16;
            label.Margin = new Thickness(10, 0, 0, 0);
            label.VerticalAlignment = VerticalAlignment.Center;
            label.Content = Path.GetFileName(dir);
            label.HorizontalAlignment = HorizontalAlignment.Left;

            var buttonsPanel = new DockPanel();
            buttonsPanel.HorizontalAlignment = HorizontalAlignment.Right;


            Style buttonstyle = Application.Current.FindResource("MaterialDesignFlatButton") as Style;

            var delete = new Button();
            delete.Width = 60;
            delete.Style = buttonstyle;
            delete.Foreground = (SolidColorBrush)(new BrushConverter().ConvertFrom("#F44336"));
            var iconpackplay = new MaterialDesignThemes.Wpf.PackIcon();
            iconpackplay.Kind = MaterialDesignThemes.Wpf.PackIconKind.Delete;
            delete.Content = iconpackplay;
            delete.Margin = new Thickness(0, 0, 10, 0);
            delete.Click += (s, ex) =>
            {
                if (Directory.Exists(dir))
                {
                    Directory.Delete(dir, true);
                }
                serversList.Children.Remove(item);
            };



            var button = new Button();
            button.Width = 130;
            button.Style = buttonstyle;
            button.Content = "Open Manager";
            button.Click += async (s, ex) =>
            {
                if (!started)
                {
                    MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
                    await Task.Delay(300);
                    Windows.ServerManager manager = new Windows.ServerManager(dir);
                    started = true;
                    button.IsEnabled = false;
                    delete.IsEnabled = false;
                    label.Content = Path.GetFileName(dir) + " (active)";
                    manager.Show();
                    manager.Closed += (ss, ee) =>
                    {
                        button.IsEnabled = true;
                        delete.IsEnabled = true;
                        label.Content = Path.GetFileName(dir);
                    };
                }
            };


            dockpanel.Children.Add(label);
            buttonsPanel.Children.Add(button);
            buttonsPanel.Children.Add(delete);
            dockpanel.Children.Add(buttonsPanel);

            serversList.Children.Add(item);
            
        }


        private void addNewServer_Click(object sender, RoutedEventArgs e)
        {
            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
            MaterialDesignThemes.Wpf.DialogHost.Show(new Dialogs.Server.AddNewServer(), "RootDialog");
        }
    }
}
