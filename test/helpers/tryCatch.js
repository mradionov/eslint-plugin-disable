module.exports = function tryCatch(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
};
