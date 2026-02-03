// utils/transformFormData.js
export const flattenFormData = (formData, index = 0) => {
    const flat = {
      'S.No': index + 1,
    };
  
    ['section1', 'section2', 'section3'].forEach(section => {
      const data = formData[section] || {};
      Object.keys(data).forEach(key => {
        flat[`${section}_${key}`] = data[key];
      });
    });
  
    return flat;
  };
  