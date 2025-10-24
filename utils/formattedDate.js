exports.getDateFormatted = () => {
  const currentDate = new Date();
  const dayOfMonth = currentDate.getDate();
  const year = currentDate.getFullYear();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[currentDate.getMonth()];
  return `${dayOfMonth} ${month} ${year}`;
};

exports.formatDateTime = (dateStr) => {
  const dateObject = new Date(dateStr);

  // Set time zone to Indian Standard Time (IST)
  const options = {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
  };
  const time = dateObject.toLocaleTimeString("en-IN", options);

  const dateOptions = {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const date = dateObject.toLocaleDateString("en-IN", dateOptions);

  return `${time} ${date}`;
};

// Helper function to convert ISO date string to formatted date (e.g., "20 Oct 2025")
exports.formatDateFromISO = (isoDateString) => {
  const dateObject = new Date(isoDateString);
  const dayOfMonth = dateObject.getDate();
  const year = dateObject.getFullYear();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[dateObject.getMonth()];
  return `${dayOfMonth} ${month} ${year}`;
};