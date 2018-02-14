using System.Globalization;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;

namespace GDLauncher.Classes
{
    public class NotEmptyValidationRule : ValidationRule
    {
        public override ValidationResult Validate(object value, CultureInfo cultureInfo)
        {
            Regex rg = new Regex(@"^[a-zA-Z0-9\s,]*$");
            if (!rg.IsMatch((value ?? "").ToString()))
                return new ValidationResult(false, "Only numbers and letters!");

            return (value ?? "").ToString().Contains(" ")
                ? new ValidationResult(false, "Cannot be empty")
                : ValidationResult.ValidResult;
        }
    }
}