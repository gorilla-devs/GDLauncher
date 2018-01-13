/*Sincronizzazione in cloud dei salvataggi(ancora da implementare)*/

using System;
using System.Collections.Generic;
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

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Logica di interazione per SyncToCloud.xaml
    /// </summary>
    public partial class SyncToCloud : UserControl
    {
        //Directory.GetLastWriteTime per vedere l'ultima data di modifica di una cartella
        public SyncToCloud()
        {
            InitializeComponent();
            for(int i = 0; i < 10; i++)
            {
                DockPanel dock = new DockPanel();
                CheckBox checkbox = new CheckBox();
                Label label = new Label();
                cloudSavesList.Children.Add(dock);
                dock.Children.Add(checkbox);
                dock.Children.Add(label);
                checkbox.Content = "SOMESOMESOMESOMESO";
                label.Content = " - 15/06/2015";
            }
            for (int i = 0; i < 10; i++)
            {
                DockPanel dock = new DockPanel();
                CheckBox checkbox = new CheckBox();
                Label label = new Label();
                localSavesList.Children.Add(dock);
                dock.Children.Add(checkbox);
                dock.Children.Add(label);
                checkbox.Content = "SOMESOMESOMESOMESO";
                label.Content = " - 15/06/2015";
            }
        }
    }
}
