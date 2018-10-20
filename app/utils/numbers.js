export const numberToRoundedWord = number => {
    // Alter numbers larger than 1k
    if (number >= 1e3) {
      var units = ['k', 'M', 'B', 'T'];

      // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
      let unit = Math.floor((number.toFixed(0).length - 1) / 3) * 3;
      // Calculate the remainder
      var num = (number / ('1e' + unit)).toFixed(0);
      var unitname = units[Math.floor(unit / 3) - 1];

      // output number remainder + unitname
      return num + unitname;
    }

    // return formatted original number
    return number.toLocaleString();
};
