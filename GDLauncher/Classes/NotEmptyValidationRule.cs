using System.Globalization;
using System.Windows.Controls;

namespace GDLauncher.Classes
{
    public class NotEmptyValidationRule : ValidationRule
    {
        public override ValidationResult Validate(object value, CultureInfo cultureInfo)
        {
            return (value ?? "").ToString().Contains(" ")
                ? new ValidationResult(false, "Instance Name cannot be empty")
                : ValidationResult.ValidResult;
        }
    }
}