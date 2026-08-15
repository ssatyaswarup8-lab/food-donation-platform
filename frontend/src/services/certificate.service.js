import api from "./api";

export const getDonationHistory = async () => {
  const res = await api.get("/certificates/history");
  return res.data;
};

export const downloadCertificate = async () => {
  const res = await api.get("/certificates/download", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "impact-certificate.pdf");

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};