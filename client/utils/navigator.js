const isCollection = (path = "") => {
  return path.split("/").length % 2;
};

module.exports = {
  isCollection,
};
