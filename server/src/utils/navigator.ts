export const isCollection = (path = "") => {
  return path.split("/").length % 2;
};
