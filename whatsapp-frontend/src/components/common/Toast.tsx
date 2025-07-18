
import toast from "react-hot-toast";

export function showToast({
  message,
  type = "success",
}: {
  message: string;
  type?: "success" | "error" | "warning";
}) {
  const toastFunction =
    type === "success"
      ? toast.success
      : type === "error"
      ? toast.error
      : toast;

  toastFunction(message, {
    position: "top-right",
    duration: 3000,
    style: {
      background: type === "success" ? "#48bb78" : "#ef4444",
      color: "#fff",
    },
  });
}
