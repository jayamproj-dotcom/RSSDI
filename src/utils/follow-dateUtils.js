// follow-dateUtils.js
const isSixMonthsPassed = (dateString) => {
  const date = new Date(dateString);
  const sixMonthsLater = new Date(date);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  return new Date() >= sixMonthsLater;
};

const formatToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

export default {
  isSixMonthsPassed,
  formatToDDMMYYYY,
};
