import Swal, { SweetAlertIcon } from "sweetalert2";

interface SweetAlertOptions {
  title: string;
  text: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  customClass?: Partial<
    Record<
      | "container"
      | "popup"
      | "header"
      | "title"
      | "closeButton"
      | "icon"
      | "image"
      | "content"
      | "input"
      | "actions"
      | "confirmButton"
      | "cancelButton"
      | "footer",
      string
    >
  >;
}

export function showSweetAlert({
  title,
  text,
  icon = "success",
  confirmButtonText = "Aceptar",
  cancelButtonText = "Cancelar",
  showCancelButton = true,
  confirmButtonColor,
  cancelButtonColor,
  customClass = {},
}: SweetAlertOptions) {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    cancelButtonText,
    showCancelButton,
    // Si usas botones personalizados, no configures confirmButtonColor y cancelButtonColor
    buttonsStyling: false,
    customClass: {
      actions: "flex justify-center gap-4",
      confirmButton:
        "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded",
      cancelButton:
        "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded",
      ...customClass,
    },
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  });
}
