function numberToWords(num) {
  const ones = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];
  const tens = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];

  if (num < 20) return ones[num];
  if (num < 100)
    return (
      tens[Math.floor(num / 10)] + (num % 10 !== 0 ? "-" + ones[num % 10] : "")
    );
  return num.toString(); // extend if needed (hundreds+)
}

module.exports = { numberToWords };
