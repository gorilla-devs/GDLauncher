using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
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

namespace ModpackJsonCreator
{
    public class Library
    {
        public string name { get; set; }
        /*public string hash { get; set; }
        public string url { get; set; }
        public string check { get; set; }*/
    }

    public class JSON
    {
        //public string ModpackName { get; set; }
        public List<Library> libraries { get; set; }
    }
    /// <summary>
    /// Logica di interazione per MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            FolderPath.AllowDrop = true;

        }

        private void FolderPath_DragEnter(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                e.Effects = DragDropEffects.Copy;
            }
            else
            {
                e.Effects = DragDropEffects.None;
            }
        }

        private void FolderPath_Drop(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);

                if (Directory.Exists(files[0]))
                {
                    this.FolderPath.Text = files[0];
                }
            }
        }

        private void jsonCreate_Click(object sender, RoutedEventArgs e)
        {
            JSON account = new JSON();
            account.libraries = new List<Library> { };

            string[] files = Directory.GetFiles(FolderPath.Text, "*.*", SearchOption.AllDirectories);

            foreach (string file in files)
            {
                string hash = Hash(file);
                var name = System.IO.Path.GetFileName(file);
                var localpath = file.Replace(FolderPath.Text + "\\", "").Replace("\\", "/");
                var websitepath = file.Replace(FolderPath.Text + "\\", "").Replace("\\", "/");
                account.libraries.Add(new Library { name = "https://dl.twickt.com/packs/" + modpackname.Text.Replace(" ", "_").ToLower() + "/" + localpath}); 
            }
            string json = JsonConvert.SerializeObject(account, Formatting.Indented);
            System.IO.File.WriteAllText(System.IO.Path.GetDirectoryName(Assembly.GetEntryAssembly().Location) + "\\" + modpackname.Text.Replace(" ", "_").ToLower() + ".json", json);
        }

        //hex encoding of the hash, in uppercase.
        public string Hash(string str)
        {
            byte[] data = File.ReadAllBytes(str);
            using (SHA1Managed sha1 = new SHA1Managed())
            {
                data = sha1.ComputeHash(data);
            }
            return BitConverter.ToString(data).Replace("-", "").ToLower();
        }
    }
}
