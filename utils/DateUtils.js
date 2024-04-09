//date string to epoch : "2024/02/24" -> epoch
export const dateStringToEpoch = (dateString) => {
  const parts = dateString.split("/");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Months are zero-indexed, so subtract 1
  const day = parseInt(parts[2]);

  const date = new Date(year, month, day);
  return date.getTime();
};

//epoch to date : epoch -> "2024/02/24"
export const epochToDate = (epochTime) => {
  const date = new Date(epochTime);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because months are zero-indexed
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
};
