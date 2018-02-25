using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
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

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for ManagePack.xaml
    /// </summary>
    public partial class ManagePack : UserControl
    {
        public string dir;
        public ManagePack(string dir)
        {
            InitializeComponent();
            this.dir = dir;
            DataContext = new Classes.TextFieldsViewModel();


        }

        private void Card_DragEnter(object sender, DragEventArgs e)
        {
            dragInfo.Visibility = Visibility.Hidden;

        }

        private void Card_DragLeave(object sender, DragEventArgs e)
        {
            dragInfo.Visibility = Visibility.Visible;

        }

        private void Card_Drop(object sender, DragEventArgs e)
        {
            dragInfo.Visibility = Visibility.Hidden;
            string[] droppedFiles = null;
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                droppedFiles = e.Data.GetData(DataFormats.FileDrop, true) as string[];
            }

            if ((null == droppedFiles) || (!droppedFiles.Any())) { return; }

            foreach (string s in droppedFiles)
            {
                var label = new Label();
                label.Content = s;
                filesList.Children.Add(label);
            }

                // Assuming you have one file that you care about, pass it off to whatever
                // handling code you have defined.
                //HandleFileOpen(files[0]);
        }


        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {

        }
    }
}
