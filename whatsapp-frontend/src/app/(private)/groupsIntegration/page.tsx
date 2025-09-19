"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroupsIntegration } from "@/hooks/useGroupsIntegration";
import { GroupIntegration } from "@/types/groupIntegration";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import { showSweetAlert } from "@/components/common/Sweet";
import { GroupIntCreate } from "@/components/modal/GroupIntCreate";
import { GroupIntEdit } from "@/components/modal/GroupIntEdit";
import { withAdmin } from "@/guards/WithAuth";
import { useGroups } from "@/hooks/useGroups";
import Loader from "@/components/ui/Loader";
import { useSort } from "@/components/ui/table/sort";
import { showToast } from "@/components/common/Toast";

function PrivatePage() {
  const { groupIntegrations, loading, error, refresh, removeGroupIntegration } =
    useGroupsIntegration();
  const [selectedGroupIntegration, setSelectedGroupIntegration] =
    useState<GroupIntegration | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenAddAssociation, setIsOpenAddAssociation] = useState(false);
  const [editingGroupIntegration, setEditingGroupIntegration] =
    useState<GroupIntegration | null>(null);
  const groupIntegrationsForTable = useMemo(
    () =>
      groupIntegrations.map((g) => ({
        ...g,
        _groupName: g.group?.name ?? "(Sin grupo)",
      })),
    [groupIntegrations]
  );
  const { sortedData, sortBy, sortDirection, setSortBy, setSortDirection } =
    useSort(groupIntegrationsForTable, "_groupName", "asc");

  // Seleccionar primer grupo automáticamente
  useEffect(() => {
    if (groupIntegrations.length > 0 && !selectedGroupIntegration) {
      setSelectedGroupIntegration(groupIntegrations[0]);
    }
  }, [groupIntegrations, selectedGroupIntegration]);

  // Eliminar grupo usando el método del hook
  const handleDeleteGroupIntegration = async (id: number) => {
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

      await removeGroupIntegration(id);
      showToast({
        type: "success",
        message: "Grupo eliminado correctamente",
      });
      await refresh();
    } catch (err) {
      showToast({ type: "error", message: "Error al eliminar el grupo" });
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
  const handleCreateGroupIntegration = () => {
    setIsOpen(true);
  };

  const handleEditGroupIntegration = (g: GroupIntegration) => {
    setEditingGroupIntegration(g);
    setIsOpenEdit(true);
  };
  const closeEditGroupIntegration = () => {
    setIsOpenEdit(false);
    setEditingGroupIntegration(null);
  };

  const handleAddAssociation = (g: GroupIntegration) => {
    setEditingGroupIntegration(g);
    setIsOpenAddAssociation(true);
  };
  const closeAddAssociation = () => {
    setIsOpenAddAssociation(false);
    setEditingGroupIntegration(null);
  };

  const toggleSort = (
    key: keyof (typeof groupIntegrationsForTable)[number]
  ) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  if (loading) return <Loader message="Cargando grupos" showTips={true} />;
  if (error) return <div>Error: {error}</div>;
  if (!groupIntegrations.length) return <div>Sin grupos.</div>;

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Listado</h2>
          <button
            onClick={handleCreateGroupIntegration}
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
                >
                  ID{" "}
                  {sortBy === "id" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("_groupName")}
                  aria-sort={
                    sortBy === "_groupName"
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  Grupo{" "}
                  {sortBy === "_groupName"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("accessTokenId")}
                  aria-sort={
                    sortBy === "accessTokenId"
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  TokenId{" "}
                  {sortBy === "accessTokenId"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("phoneNumberId")}
                  aria-sort={
                    sortBy === "phoneNumberId"
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  PhoneNumberId{" "}
                  {sortBy === "phoneNumberId"
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("Waba_id")}
                  aria-sort={
                    sortBy === "Waba_id"
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  Waba_id{" "}
                  {sortBy === "Waba_id"
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
                <tr
                  key={group.id}
                  className={`transition ${
                    group.id === selectedGroupIntegration?.id
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{group.id}</td>
                  <td className="px-4 py-3 font-semibold">{group._groupName}</td>
                  <td className="px-4 py-3 font-semibold flex items-center gap-2">
                    <span className="max-w-xs truncate">
                      {group.accessTokenId}
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(group.accessTokenId)
                      }
                      className="text-sm text-purple-400 hover:text-purple-600"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {group.phoneNumberId}
                  </td>
                  <td className="px-4 py-3 font-semibold">{group.Waba_id}</td>

                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {/* Editar grupo */}
                      <button
                        onClick={() => handleEditGroupIntegration(group)}
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
                          void handleDeleteGroupIntegration(id as number);
                        }}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
          {/* Modal */}
          <GroupIntCreate
            isOpen={isOpen}
            onClose={closeCreate}
            onCreated={async () => {
              await refresh();
              closeCreate();
            }}
          />
          {/* Modal de edición (único) */}
          {editingGroupIntegration && (
            <GroupIntEdit
              isOpen={isOpenEdit}
              onClose={closeEditGroupIntegration}
              group={editingGroupIntegration}
              onUpdated={async () => {
                await refresh();
                closeEditGroupIntegration();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default withAdmin(PrivatePage);
