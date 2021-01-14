const isCollection = (path = "") : boolean => {
  return !Boolean(path.split("/").length % 2);
};

export {
  isCollection
}
