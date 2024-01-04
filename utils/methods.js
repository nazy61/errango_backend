module.exports.generateSixDigits = () => {
  // Generate a 6-digit random number
  var sixDigitRandomNumber = Math.floor(100000 + Math.random() * 900000);

  return sixDigitRandomNumber;
};
