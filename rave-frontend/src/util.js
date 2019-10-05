export const capitalize = string => {
  const [first, ...rest] = string;
  return first.toUpperCase() + rest.join('');
};