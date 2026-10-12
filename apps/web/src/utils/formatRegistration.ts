export const formatRegistration = (registration: string) => {
  return registration.replace(/^([A-Z]{2}\d{2})([A-Z]{3})$/, "$1 $2");
};
