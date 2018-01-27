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
using System.Windows.Shapes;

namespace GDLauncher.Dialogs.Server
{
    /// <summary>
    /// Interaction logic for Settings.xaml
    /// </summary>
    public partial class Settings : UserControl
    {
        string dir;
        public Settings(string dir)
        {
            InitializeComponent();
            this.dir = dir;
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if(File.Exists(dir + @"\\server.properties"))
            {
                string text = File.ReadAllText(dir + @"\\server.properties");
                text = text.Replace("online-mode=true", "online-mode=false");
                File.WriteAllText(dir + @"\\server.properties", text);
            }
        }
    }
}
