export function validateUsername(val: string) {
  if (!val) {
    return "Username required";
  } else if (val.length < 3) {
    return "Username must be at least 3 characters";
  } else if (val.split(" ").length > 1) {
    return "Username cannot contain spaces";
  }
}
