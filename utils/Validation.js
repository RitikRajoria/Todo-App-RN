export const validateName = (name) => {
  if (!name) {
    return "This field is required";
  }
  return "";
};

export const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }
  if (!isValidEmail(email)) {
    return "Invalid email format";
  }
  return "";
};

const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};
