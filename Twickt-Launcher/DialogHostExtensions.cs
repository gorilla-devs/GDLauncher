using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace GDLauncher
{
    public static class DialogHostExtensions
    {
        public static readonly DependencyProperty CloseOnClickAwayProperty = DependencyProperty.RegisterAttached(
    "CloseOnClickAway", typeof(bool), typeof(DialogHostExtensions), new PropertyMetadata(default(bool)));

        public static void SetCloseOnClickAway(DependencyObject element, bool value)
        {
            element.SetValue(CloseOnClickAwayProperty, value);
        }

        public static bool GetCloseOnClickAway(DependencyObject element)
        {
            return (bool)element.GetValue(CloseOnClickAwayProperty);
        }
    }
}
