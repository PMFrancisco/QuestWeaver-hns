module.exports = {
    formatDate: (date) => {
        return new Date(date).toLocaleDateString();
      },
      capitalize: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      },
};