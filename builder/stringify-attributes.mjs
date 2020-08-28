export default (attributes) =>
Object.entries(attributes)
  .map(([key, value]) => [key, "=", '"', value, '"', " "])
  .flat()
  .join("");