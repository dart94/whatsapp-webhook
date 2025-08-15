"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useUsers from "@/hooks/useUsers";
import { User } from "@/types/user";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import useUsersDelete from "@/hooks/useUsersDelete";
import { showSweetAlert } from "@/components/common/Sweet";
import { UserCreate } from "@/components/modal/UserCreate";
import { showToast } from "@/components/common/Toast";

export default function PrivatePage() {
  const { logout } = useAuth();
  const { users, loading, error, refresh } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const {
    deleteUserHandler,
    loading: deleteLoading,
    error: deleteError,
  } = useUsersDelete();
  const [isOpen, setIsOpen] = useState(false);

  // Seleccionar primer usuario automáticamente
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  // Eliminar usuario
  const handleDeleteUser = async (id: number) => {
    try {
      const result = await showSweetAlert({
        title: "¿Estás seguro de que deseas eliminar este usuario?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        confirmButtonText: "Sí, eliminar usuario",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        customClass: {
          container: "w-full",
          confirmButton:
            "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded",
          cancelButton:
            "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded",
        },
      });

      if (!result.isConfirmed) return;

      await deleteUserHandler(id);
      showToast({
        type: "success",
        message: "Usuario eliminado correctamente",
      });

      await refresh?.();
      refresh();
    } catch (err) {
      showToast({ type: "error", message: "Error al eliminar el usuario" });
      console.error(err);
    }
  };

  const openCreate = () => {
    setIsOpen(true);
  };
  const closeCreate = () => {
    setIsOpen(false);
  };

  // Mostrar modal de creación de usuario de userCreate
  const handleCreateUser = () => {
    setIsOpen(true);
    refresh();
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Usuarios</h1>
          <button
            onClick={handleCreateUser}
            className="inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Crear
            <PlusCircleIcon
              className="w-5 h-5 ml-2 shrink-0"
              aria-hidden="true"
            />
          </button>

          {/* Modal */}
          <UserCreate
            isOpen={isOpen}
            onClose={closeCreate}
            onCreated={() => {
              refresh();
              closeCreate();
            }}
          />
        </div>

        {/* Tabla de usuarios */}

        <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Administrador</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`transition ${
                    user.id === selectedUser?.id
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {user.IsActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isAdmin ? "solid" : "outline"}>
                      {user.isAdmin ? "Sí" : "No"}
                    </Badge>
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link
                        href={`/users/${user.id}/edit`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </Link>
                      {/* Eliminar usuario */}
                      <button
                        onClick={() => void handleDeleteUser(Number(user.id))}
                        disabled={deleteLoading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No hay usuarios disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
