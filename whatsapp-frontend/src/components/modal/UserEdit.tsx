// Modal para editar usuario
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useUsersUpdate from "@/hooks/useUsersUpdate";
import { User, UserUpdateData } from "@/types/user";
import { showSweetAlert } from "@/components/common/Sweet";
import { AnimatePresence, motion, number } from "framer-motion";
import { showToast } from "@/components/common/Toast";
import { useFormValidation } from "@/hooks/useFormValidation";

interface UserEditProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function UserEdit({ isOpen, onClose, user }: UserEditProps) {
  const { updateUserHandler, loading, error } = useUsersUpdate();
  const { logout } = useAuth();
  const { touched, setTouched, errorsMap, hasErrors } = useFormValidation(
    user,
    { requirePassword: false }
  );

  const [userData, setUserData] = useState<User>({
    id: user.id,
    name: user.name,
    email: user.email,
    password: "",
    isAdmin: user.isAdmin,
    IsActive: user.IsActive,
  });

  // Accesibilidad: manejar foco inicial y escape
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const lastActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement;
      setTimeout(() => firstFieldRef.current?.focus(), 0);
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab" && dialogRef.current) {
          // Focus trap sencillo
          const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            (last || first)?.focus();
          }
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    } else {
      // devolver foco al disparador
      (lastActiveElement.current as HTMLElement | null)?.focus?.();
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    if (loading) return; // evita cerrar mientras carga
    onClose();
  };

  const updateData: any = {
    name: userData.name,
    email: userData.email,
    isAdmin: userData.isAdmin,
    IsActive: userData.IsActive,
  };

  if (userData.password.trim()) {
    updateData.password = userData.password;
  }

  const confirmAndUpdate = async () => {
    try {
      const result = await showSweetAlert({
        title: "¿Actualizar este usuario?",
        text: `${userData.name || "(Sin nombre)"} · ${
          userData.email || "(Sin email)"
        }`,
        icon: "warning",
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        customClass: {
          confirmButton:
            "!bg-blue-600 hover:!bg-blue-700 !text-white !font-medium !rounded-lg !px-4 !py-2",
          cancelButton:
            "!bg-gray-200 hover:!bg-gray-300 !text-gray-900 !font-medium !rounded-lg !px-4 !py-2",
          popup: "!rounded-2xl !shadow-xl",
        },
      });

      if (result.isConfirmed) {
        await updateUserHandler(userData.id, updateData);
        await showToast({
          type: "success",
          message: "Usuario actualizado correctamente",
        });
        handleClose();
      }
    } catch (err: any) {
      console.error(err);
      await showToast({
        type: "error",
        message: "Error al actualizar el usuario",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // marcar como tocados
    setTouched({ name: true, email: true, password: true });
    if (hasErrors) return; // no lanzamos confirmación si hay errores
    await confirmAndUpdate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          aria-hidden={!isOpen}
        >
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
            ref={dialogRef}
            className="relative z-[101] w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6">
              <div className="space-y-1">
                <h2
                  id="create-user-title"
                  className="text-xl font-semibold tracking-tight"
                >
                  Editar usuario
                </h2>
                <p className="text-sm text-gray-500">
                  Completa la información. Los campos marcados con * son
                  obligatorios.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre *
                </label>
                <input
                  ref={firstFieldRef}
                  type="text"
                  id="name"
                  autoComplete="name"
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                    touched.name && errorsMap.name
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  required
                />
                {touched.name && errorsMap.name && (
                  <p className="mt-1 text-xs text-red-600">{errorsMap.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                    touched.email && errorsMap.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  required
                />
                {touched.email && errorsMap.email && (
                  <p className="mt-1 text-xs text-red-600">{errorsMap.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nueva contraseña (opcional)
                </label>
                <input
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  placeholder="Dejar vacío para mantener la actual"
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                    touched.password && errorsMap.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  // Remover required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Solo completa si quieres cambiar la contraseña. Mínimo 8
                  caracteres.
                </p>
                {touched.password && errorsMap.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errorsMap.password}
                  </p>
                )}
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    id="isAdmin"
                    type="checkbox"
                    checked={userData.isAdmin}
                    onChange={(e) =>
                      setUserData({ ...userData, isAdmin: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Es administrador
                </label>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={userData.IsActive}
                    onChange={(e) =>
                      setUserData({ ...userData, IsActive: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Está activo
                </label>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || hasErrors}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition ${
                    loading || hasErrors
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600"
                  }`}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Actualizando...
                    </span>
                  ) : (
                    "Actualizar"
                  )}
                </button>
              </div>

              {/* Error del hook (fallback) */}
              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Error: {error}
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
