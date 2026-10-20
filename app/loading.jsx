// US-28: Loading skeleton kustom di halaman yang memuat data
export default function Loading() {
  return (
    <div className="py-10 flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="h-10 w-64 rounded-xl bg-permukaan" />
        <div className="h-5 w-96 rounded-lg bg-permukaan" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
          >
            <div className="aspect-square w-full bg-permukaan" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-16 rounded bg-permukaan" />
              <div className="h-4 w-36 rounded bg-permukaan" />
              <div className="mt-2 h-5 w-24 rounded bg-permukaan" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
