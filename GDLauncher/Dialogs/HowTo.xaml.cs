// Copyright (c) 2016 Twickt / Ceschia Davide
//Application idea, code and time are given by Davide Ceschia / Twickt
//You may use them according to the GNU GPL v.3 Licence
//GITHUB Project: https://github.com/killpowa/Twickt-Launcher

/*Breve introduzione, una specie di setup*/
using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using GDLauncher.Properties;
using MaterialDesignThemes.Wpf;

namespace GDLauncher.Dialogs
{
    /// <summary>
    /// Interaction logic for HowTo.xaml
    /// </summary>
    public partial class HowTo : INotifyPropertyChanged
    {
        Timer sw = new Timer();
        CheckBox lastChecked;
        CheckBox actualChecked;

        private ShadowDepth _shadowDepth;

        public ShadowDepth ShadowDepth
        {
            get => _shadowDepth;
            set
            {
                _shadowDepth = value;
                OnPropertyChanged("ShadowDepth");
            }
        }

        private DropShadowEffect _cardEffect;

        public DropShadowEffect CardEffect
        {
            get => _cardEffect;
            set
            {
                _cardEffect = value;
                OnPropertyChanged("CardEffect");
            }
        }

        public HowTo()
        {
            //Window1.singleton.MenuToggleButton.IsEnabled = false;
            InitializeComponent();
            DataContext = this;
            lastChecked = gorilladevs;
            actualChecked = gorilladevs;
            try
            {
                var ramCounter = new PerformanceCounter("Memory", "Available MBytes", true);
                Application.Current.Dispatcher.Invoke(new Action(() =>
                {
                    freeram.Content = Convert.ToInt32(ramCounter.NextValue() / 1024).ToString() + "GB";
                }));
                sw.Start();
                sw.Elapsed += new ElapsedEventHandler(sw_Tick);
                sw.Interval = 2000; // in miliseconds
            }
            catch(InvalidOperationException)
            {
                freeram.Content = "Error. Please open a cmd as Administrator and run: lodctr /r";
            }
            catch
            {
                freeram.Content = "Unknown error";
            }

            if (Settings.Default.graphicsPerformance == "GorillaDevs's Style" ||
                Settings.Default.graphicsPerformance == "Flat")
            {
                if (Settings.Default.graphicsPerformance == "GorillaDevs's Style")
                {
                    /*CardEffect = Settings.Default.graphicsPerformance == "Flat"
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
                }
                ShadowDepth = ShadowDepth.Depth0;
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#eeeeee");
            }
            else
            {
                ShadowDepth = ShadowDepth.Depth1;
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#ffffff");
            }

        }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private void sw_Tick(object source, ElapsedEventArgs e)
        {
            //GET AVAILABLE MEMORY
            var ramCounter = new System.Diagnostics.PerformanceCounter("Memory", "Available MBytes", true);
            try
            {
                Application.Current.Dispatcher.Invoke(new Action(() =>
                {
                    freeram.Content = Convert.ToInt32(ramCounter.NextValue() / 1024).ToString() + "GB";
                    if(Convert.ToInt32(ramCounter.NextValue() / 1024) <= 2)
                    {
                        errorlowram.Visibility = Visibility.Visible;
                    }
                    else
                    {
                        errorlowram.Visibility = Visibility.Hidden;
                    }
                }));
            }
            catch
            { }
            //GET TOTAL MEMORY
        }


        private void chk_Click(object sender, RoutedEventArgs e)
        {
            CheckBox activeCheckBox = sender as CheckBox;
            if (activeCheckBox != lastChecked && lastChecked != null)
            {
                lastChecked.IsChecked = false;
                actualChecked = activeCheckBox;
            }
            else if(activeCheckBox == lastChecked)
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
                ShadowDepth = ShadowDepth.Depth0;
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#eeeeee");
            }
            else
            {
                ShadowDepth = ShadowDepth.Depth1;
                Background = (SolidColorBrush)new BrushConverter().ConvertFrom("#ffffff");
            }

        }



        private void button_Click(object sender, RoutedEventArgs e)
        {
            sw.Stop();
            Settings.Default["firstTimeHowTo"] = "false";
            Settings.Default.graphicsPerformance = actualChecked.Name == "gorilladevs"
                ? "GorillaDevs's Style"
                : (actualChecked.Name == "md" ? "Material Design" : "Flat");
            Settings.Default["RAM"] = ram.Text;
            Settings.Default.Save();
            DialogHost.CloseDialogCommand.Execute(this, this);

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

        private void card_onMouseEnter(object sender, MouseEventArgs e)
        {
            /*if (actualChecked.Name == "gorilladevs" || actualChecked.Name == "md")
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
                (sender as Card).Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                (sender as Card).Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);
            }*/
        }

        private void card_onMouseLeave(object sender, MouseEventArgs e)
        {
            /*if (actualChecked.Name == "gorilladevs" || actualChecked.Name == "md")
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
                (sender as Card).Effect.BeginAnimation(DropShadowEffect.ShadowDepthProperty, da);
                (sender as Card).Effect.BeginAnimation(DropShadowEffect.BlurRadiusProperty, da1);
            }*/
        }
    }
}
