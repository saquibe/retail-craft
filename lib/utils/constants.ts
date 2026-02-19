export const SIZES = [
  { value: "S", label: "Small (S)" },
  { value: "M", label: "Medium (M)" },
  { value: "L", label: "Large (L)" },
  { value: "XL", label: "Extra Large (XL)" },
  { value: "XXL", label: "Double Extra Large (XXL)" },
];

export const getSizeLabel = (size: string): string => {
  const sizeObj = SIZES.find((s) => s.value === size);
  return sizeObj?.label || size;
};

export const SIZE_COLORS = {
  S: "bg-blue-100 text-blue-800",
  M: "bg-green-100 text-green-800",
  L: "bg-yellow-100 text-yellow-800",
  XL: "bg-purple-100 text-purple-800",
  XXL: "bg-red-100 text-red-800",
};
