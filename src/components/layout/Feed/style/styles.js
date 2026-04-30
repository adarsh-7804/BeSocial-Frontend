//  Inputs 
export const input =
  "w-full bg-[#FFF8F0] border border-[#C08552]/30 rounded-xl px-3 py-2 text-sm " +
  "text-[#2C1A0E] placeholder-[#C08552]/40 outline-none focus:border-[#C08552] transition-colors";

export const inputWithPrefix = `${input} pl-16`;

export const inputReadOnly = `${input} cursor-default`;

export const textarea = `${input} resize-none`;

//  Buttons 
export const btnSave =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95";

export const btnVerify =
  "flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap active:scale-95 disabled:opacity-60";

export const btnVerified =
  "flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-green-100 text-green-600 border border-green-200 whitespace-nowrap";

export const btnVisibilityToggle =
  "w-9 h-9 rounded-xl flex items-center justify-center border transition-all";

export const btnCoverEdit =
  "absolute bottom-3 right-4 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 " +
  "text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all";

export const btnAvatarCamera =
  "absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full shadow-lg " +
  "flex items-center justify-center border-2 border-[#FFF8F0] transition-all active:scale-90";

export const btnMenuTrigger =
  "flex items-center gap-2 text-[#8C5A3C] hover:text-[#C08552] transition-colors";

export const btnSidebarClose =
  "absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10";

export const btnDangerPrimary =
  "w-full text-white text-sm font-semibold py-2.5 rounded-xl mb-2 transition-all active:scale-95";

export const btnDangerSecondary =
  "w-full bg-white text-red-600 border border-red-300 text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 hover:bg-red-50";

//  Layout / Containers 
export const pageRoot =
  "w-full min-h-screen bg-[#FFF8F0] flex flex-col";

export const stickyHeader =
  "sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-[#FFF8F0] border-b border-[#C08552]/20";

export const bodyScroll = "flex-1 overflow-y-auto pb-12";

export const cardSections = "px-5 flex flex-col gap-3";

export const nameRow = "pt-16 px-5 pb-2";

export const nameRowInner = "flex items-end gap-3";

//  Card 
export const card =
  "border border-[#C08552]/25 rounded-2xl bg-white/65 backdrop-blur-sm px-4 py-4 shadow-sm";

export const cardHeader =
  "flex items-center gap-2 mb-3 pb-2 border-b border-[#C08552]/15";

export const cardHeaderLabel =
  "text-xs font-bold text-[#8C5A3C] uppercase tracking-widest";

//  FieldLabel 
export const fieldLabel =
  "flex items-center gap-1 mb-1.5 text-[10px] font-bold text-[#8C5A3C] uppercase tracking-widest";

//  Tags 
export const tagContainer =
  "flex flex-wrap gap-2 p-2.5 rounded-xl border border-[#C08552]/30 " +
  "bg-[#FFF8F0] focus-within:border-[#C08552] transition-colors cursor-text min-h-[46px]";

export const tagChip =
  "flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-semibold select-none";

export const tagChipRemoveBtn =
  "w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#C08552]/25 transition-colors";

export const tagInput =
  "outline-none bg-transparent text-xs text-[#2C1A0E] placeholder-[#C08552]/40 min-w-[120px] flex-1";

export const tagHint = "text-[10px] text-[#8C5A3C]/60 mt-1.5 ml-0.5";

export const tagKbd =
  "px-1 py-0.5 rounded bg-[#C08552]/10 text-[#8C5A3C] font-mono text-[9px]";

//  Gender / read-only display 
export const readOnlyDisplay =
  "px-3 py-2 rounded-xl border border-[#C08552]/30 bg-[#FFF8F0] text-sm text-[#2C1A0E]";

//  Bio counter 
export const bioCounter = "text-right text-[10px] text-[#C08552]/60 mt-1";

//  Visibility hint text 
export const visibilityHint = "text-[10px] mt-1 ml-1";

//  Spinner 
export const spinner =
  "w-3 h-3 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin";

//  Danger zone 
export const dangerZoneWrapper =
  "rounded-2xl border border-red-200 bg-red-50/60 p-4 mt-1";

export const dangerZoneTitle =
  "text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3";

//  Avatar / banner 
export const avatarRing =
  "w-full h-full rounded-full border-[3px] border-[#FFF8F0] overflow-hidden shadow-xl bg-[#F5E6D3]";

export const badgePin =
  "absolute -bottom-1.5 -left-1.5 w-8 h-8 rounded-full shadow-lg flex items-center justify-center border-2 border-[#FFF8F0]";

//  Sidebar overlay 
export const sidebarOverlay =
  "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm";
