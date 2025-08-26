"use client";

import { useEffect, useState } from "react";
import { Group } from "@/types/groups";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { showSweetAlert } from "@/components/common/Sweet";
import { showToast } from "@/components/common/Toast";
import { GroupCreate } from "@/components/modal/GroupCreate";
import { GroupEdit } from "@/components/modal/GroupEdit";
import { withAdmin } from "@/guards/WithAuth";
import { useGroups } from "@/hooks/useGroup";
import Loader from "@/components/ui/Loader";
import { useSort } from "@/components/ui/table/sort";

function PrivatePage() {
  const { groups, loading, error, refresh, removeGroup } = useGroups();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { sortedData, sortBy, sortDirection, setSortBy, setSortDirection } =
    useSort(groups, "id", "asc");

  // Seleccionar primer grupo automáticamente
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  // Eliminar grupo usando el método del hook
  const handleDeleteGroup = async (id: number) => {
    try {
      const result = await showSweetAlert({
        title: "¿Estás seguro de que deseas eliminar este grupo?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        confirmButtonText: "Sí, eliminar grupo",
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

      await removeGroup(id);
      showToast({ type: "success", message: "Grupo eliminado correctamente" });

      await refresh();
    } catch (err) {
      showToast({ type: "error", message: "Error al eliminar el grupo" });
      console.error(err);
    }
  };

  const handleCreateGroup = () => setIsOpen(true);
  const closeCreate = () => setIsOpen(false);

  const handleEditGroup = (g: Group) => {
    setEditingGroup(g);
    setIsOpenEdit(true);
  };
  const closeEditGroup = () => {
    setIsOpenEdit(false);
    setEditingGroup(null);
  };

  const toggleSort = (key: keyof Group) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (loading) return <Loader message="Cargando grupos" showTips={true} />;

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Grupos</h1>
          <button
            onClick={handleCreateGroup}
            className="inline-flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Crear
            <PlusCircleIcon
              className="w-5 h-5 ml-2 shrink-0"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Tabla de grupos */}
        <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-600 uppercase">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("id")}
                  aria-sort={
                    sortBy === "id"
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  title="Ordenar por ID"
                >
                  ID{" "}
                  {sortBy === "id" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                  aria-sort={
                    sortBy === "name"
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  title="Ordenar por Nombre"
                >
                  Nombre{" "}
                  {sortBy === "name"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {sortedData.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold">{group.id}</td>
                  <td className="px-4 py-3 font-semibold">{group.name}</td>

                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {/* Editar grupo */}
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="text-blue-500 hover:text-blue-700"
                        aria-label="Editar grupo"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>

                      {/* Eliminar grupo */}
                      <button
                        onClick={() => {
                          const id =
                            typeof group.id === "string"
                              ? Number(group.id)
                              : group.id;
                          if (Number.isNaN(id)) {
                            showToast({
                              type: "error",
                              message: "ID inválido",
                            });
                            return;
                          }
                          void handleDeleteGroup(id as number);
                        }}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Eliminar grupo"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sortedData.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No hay grupos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal crear */}
          <GroupCreate
            isOpen={isOpen}
            onClose={closeCreate}
            onCreated={async () => {
              await refresh();
              closeCreate();
            }}
          />

          {/* Modal editar */}
          {editingGroup && (
            <GroupEdit
              isOpen={isOpenEdit}
              onClose={closeEditGroup}
              group={editingGroup}
              onUpdated={async () => {
                await refresh();
                closeEditGroup();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default withAdmin(PrivatePage);
