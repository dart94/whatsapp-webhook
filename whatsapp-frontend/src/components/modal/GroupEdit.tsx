//Modal para editar grupo
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { Group, GroupEditProps } from "@/types/groups";
import { showSweetAlert } from "@/components/common/Sweet";
import { AnimatePresence, motion, number } from "framer-motion";
import { showToast } from "@/components/common/Toast";
import { useFormValidation } from "@/hooks/useFormValidation";



export function GroupEdit({ isOpen, onClose, group, onUpdated }: GroupEditProps) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const { editGroup, loading, error } = useGroups(token);
  const { logout } = useAuth();
  const { touched, setTouched, errorsMap, hasErrors } = useFormValidation(group, );
  const { groups } = useGroups(token);

  const [groupData, setGroupData] = useState<Group>({
    id: group.id,
    name: group.name,
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

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const raw = e.target.value; // string
setGroupData({ 
  ...groupData, 
  groupId: raw === "" ? undefined : Number(raw) 
});
};


  const handleClose = () => {
    if (loading) return; // evita cerrar mientras carga
    onClose();
  };

  const confirmAndUpdate = async () => {
    try {
      const result = await showSweetAlert({
        title: "¿Actualizar este grupo?",
        text: `${groupData.name || "(Sin nombre)"
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
        await editGroup(groupData.id, groupData.name);
        await showToast({
          type: "success",
          message: "Grupo actualizado correctamente",
        });
        handleClose();
        await onUpdated?.();
      }
    } catch (err: any) {
      console.error(err);
      await showToast({
        type: "error",
        message: "Error al actualizar grupo",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // marcar como tocados
    setTouched({ name: true, email: true, password: true });
    if (error) return; // no lanzamos confirmación si hay errores
    await confirmAndUpdate();
  };
  
  return(
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
              transition={{ duration: 0.2 }}
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
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6">
                <div className="space-y-1">
                  <h2
                    id="create-user-title"
                    className="text-xl font-semibold tracking-tight"
                  >
                    Editar grupo
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
                    className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 ${
                      touched.name && error
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    value={groupData.name}
                    onChange={(e) =>
                      setGroupData({ ...groupData, name: e.target.value })
                    }
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    required
                  />
                  {touched.name && error && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                  )}
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
                    disabled={loading || !!error}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition ${
                      loading || error
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
