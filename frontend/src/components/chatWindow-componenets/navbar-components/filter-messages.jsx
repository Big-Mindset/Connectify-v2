import { chatStore } from "@/store/Chat-store";
import { navigationStore } from "@/store/navigation-store";
import { Search, RotateCcw, Plus, X, Check } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

export default function MessageFilter({ref ,setFilterTab}) {
  const getParticipants = chatStore((s) => s.getParticipants);

  const [participants, setParticipants] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [participantQuery, setParticipantQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  let [order , setOrder] = useState("")
  const [dates , setDates] = useState({})
  const filters  = navigationStore(s=>s.filters)
  const setFilters = navigationStore(s=>s.setFilters)
  const today = useMemo(() => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }, []);
  const openParticipantPicker = () => {
    const users = getParticipants?.() || [];
    setParticipants(users);
    setIsPickerOpen(true);
  };

  const closeParticipantPicker = () => {
    setIsPickerOpen(false);
    setParticipantQuery("");
  };

  const toggleParticipant = (user) => {
    setSelectedParticipants((prev) => {
      const exists = prev.some((p) => p.id === user.id);
      if (exists) {
        return prev.filter((p) => p.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const removeSelectedParticipant = (id) => {
    setSelectedParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredParticipants = participants.filter((user) => {
    const name = user.name || user.username || user.fullName || "";
    return (
      name.toLowerCase().includes(participantQuery.toLowerCase()) ||
      String(user.id).toLowerCase().includes(participantQuery.toLowerCase())
    );
  });
  let handleSearch = ()=>{
    let usersSet = new Set(selectedParticipants)
    let newSender = filters?.senders?.find((sender)=>!usersSet.has(sender.id))
    
    if (filters.from === dates.from && filters.to === dates.to && filters.order === order && !newSender) return
    setFilters((filters)=>{
      return {...filters , from :dates.from, to : dates.to , order : order , senders : selectedParticipants.map((user)=>user , order )}
    })
    setFilterTab(false)
  }
  useLayoutEffect(()=>{
    let {content , ...rest} = filters 
    if (Object.keys(rest).length > 0){

      setSelectedParticipants(filters?.senders || [])
      setOrder(filters?.order || "desc")
      setDates({from : filters?.from || "" , to  : filters?.to || ""})
    }
    },[])

  return (
    <div ref={ref} className="absolute right-0 top-14 z-[200] w-[350px]  rounded-2xl border border-indigo-400/30 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-4">
        <h2 className="text-md font-semibold text-white">Search messages</h2>
        <p className="text-[0.8rem] text-zinc-400">
          Filter messages by date, sender, and order
        </p>
      </div>

      <div className="space-y-4 ">
        <div>
          <label className="mb-1 block text-[0.8rem]  font-semibold text-zinc-300">
            From created at
          </label>
          <input
          onChange={(e)=>setDates(prev=>({...prev , from :e.target.value }))}
            type="date"
          value={dates.from || ""}

            max={today}
            className="w-full   [&::-webkit-calendar-picker-indicator]:invert
    [&::-webkit-calendar-picker-indicator]:cursor-pointer cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            To created at
          </label>
          <input
          onChange={(e)=>setDates(prev=>({...prev , to :e.target.value }))}
          value={dates.to || ""}
            type="date"
            max={today}
            className="w-full  [&::-webkit-calendar-picker-indicator]:invert
    [&::-webkit-calendar-picker-indicator]:cursor-pointer cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="relative">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Sent by
          </label>

          {selectedParticipants.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {selectedParticipants.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200"
                >
                  <span>{user.name || user.username || user.fullName || user.id}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedParticipant(user.id)}
                    className="rounded-full p-1 hover:bg-indigo-500/20"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={openParticipantPicker}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-zinc-500"
          >
            <span>
              {selectedParticipants.length > 0
                ? `${selectedParticipants.length} participant(s) selected`
                : "Select participants"}
            </span>
            <Plus className="h-4 w-4" />
          </button>

          {isPickerOpen && (
            <div className="absolute left-0 top-[calc(100%+10px)] z-[250] w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-3 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Choose participants
                </h3>
                <button
                  type="button"
                  onClick={closeParticipantPicker}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-3">
                <input
                  value={participantQuery}
                  onChange={(e) => setParticipantQuery(e.target.value)}
                  placeholder="Search participant..."
                  className="w-full rounded-xl border  border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto pr-1">
                {filteredParticipants.length > 0 ? (
                  <div className="space-y-2">
                    {filteredParticipants.map((user) => {
                      const selected = selectedParticipants.some((p) => p.id === user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleParticipant(user)}
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${selected
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                            }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {user.name || user.username || user.fullName || "Unknown user"}
                            </p>
                            <p className="truncate text-xs text-zinc-400">{user.username}</p>
                          </div>

                          <div className="ml-3 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-600">
                            {selected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-700 py-8 text-center text-sm text-zinc-500">
                    No participants found
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedParticipants([])}
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-500"
                >
                  Clear selected
                </button>

                <button
                  type="button"
                  onClick={closeParticipantPicker}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Order
          </label>
          <select  onChange={(e)=>setOrder(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500">
            <option  value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
          onClick={handleSearch}
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Search className="h-4 w-4" />
            Search
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-500"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}