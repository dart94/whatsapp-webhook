export default function Sandbox() {
  return (
    <div className="h-[100dvh] grid grid-rows-[auto,1fr,auto]">
      <div className="bg-white border-b p-2">Header</div>
      <div className="min-h-0">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-gray-100">Mensaje {i+1}</div>
          ))}
        </div>
      </div>
      <div className="border-t bg-white p-2">TextBox</div>
    </div>
  );
}