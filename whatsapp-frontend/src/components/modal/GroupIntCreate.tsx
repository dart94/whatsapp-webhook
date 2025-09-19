import { useEffect, useMemo, useRef, useState } from "react";
import { useGroupsIntegration } from "@/hooks/useGroupsIntegration";
import {
  GroupIntegration,
  CreateGroupIntegrationInput,
  GroupIntegrationCreateProps,
} from "@/types/groupIntegration";
import { showSweetAlert } from "@/components/common/Sweet";
import { AnimatePresence, motion } from "framer-motion";
import { showToast } from "@/components/common/Toast";
import { useGroups } from "@/hooks/useGroups";

export function GroupIntCreate({
  isOpen,
  onClose,
  onCreated,
}: GroupIntegrationCreateProps) {
  const { addGroupIntegration, loading, error } = useGroupsIntegration();
  const [groupIntegration, setGroupIntegration] =
    useState<CreateGroupIntegrationInput>({
      phoneNumberId: "",
      accessTokenId: "",
      groupId: 0,
      Waba_id: "",
    });
  const [touched, setTouched] = useState<{
    phoneNumberId: boolean;
    accessTokenId: boolean;
    groupId: boolean;
    Waba_id: boolean;
  }>({
    phoneNumberId: false,
    accessTokenId: false,
    groupId: false,
    Waba_id: false,
  });
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const { groups } = useGroups(token);

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

  const confirmAndCreate = async () => {
    try {
      const result = await showSweetAlert({
        title: "¿Crear esta integración?",
        text: `${groupIntegration.Waba_id || "(Sin Waba_id)"}`,
        icon: "warning",
        confirmButtonText: "Sí, crear",
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
        await addGroupIntegration(groupIntegration);
        await showToast({
          type: "success",
          message: "Integración creada correctamente",
        });
        await onCreated?.();
        handleClose();
      }
    } catch (err: any) {
      console.error(err);
      await showToast({
        type: "error",
        message: "Error al crear la integración",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // marcar como tocados
    setTouched({
      phoneNumberId: true,
      accessTokenId: true,
      groupId: true,
      Waba_id: true,
    });
    if (error) return; // no lanzamos confirmación si hay errores
    await confirmAndCreate();
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
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-group-integration-title"
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
                  id="create-group-integration-title"
                  className="text-xl font-semibold tracking-tight"
                >
                  Crear integración de grupo
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
                  htmlFor="phoneNumberId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número de teléfono *
                </label>
                <input
                  ref={firstFieldRef}
                  type="text"
                  id="phoneNumberId"
                  autoComplete="phoneNumberId"
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                    touched.phoneNumberId && error
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={groupIntegration.phoneNumberId}
                  onChange={(e) =>
                    setGroupIntegration({
                      ...groupIntegration,
                      phoneNumberId: e.target.value,
                    })
                  }
                  onBlur={() =>
                    setTouched((t) => ({ ...t, phoneNumberId: true }))
                  }
                  required
                />
                {touched.phoneNumberId && error && (
                  <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
              </div>

              {/* Token de acceso */}
              <div>
                <label
                  htmlFor="accessTokenId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Token de acceso *
                </label>
                <input
                //   ref={firstFieldRef}
                  type="text"
                  id="accessTokenId"
                  autoComplete="accessTokenId"
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                    touched.accessTokenId && error
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={groupIntegration.accessTokenId}
                  onChange={(e) =>
                    setGroupIntegration({
                      ...groupIntegration,
                      accessTokenId: e.target.value,
                    })
                  }
                  onBlur={() =>
                    setTouched((t) => ({ ...t, accessTokenId: true }))
                  }
                  required
                />
                {touched.accessTokenId && error && (
                  <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
              </div>

              {/* Grupo */}
              <div>
                <label
                  htmlFor="groupId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Grupo *
                </label>
                <select
                  id="groupId"
                  autoComplete="groupId"
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                    touched.groupId && error
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={groupIntegration.groupId}
                  onChange={(e) =>
                    setGroupIntegration({
                      ...groupIntegration,
                      groupId: Number(e.target.value),
                    })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, groupId: true }))}
                  required
                >
                  <option value={0}>Seleccione un grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {touched.groupId && error && (
                  <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
              </div>

              {/* Waba_id */}
              <div>
                <label
                  htmlFor="Waba_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Waba_id *
                </label>
                <input
                //   ref={firstFieldRef}
                  type="text"
                  id="Waba_id"
                  autoComplete="Waba_id"
                  className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${
                    touched.Waba_id && error
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={groupIntegration.Waba_id}
                  onChange={(e) =>
                    setGroupIntegration({
                      ...groupIntegration,
                      Waba_id: e.target.value,
                    })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, Waba_id: true }))}
                  required
                />
                {touched.Waba_id && error && (
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
                      Creando...
                    </span>
                  ) : (
                    "Crear"
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
