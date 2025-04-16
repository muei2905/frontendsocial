import { create } from "zustand";

export const useMessageStore = create((set) => ({
  messages: [],
  setMessages: (updateFn) =>
    set((state) => ({ messages: updateFn(state.messages) })),
  shouldScrollToBottom: false,
  setShouldScrollToBottom: (value) => set({ shouldScrollToBottom: value }),
}));
