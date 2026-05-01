export const getImageUrl = (img, fallback) => {
  const defaultImage =
    fallback ||
    "https://i.pinimg.com/1200x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg";

  if (!img) return defaultImage;

  if (
    img.startsWith("http://") ||
    img.startsWith("https://") ||
    img.startsWith("blob:")
  ) {
    return img;
  }

  return `${import.meta.env.VITE_SERVER_URL}/${img.replace(/\\/g, "/")}`;
};
