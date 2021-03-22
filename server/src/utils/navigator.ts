export const isCollection = (path = ""): boolean => {
  if (path === '/') {
    return false;
  }
  return !Boolean(path.split("/").length % 2);
};
