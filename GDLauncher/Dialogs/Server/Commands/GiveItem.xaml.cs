using System;
using System.Collections.Generic;
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

namespace GDLauncher.Dialogs.Server.Commands
{
    /// <summary>
    /// Interaction logic for GiveItem.xaml
    /// </summary>
    public partial class GiveItem : UserControl
    {
        public GiveItem()
        {
            InitializeComponent();
        }

        private async void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            if(Windows.ServerManager.singleton.data == null)
            {
                WebClient client = new WebClient();
                Windows.ServerManager.singleton.data = await client.DownloadStringTaskAsync("http://minecraft-ids.grahamedgecombe.com/items.json");
            }
            dynamic json = Newtonsoft.Json.JsonConvert.DeserializeObject(Windows.ServerManager.singleton.data);
            await Task.Run(async () => {
                int counter = 0;
                int count = json.Count;
                foreach (var item in json)
                {
                    await Application.Current.Dispatcher.Invoke(async delegate
                    {
                        var label = new Label();
                        var stackpanel = new StackPanel();
                        stackpanel.Orientation = Orientation.Horizontal;
                        var image = new Image();
                        image.Source = new BitmapImage(new Uri(@config.M_F_P + "items\\" + item["type"] + "-" + item["meta"] + ".png", UriKind.RelativeOrAbsolute));
                        image.Width = 30;
                        image.Height = 30;
                        stackpanel.Children.Add(image);
                        stackpanel.Children.Add(label);

                        label.Content = item.name;
                        label.Width = 400;

                        stackpanel.MouseLeftButtonUp += (s, ee) =>
                        {
                            isSelected.Visibility = Visibility.Visible;
                            scrollView.Visibility = Visibility.Hidden;
                            selectedImage.Source = new BitmapImage(new Uri(@config.M_F_P + "items\\" + item["type"] + "-" + item["meta"] + ".png", UriKind.RelativeOrAbsolute));
                            selectedText.Text = item.name;
                        };

                        items.Children.Add(stackpanel);
                        if(counter % 10 == 0)
                        {
                            await Task.Delay(5);
                            loading.Value = counter * 100 / count;
                        }
                        counter++;
                    });
                }
            });
            loading.Visibility = Visibility.Hidden;
            scrollView.Visibility = Visibility.Visible;
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            /*dynamic json = Newtonsoft.Json.JsonConvert.DeserializeObject(Windows.ServerManager.singleton.data);
            var command = "";
            MessageBox.Show(items.SelectedValue.ToString());
            foreach (var item in json)
            {
                if (item.name == items.SelectedValue)
                    command = item.text_type + " " + quantity.Text + " " + item.meta;
            }
            Windows.ServerManager.singleton.process.StandardInput.WriteLine("/give " + user.Text + " " +  command);
            MessageBox.Show("/give " + user.Text + " " + command);*/
            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(this, this);
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            isSelected.Visibility = Visibility.Hidden;
            scrollView.Visibility = Visibility.Visible;
        }
    }
}
