"use client";

import { useEffect, useRef, useState } from "react";

import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  RemoveFormatting,
  Quote,
} from "lucide-react";

export default function RichTextEditor({
  value = "",
  onChange,
}) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  const [activeFormats, setActiveFormats] = useState({});
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;

    onChange?.(editorRef.current.innerHTML);
    updateActiveFormats();
  };

  const saveSelection = () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    savedRangeRef.current = selection.getRangeAt(0);
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;

    if (!selection || !range) return;

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const updateActiveFormats = () => {
    if (typeof document === "undefined") return;

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const execCommand = (command, valueArg = null) => {
    restoreSelection();

    document.execCommand(command, false, valueArg);

    emitChange();

    editorRef.current?.focus();
  };

  const handleBold = () => {
    execCommand("bold");
  };

  const handleItalic = () => {
    execCommand("italic");
  };

  const handleHeading = (level) => {
    execCommand("formatBlock", `<${level}>`);
  };

  const handleBulletList = () => {
    execCommand("insertUnorderedList");
  };

  const handleNumberList = () => {
    execCommand("insertOrderedList");
  };

  const handleQuote = () => {
    execCommand("formatBlock", "<blockquote>");
  };

  const handleRemoveFormat = () => {
    execCommand("removeFormat");
  };

  const handleUndo = () => {
    execCommand("undo");
  };

  const handleRedo = () => {
    execCommand("redo");
  };

  const handleLinkOpen = () => {
    saveSelection();
    setShowLinkInput(true);
  };

  const handleAddLink = () => {
    const url = linkUrl.trim();

    if (!url) {
      setShowLinkInput(false);
      return;
    }

    restoreSelection();

    const finalUrl =
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:")
        ? url
        : `https://${url}`;

    document.execCommand("createLink", false, finalUrl);

    emitChange();

    setLinkUrl("");
    setShowLinkInput(false);

    editorRef.current?.focus();
  };

  const handleImage = () => {
    saveSelection();

    const url = window.prompt("Masukkan URL gambar:");

    if (!url) {
      editorRef.current?.focus();
      return;
    }

    restoreSelection();

    document.execCommand(
      "insertImage",
      false,
      url.trim()
    );

    emitChange();

    editorRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      handleBold();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
      event.preventDefault();
      handleItalic();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      handleLinkOpen();
    }
  };

  const ToolbarButton = ({
    onClick,
    active = false,
    title,
    children,
  }) => {
    return (
      <button
        type="button"
        title={title}
        aria-label={title}
        onMouseDown={(event) => {
          event.preventDefault();
          saveSelection();
        }}
        onClick={onClick}
        className={`inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-semibold transition ${
          active
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">

      {/* =========================
          TOOLBAR
      ========================== */}
      <div className="border-b border-slate-200 bg-slate-50/80 p-3">

        <div className="flex flex-wrap items-center gap-1.5">

          {/* TEXT */}
          <ToolbarButton
            onClick={handleBold}
            active={activeFormats.bold}
            title="Bold"
          >
            <Bold size={16} strokeWidth={2.2} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleItalic}
            active={activeFormats.italic}
            title="Italic"
          >
            <Italic size={16} strokeWidth={2.2} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleHeading("h2")}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleHeading("h3")}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* LIST */}
          <ToolbarButton
            onClick={handleBulletList}
            active={activeFormats.unorderedList}
            title="Bullet List"
          >
            <List size={17} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleNumberList}
            active={activeFormats.orderedList}
            title="Numbered List"
          >
            <ListOrdered size={17} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleQuote}
            title="Quote"
          >
            <Quote size={16} />
          </ToolbarButton>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* LINK & IMAGE */}
          <ToolbarButton
            onClick={handleLinkOpen}
            title="Tambah Link"
          >
            <LinkIcon size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleImage}
            title="Tambah Gambar"
          >
            <ImageIcon size={16} />
          </ToolbarButton>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* HISTORY */}
          <ToolbarButton
            onClick={handleUndo}
            title="Undo"
          >
            <Undo2 size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleRedo}
            title="Redo"
          >
            <Redo2 size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleRemoveFormat}
            title="Hapus Format"
          >
            <RemoveFormatting size={16} />
          </ToolbarButton>
        </div>

        {/* LINK INPUT */}
        {showLinkInput && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-blue-100 bg-white p-3 sm:flex-row">
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddLink();
                }

                if (event.key === "Escape") {
                  setShowLinkInput(false);
                  setLinkUrl("");
                  editorRef.current?.focus();
                }
              }}
              placeholder="https://contoh.com"
              className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />

            <button
              type="button"
              onClick={handleAddLink}
              className="h-10 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Tambahkan
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
                editorRef.current?.focus();
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      {/* =========================
          EDITOR
      ========================== */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onKeyDown={handleKeyDown}
        onBlur={saveSelection}
        data-placeholder="Tulis konten halaman di sini..."
        className="cms-editor min-h-[380px] w-full bg-white px-5 py-5 text-[15px] leading-7 text-slate-800 outline-none sm:px-6 sm:py-6"
      />

      {/* =========================
          FOOTER
      ========================== */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <span className="text-xs text-slate-400">
          Editor konten halaman
        </span>

        <span className="text-xs font-medium text-slate-400">
          HTML Content
        </span>
      </div>

      {/* =========================
          EDITOR STYLE
      ========================== */}
      <style jsx>{`
        .cms-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        .cms-editor h2 {
          font-size: 1.5rem;
          line-height: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .cms-editor h3 {
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .cms-editor p {
          margin-bottom: 0.75rem;
        }

        .cms-editor ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .cms-editor ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .cms-editor li {
          margin-bottom: 0.25rem;
        }

        .cms-editor blockquote {
          border-left: 3px solid #2563eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
        }

        .cms-editor a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .cms-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
        }

        .cms-editor:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}