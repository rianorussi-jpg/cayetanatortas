import React, { useState, useEffect, useRef } from "react";

// ── Telegram (notificaciones de pedido) ──────────────────────────────────────
// Reemplaza estos dos valores con el bot y chat de Cayetana Tortas antes de publicar.
// (Cuando lo subas a tu proyecto Vite puedes volver a usar import.meta.env.VITE_TG_TOKEN si prefieres.)
const TG_TOKEN   = "TU_TELEGRAM_BOT_TOKEN";
const TG_CHAT_ID = "TU_TELEGRAM_CHAT_ID";

async function sendTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML" }),
    });
  } catch (e) { console.error("Telegram error:", e); }
}

// ── Paleta gris + verde ───────────────────────────────────────────────────────
const bg      = "#f3f4f1";
const card    = "#ffffff";
const cardHi  = "#eef1ec";
const border  = "#d9ddd6";
const accent  = "#2f6b46";
const accentS = "#3c8058";
const text    = "#1c1f1c";
const muted   = "#707870";
const pill    = "#eef1ec";

// ── Logo del negocio (pon aquí el link de tu logo; si lo dejas vacío se usa el emoji) ──
const LOGO_URL = "https://i.ibb.co/W4SvMyCv/5e26413f-e31e-4c30-a665-ed9aa4c57d3a.jpg"; // Ej: "https://tusitio.com/logo.png"

// ── Zonas de entrega — envío gratis en las 3 colonias ────────────────────────
const ZONAS = ["Zakia", "Zibatá", "El Refugio"];
const ENVIO_POR_ZONA = { "Zakia": 0, "Zibatá": 0, "El Refugio": 0 };
const ENVIO_FALLBACK = 0;
const envioTxt = (v) => (v === 0 ? "Gratis" : `$${v}`);

// ── Menú (tortas) ──────────────────────────────────────────────────────────
const MENU = {
  consentidas: {
    label: "Tortas Consentidas", emoji: "🥪",
    items: [
      { id: "pierna",      emoji: "🥪", imagen: "https://i.ibb.co/rKNGrSTQ/IMG-5968.jpg", nombre: "Pierna",         desc: "Pierna adobada al horno c/ mayonesa en el pan", precios: { "Sencilla": 60, "c/Queso": 80 } },
      { id: "mole-pollo",  emoji: "🥪", imagen: "https://i.ibb.co/XxmR3BcC/PHOTO-2026-07-07-12-42-06.jpg", nombre: "Mole con Pollo", desc: "Mole rojo con pechuga de pollo c/ mayonesa en el pan", precios: { "Sencilla": 60, "c/Queso": 80 } },
    ],
  },
  clasicas: {
    label: "Tortas Clásicas", emoji: "🥪",
    items: [
      { id: "mila-cerdo", emoji: "🥪", imagen: "https://i.ibb.co/b56tFbyt/IMG-5966.jpg", nombre: "Milanesa de Cerdo",  desc: "Milanesa de cerdo, mayonesa, jitomate, cebolla, aguacate", precios: { "Sencilla": 70,  "c/Queso": 90  } },
      { id: "mila-res",   emoji: "🥪", imagen: "https://i.ibb.co/b56tFbyt/IMG-5966.jpg", nombre: "Milanesa de Res",    desc: "Milanesa de res, mayonesa, jitomate, cebolla, aguacate",   precios: { "Sencilla": 120, "c/Queso": 140 } },
      { id: "pechuga",    emoji: "🥪", imagen: "https://i.ibb.co/b56tFbyt/IMG-5966.jpg", nombre: "Pechuga Empanizada", desc: "Pechuga de pollo, mayonesa, jitomate, cebolla, aguacate",  precios: { "Sencilla": 70,  "c/Queso": 90  } },
    ],
  },
  fancy: {
    label: "Tortas Fancy", emoji: "✨",
    items: [
      { id: "bacalao",         emoji: "✨", imagen: "https://i.ibb.co/ZpCT7NK0/IMG-5969.jpg", nombre: "Bacalao",                  desc: "Bacalao c/ mayonesa en el pan",                                           precios: { "Sencilla": 140, "c/Queso": 160 } },
      { id: "arrachera",       emoji: "✨", imagen: "https://i.ibb.co/6J7y0xp1/PHOTO-2026-07-07-12-43-48.jpg", nombre: "Arrachera",                desc: "Carne arrachera, mayonesa, jitomate, cebolla, aguacate",                  precios: { "Sencilla": 120, "c/Queso": 140 } },
      { id: "rost-beef",       emoji: "✨", imagen: "https://i.ibb.co/d4SGS8d0/IMG-5967.jpg", nombre: "Rost Beef",                desc: "Rost beef, mayonesa, arugula, queso manchego, aioli de serrano",          precios: { "Sencilla": 120, "c/Queso": 140 } },
      { id: "camarones",       emoji: "✨", imagen: "https://i.ibb.co/LdPpMFmK/PHOTO-2026-07-07-12-46-48.jpg", nombre: "Camarones Rebozados",      desc: "Camarón, aguacate, arugula, aioli de serrano",                            precios: { "Sencilla": 140, "c/Queso": 160 } },
      { id: "filete-pescado",  emoji: "✨", imagen: "https://i.ibb.co/F4T6CWSf/IMG-5970.jpg", nombre: "Filete de Pescado al Horno", desc: "Filete, mayonesa, elote, epazote, mantequilla",                         precios: { "Único": 120 } },
      { id: "jamon-serrano",   emoji: "✨", imagen: "https://i.ibb.co/fGDLGxBC/PHOTO-2026-07-07-12-36-50.jpg", nombre: "Jamón Serrano",            desc: "Mayonesa, ajo confitado, tomate confitado, queso de cabra, toque de aceite de oliva, albahaca", precios: { "Único": 160 } },
    ],
  },
  comidas: {
    label: "Comidas", emoji: "🍽️",
    items: [
      { id: "chilaquiles", emoji: "🍽️", imagen: "https://i.ibb.co/zHHYVV9P/94c8048f-2dab-4f1d-a00f-876935cdcda6.jpg", nombre: "Chilaquiles", desc: "Arma tus chilaquiles: elige salsa y si los quieres con proteína", tipo: "chilaquiles", desdePrecio: 70 },
      { id: "flautas",     emoji: "🌯", imagen: "https://i.ibb.co/ccJv99pF/30d71fa4-4036-4a65-98fc-5a4b536bf727.jpg", nombre: "5 Flautas",    desc: "Cinco flautas doradas, elige pollo o papa",       precios: { "Pollo": 85, "Papa": 85 } },
      { id: "hotdog",      emoji: "🌭", imagen: "https://i.ibb.co/5X2TWW3W/40d91672-f1c2-472a-a4f5-570d0f9d9312.jpg", nombre: "Hot Dog",      desc: "Elige tu estilo",                                  precios: { "Sencillo": 55, "Tocino": 65, "Embonazado": 75 } },
      { id: "ensalada",    emoji: "🥗", imagen: "https://i.ibb.co/XrWGcs7K/8a71b8e3-85a7-4eb5-9d67-917ddbd6e8c6.jpg", nombre: "Ensalada",     desc: "Arma tu ensalada: sencilla o con proteína a elegir", tipo: "ensalada", desdePrecio: 60 },
      { id: "dobladas",    emoji: "🌮", imagen: "https://i.ibb.co/zhxCLd62/71507f02-b671-4dcc-aa17-4ecbae331308.jpg", nombre: "5 Dobladas",   desc: "Cinco dobladas doradas, elige verdes o rojas",     precios: { "Verdes": 60, "Rojas": 60 } },
      { id: "boneless",    emoji: "🍗", imagen: "https://i.ibb.co/k66czGtC/3a509169-fb1d-43a6-944d-243738c2a114.jpg", nombre: "Boneless 250g", desc: "Arma tu orden: elige salsa y si quieres agregar papas", tipo: "boneless", desdePrecio: 120 },
      { id: "alitas",      emoji: "🍗", imagen: "https://i.ibb.co/0VcHX9XP/75395435-9384-4687-a452-ecdbe854b568.jpg", nombre: "Alitas 10Pz",   desc: "Arma tu orden: elige tu salsa",                     tipo: "alitas", desdePrecio: 170 },
    ],
  },
  complementos: {
    label: "Complementos", emoji: "🍟",
    items: [
      { id: "papas-francesa", emoji: "🍟", imagen: "https://i.ibb.co/n87mt7f7/3a05253e-a9c0-4e76-a229-2faa685132b4.jpg", nombre: "Papas a la Francesa",  desc: "Porción de papas fritas",              precios: { "Orden": 65 } },
      { id: "dedos-queso",    emoji: "🧀", imagen: "https://i.ibb.co/nMNJt2tB/PHOTO-2026-07-07-12-33-41.jpg", nombre: "4 Dedos de Queso",     desc: "Dedos de queso empanizados",           precios: { "Orden": 85 } },
      { id: "palomitas-pollo",emoji: "🍗", imagen: "https://i.ibb.co/rGv0yHBD/PHOTO-2026-07-07-12-34-47.jpg", nombre: "Palomitas de Pollo",   desc: "Trocitos de pollo empanizado",         precios: { "Orden": 120 } },
      { id: "salsa-chipotle", emoji: "🌶️", imagen: "https://i.ibb.co/tw4PkWLJ/9edd01e9-9c68-4153-8e5e-9896a2718209.jpg", nombre: "Salsa de Chipotle",    desc: "Extra picante",                        precios: { "Orden": 15 } },
      { id: "chiles-vinagre", emoji: "🌶️", imagen: "https://i.ibb.co/XvZqHRx/899bc84a-6481-4b5b-877c-61ac85c0f75f.jpg", nombre: "Chiles en Vinagre",    desc: "Chiles jalapeños en vinagre",          precios: { "Orden": 15 } },
      { id: "agua-fruta",     emoji: "🥤", imagen: "https://i.ibb.co/qMWYtHVV/7fa6f5d5-120b-41b0-ae4a-3ef16f6f7d36.jpg", nombre: "Agua de Fruta Natural", desc: "Agua fresca del día, 1 litro",         precios: { "1lt": 45 } },
      { id: "coca-cola",      emoji: "🥤", imagen: "https://resources.coca-colaentuhogar.com/media/catalog/product/c/o/coccol-orig-nor-pet-600ml-4pz_6.png?quality=100&fit=bounds&height=550&width=550&format=webp", nombre: "Coca-Cola",            desc: "Refresco 600ml",                       precios: { "355ml": 35 } },
    ],
  },
};

const SALSAS_CHILAQUILES    = ["Verdes", "Rojos", "Mole"];
const PROTEINAS_CHILAQUILES = ["Huevo", "Pollo", "Arrachera", "Chorizo"];
const PROTEINAS_ENSALADA    = ["Pechuga a la plancha", "Res", "Arrachera", "Atún"];
const SALSAS_ALITAS         = ["BBQ", "Búfalo", "Parmesano", "Lemon Pepper"];

// ── Horario (ejemplo: todos los días 10:00–21:00) ────────────────────────────
function estaAbierto(hour, minute) {
  const mins = hour * 60 + minute;
  return mins >= 10 * 60 && mins < 21 * 60;
}
function getHorarios() {
  const slots = ["Lo antes posible"];
  for (let h = 10; h < 21; h++) slots.push(`${String(h).padStart(2, "0")}:00–${String(h + 1).padStart(2, "0")}:00`);
  return slots;
}

const s = {
  label: { fontFamily: "system-ui,sans-serif", fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 },
  input: { width: "100%", boxSizing: "border-box", background: card, border: `1.5px solid ${border}`, borderRadius: 14, padding: "13px 16px", fontFamily: "system-ui,sans-serif", fontSize: 15, color: text, outline: "none" },
};

function carritoLineKey(i) {
  return i.uid || `${i.id}|${i.tamano}|${i.precio}`;
}

function buildResumen(carrito) {
  return carrito.flatMap(i => {
    if (i.extras) {
      return Array.from({ length: i.cantidad }, () =>
        `1× ${i.nombre} (${i.tamano}) — $${i.precio.toFixed(0)}\n   └ ${i.extras}`
      );
    }
    return [`${i.cantidad}× ${i.nombre} (${i.tamano}) — $${(i.precio * i.cantidad).toFixed(0)}`];
  }).join("\n");
}

function Btn({ children, onClick, variant = "primary", disabled }) {
  const base = { border: "none", cursor: disabled ? "default" : "pointer", borderRadius: 14, fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 15, transition: "opacity 0.15s", opacity: disabled ? 0.4 : 1 };
  if (variant === "primary") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: accent, color: "#fff", padding: "14px 0", width: "100%" }}>{children}</button>;
  if (variant === "ghost")   return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "none", color: muted, padding: "14px 0" }}>{children}</button>;
}

// ── Imagen de producto con emoji de respaldo si no hay link de imagen ────────
function ItemMedia({ imagen, emoji, size = 30 }) {
  const [error, setError] = useState(false);
  if (imagen && !error) {
    return <img src={imagen} alt="" onError={() => setError(true)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />;
  }
  return <span style={{ fontSize: size }}>{emoji}</span>;
}

function Pasos({ paso }) {
  const steps = ["Menú", "Entrega", "Confirmar"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, margin: "8px 0 28px" }}>
      {steps.map((label, i) => {
        const n = i + 1, active = paso === n, done = paso > n;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 14, background: active ? accent : done ? accentS : pill, color: active || done ? "#fff" : muted, border: active ? `2px solid ${accentS}` : "2px solid transparent" }}>{done ? "✓" : n}</div>
              <span style={{ fontFamily: "system-ui,sans-serif", fontSize: 11, color: active ? text : muted, fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 48, height: 2, background: paso > n ? accentS : border, margin: "0 8px", marginBottom: 18 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Estilos compartidos de los modales "armar tu platillo" ───────────────────
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" };
const modalSheet   = { background: bg, borderRadius: "24px 24px 0 0", padding: "24px 20px 36px", maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" };
const modalSecTitle = { fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 13, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", margin: "18px 0 10px" };
const modalChip = (sel) => ({ border: `1.5px solid ${sel ? accent : border}`, background: sel ? accent + "22" : card, borderRadius: 10, padding: "8px 13px", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontSize: 13, fontWeight: 600, color: sel ? accent : text, display: "flex", alignItems: "center", gap: 6 });

// ── Modal: armar Chilaquiles (salsa + sencillos o con proteína) ─────────────
function ChilaquilesModal({ item, onConfirm, onClose }) {
  const [salsa, setSalsa]     = useState(null);
  const [modo, setModo]       = useState(null); // "sencillos" | "proteina"
  const [proteina, setProteina] = useState(null);
  const [error, setError]     = useState("");

  const precio = modo === "proteina" ? 110 : 70;

  const handleConfirm = () => {
    if (!salsa) { setError("Elige tu salsa"); setTimeout(() => setError(""), 2000); return; }
    if (!modo) { setError("Elige sencillos o con proteína"); setTimeout(() => setError(""), 2000); return; }
    if (modo === "proteina" && !proteina) { setError("Elige tu proteína"); setTimeout(() => setError(""), 2000); return; }
    const tamano = `Salsa ${salsa}${modo === "proteina" ? ` · Con proteína (${proteina})` : " · Sencillos"}`;
    onConfirm({ tamano, precio });
  };

  return (
    <div style={modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalSheet}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 18, color: text }}>Arma tus chilaquiles 🍽️</div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginTop: 3 }}>Elige salsa y presentación</div>
          </div>
          <button onClick={onClose} style={{ background: pill, border: "none", borderRadius: "50%", width: 34, height: 34, fontSize: 18, cursor: "pointer", color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={modalSecTitle}>Salsa</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SALSAS_CHILAQUILES.map(op => <button key={op} onClick={() => setSalsa(op)} style={modalChip(salsa === op)}>{op}</button>)}
        </div>
        <div style={modalSecTitle}>Presentación</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => { setModo("sencillos"); setProteina(null); }} style={modalChip(modo === "sencillos")}>Sencillos <span style={{ fontSize: 11, color: modo === "sencillos" ? accent : muted }}>$70</span></button>
          <button onClick={() => setModo("proteina")} style={modalChip(modo === "proteina")}>Con proteína <span style={{ fontSize: 11, color: modo === "proteina" ? accent : muted }}>$110</span></button>
        </div>
        {modo === "proteina" && (
          <>
            <div style={modalSecTitle}>Elige tu proteína</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PROTEINAS_CHILAQUILES.map(p => <button key={p} onClick={() => setProteina(p)} style={modalChip(proteina === p)}>{p}</button>)}
            </div>
          </>
        )}
        {error && <div style={{ background: accent + "18", border: `1px solid ${accent}55`, borderRadius: 10, padding: "10px 14px", fontFamily: "system-ui,sans-serif", fontSize: 13, color: accent, marginTop: 14 }}>{error}</div>}
        <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 16px", marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 20, color: accent }}>Total: ${precio}</div>
          <button onClick={handleConfirm} style={{ background: accent, border: "none", borderRadius: 12, padding: "12px 22px", fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", cursor: "pointer" }}>+ Agregar 🍽️</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: armar Ensalada (sencilla o con proteína) ──────────────────────────
function EnsaladaModal({ item, onConfirm, onClose }) {
  const [modo, setModo]         = useState(null); // "sencilla" | "proteina"
  const [proteina, setProteina] = useState(null);
  const [error, setError]       = useState("");

  const precio = modo === "proteina" ? 150 : 60;

  const handleConfirm = () => {
    if (!modo) { setError("Elige sencilla o con proteína"); setTimeout(() => setError(""), 2000); return; }
    if (modo === "proteina" && !proteina) { setError("Elige tu proteína"); setTimeout(() => setError(""), 2000); return; }
    const tamano = modo === "proteina" ? `Con proteína (${proteina})` : "Sencilla";
    onConfirm({ tamano, precio });
  };

  return (
    <div style={modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalSheet}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 18, color: text }}>Arma tu ensalada 🥗</div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginTop: 3 }}>Elige presentación</div>
          </div>
          <button onClick={onClose} style={{ background: pill, border: "none", borderRadius: "50%", width: 34, height: 34, fontSize: 18, cursor: "pointer", color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={modalSecTitle}>Presentación</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => { setModo("sencilla"); setProteina(null); }} style={modalChip(modo === "sencilla")}>Sencilla <span style={{ fontSize: 11, color: modo === "sencilla" ? accent : muted }}>$60</span></button>
          <button onClick={() => setModo("proteina")} style={modalChip(modo === "proteina")}>Con proteína <span style={{ fontSize: 11, color: modo === "proteina" ? accent : muted }}>$150</span></button>
        </div>
        {modo === "proteina" && (
          <>
            <div style={modalSecTitle}>Elige tu proteína</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PROTEINAS_ENSALADA.map(p => <button key={p} onClick={() => setProteina(p)} style={modalChip(proteina === p)}>{p}</button>)}
            </div>
          </>
        )}
        {error && <div style={{ background: accent + "18", border: `1px solid ${accent}55`, borderRadius: 10, padding: "10px 14px", fontFamily: "system-ui,sans-serif", fontSize: 13, color: accent, marginTop: 14 }}>{error}</div>}
        <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 16px", marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 20, color: accent }}>Total: ${precio}</div>
          <button onClick={handleConfirm} style={{ background: accent, border: "none", borderRadius: 12, padding: "12px 22px", fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", cursor: "pointer" }}>+ Agregar 🥗</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: armar Boneless (salsa + papas opcionales) ─────────────────────────
function BonelessModal({ item, onConfirm, onClose }) {
  const [salsa, setSalsa] = useState(null);
  const [papas, setPapas] = useState(false);
  const [error, setError] = useState("");

  const precio = 120 + (papas ? 20 : 0);

  const handleConfirm = () => {
    if (!salsa) { setError("Elige tu salsa"); setTimeout(() => setError(""), 2000); return; }
    const tamano = `Salsa ${salsa}${papas ? " + Papas (+$20)" : ""}`;
    onConfirm({ tamano, precio });
  };

  return (
    <div style={modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalSheet}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 18, color: text }}>Arma tu Boneless 🍗</div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginTop: 3 }}>250g — Elige tu salsa</div>
          </div>
          <button onClick={onClose} style={{ background: pill, border: "none", borderRadius: "50%", width: 34, height: 34, fontSize: 18, cursor: "pointer", color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={modalSecTitle}>Salsa</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SALSAS_ALITAS.map(op => <button key={op} onClick={() => setSalsa(op)} style={modalChip(salsa === op)}>{op}</button>)}
        </div>
        <div style={modalSecTitle}>Extra</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => setPapas(v => !v)} style={modalChip(papas)}>Agregar papas <span style={{ fontSize: 11, color: papas ? accent : muted }}>+$20</span></button>
        </div>
        {error && <div style={{ background: accent + "18", border: `1px solid ${accent}55`, borderRadius: 10, padding: "10px 14px", fontFamily: "system-ui,sans-serif", fontSize: 13, color: accent, marginTop: 14 }}>{error}</div>}
        <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 16px", marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 20, color: accent }}>Total: ${precio}</div>
          <button onClick={handleConfirm} style={{ background: accent, border: "none", borderRadius: 12, padding: "12px 22px", fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", cursor: "pointer" }}>+ Agregar 🍗</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: armar Alitas (solo salsa) ─────────────────────────────────────────
function AlitasModal({ item, onConfirm, onClose }) {
  const [salsa, setSalsa] = useState(null);
  const [error, setError] = useState("");
  const precio = item.desdePrecio;

  const handleConfirm = () => {
    if (!salsa) { setError("Elige tu salsa"); setTimeout(() => setError(""), 2000); return; }
    onConfirm({ tamano: `Salsa ${salsa}`, precio });
  };

  return (
    <div style={modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalSheet}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 18, color: text }}>Arma tus Alitas 🍗</div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginTop: 3 }}>10 piezas — Elige tu salsa</div>
          </div>
          <button onClick={onClose} style={{ background: pill, border: "none", borderRadius: "50%", width: 34, height: 34, fontSize: 18, cursor: "pointer", color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={modalSecTitle}>Salsa</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SALSAS_ALITAS.map(op => <button key={op} onClick={() => setSalsa(op)} style={modalChip(salsa === op)}>{op}</button>)}
        </div>
        {error && <div style={{ background: accent + "18", border: `1px solid ${accent}55`, borderRadius: 10, padding: "10px 14px", fontFamily: "system-ui,sans-serif", fontSize: 13, color: accent, marginTop: 14 }}>{error}</div>}
        <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 16px", marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 20, color: accent }}>Total: ${precio}</div>
          <button onClick={handleConfirm} style={{ background: accent, border: "none", borderRadius: 12, padding: "12px 22px", fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", cursor: "pointer" }}>+ Agregar 🍗</button>
        </div>
      </div>
    </div>
  );
}

function ProductoCard({ item, onAdd, carritoItems }) {
  const esArmable = item.tipo === "chilaquiles" || item.tipo === "ensalada" || item.tipo === "boneless" || item.tipo === "alitas";
  const tamanos = esArmable ? [] : Object.keys(item.precios);
  const [tam, setTam]     = useState(tamanos[0]);
  const [flash, setFlash] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const enCarrito = carritoItems.filter(i => i.id === item.id).reduce((s, i) => s + i.cantidad, 0);
  const precioActual = esArmable ? null : item.precios[tam];

  const handleAdd = () => {
    if (esArmable) { setShowModal(true); return; }
    onAdd({ id: item.id, nombre: item.nombre, tamano: tam, precio: precioActual, emoji: item.emoji, imagen: item.imagen });
    setFlash(true); setTimeout(() => setFlash(false), 900);
  };
  const handleArmarConfirm = ({ tamano, precio }) => {
    onAdd({ id: item.id, nombre: item.nombre, tamano, precio, emoji: item.emoji, imagen: item.imagen });
    setShowModal(false);
    setFlash(true); setTimeout(() => setFlash(false), 900);
  };

  return (
    <>
      {showModal && item.tipo === "chilaquiles" && (
        <ChilaquilesModal item={item} onConfirm={handleArmarConfirm} onClose={() => setShowModal(false)} />
      )}
      {showModal && item.tipo === "ensalada" && (
        <EnsaladaModal item={item} onConfirm={handleArmarConfirm} onClose={() => setShowModal(false)} />
      )}
      {showModal && item.tipo === "boneless" && (
        <BonelessModal item={item} onConfirm={handleArmarConfirm} onClose={() => setShowModal(false)} />
      )}
      {showModal && item.tipo === "alitas" && (
        <AlitasModal item={item} onConfirm={handleArmarConfirm} onClose={() => setShowModal(false)} />
      )}
      <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 18, padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 60, height: 60, borderRadius: 14, background: pill, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <ItemMedia imagen={item.imagen} emoji={item.emoji} size={30} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 15, color: text, marginBottom: 2 }}>{item.nombre}</div>
          <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 12, color: muted, margin: "0 0 8px", lineHeight: 1.4 }}>{item.desc}</p>
          {!esArmable && tamanos.length > 1 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {tamanos.map(t => <button key={t} onClick={() => setTam(t)} style={{ border: `1.5px solid ${t === tam ? accent : border}`, background: t === tam ? accent + "22" : "none", borderRadius: 8, padding: "4px 10px", fontFamily: "system-ui,sans-serif", fontSize: 11, color: t === tam ? accent : muted, cursor: "pointer", fontWeight: 600 }}>{t}</button>)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <span style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 17, color: accent }}>{esArmable ? `Desde $${item.desdePrecio}` : `$${precioActual}`}</span>
          <button onClick={handleAdd} style={{ border: "none", cursor: "pointer", borderRadius: 10, padding: "7px 14px", background: flash ? accentS : pill, color: flash ? "#fff" : text, fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s", whiteSpace: "nowrap" }}>
            {flash ? "✓" : enCarrito > 0 ? `+1 (${enCarrito})` : esArmable ? `${item.emoji} Armar` : "+Agregar"}
          </button>
        </div>
      </div>
    </>
  );
}

function PasoMenu({ carrito, onAdd, onNext }) {
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const count = carrito.reduce((s, i) => s + i.cantidad, 0);
  return (
    <div>
      <h2 style={{ fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 22, color: text, margin: "0 0 20px", textAlign: "center" }}>¿Qué se te antoja hoy?</h2>
      {Object.entries(MENU).map(([key, cat]) => (
        <div key={key} style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: muted, marginBottom: 12, textAlign: "center" }}>{cat.emoji} {cat.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cat.items.map(item => <ProductoCard key={item.id} item={item} onAdd={onAdd} carritoItems={carrito} />)}
          </div>
        </div>
      ))}
      {count > 0 && (
        <div style={{ position: "sticky", bottom: 16, background: accent, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: "0 8px 32px rgba(47,107,70,0.35)" }} onClick={onNext}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>{count}</span>
            <span style={{ fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>Ver pedido</span>
          </div>
          <span style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>${total.toFixed(0)} →</span>
        </div>
      )}
    </div>
  );
}

function PasoEntrega({ carrito, onQuitar, onAdd, onNext, onBack, horarios }) {
  const slots = horarios ?? getHorarios();
  const [tipo, setTipo] = useState("domicilio");
  const [hora, setHora] = useState(slots[0]);
  const [zona, setZona] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [referencias, setReferencias] = useState("");

  useEffect(() => { if (!slots.includes(hora)) setHora(slots[0]); }, [slots, hora]);

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const envio = tipo !== "domicilio" ? 0 : zona ? (ENVIO_POR_ZONA[zona] ?? ENVIO_FALLBACK) : null;
  const total = subtotal + (envio ?? 0);

  const direccionCompleta = tipo === "domicilio" ? (!!zona && direccion.trim().length > 0) : true;
  const puedeContinuar = direccionCompleta;

  return (
    <div>
      <h2 style={{ fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 22, color: text, margin: "0 0 24px", textAlign: "center" }}>¿Cómo lo recibes?</h2>
      <div style={{ marginBottom: 20 }}>
        <span style={s.label}>Tipo de entrega</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["domicilio", "🛵", "A domicilio"], ["recoger", "🏪", "Recoger en tienda"]].map(([v, emoji, lbl]) => (
            <div key={v} onClick={() => setTipo(v)} style={{ background: tipo === v ? accent + "22" : card, border: `1.5px solid ${tipo === v ? accent : border}`, borderRadius: 16, padding: "18px 12px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
              <div style={{ fontFamily: "system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: tipo === v ? accent : text }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {tipo === "domicilio" && (
        <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <span style={s.label}>Zona de entrega</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ZONAS.map(z => (
                <button key={z} onClick={() => setZona(z)} style={{ border: `1.5px solid ${zona === z ? accent : border}`, background: zona === z ? accent + "22" : card, borderRadius: 10, padding: "8px 14px", fontFamily: "system-ui,sans-serif", fontSize: 12, fontWeight: 600, color: zona === z ? accent : muted, cursor: "pointer" }}>
                  {z} · {envioTxt(ENVIO_POR_ZONA[z])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span style={s.label}>Calle y número</span>
            <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. Central 123" style={s.input} />
          </div>
          <div>
            <span style={s.label}>Referencias <span style={{ color: muted, textTransform: "none", fontSize: 10 }}>(opcional)</span></span>
            <textarea value={referencias} onChange={e => setReferencias(e.target.value)} placeholder="Casa, número de calle, portón, entre calles…" rows={2} style={{ ...s.input, resize: "vertical" }} />
          </div>
          {zona && direccion.trim() && (
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 12, color: muted }}>
              📍 Entrega en {zona} · Envío: <b style={{ color: accent }}>{envioTxt(ENVIO_POR_ZONA[zona])}</b>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <span style={s.label}>{tipo === "domicilio" ? "Horario de entrega" : "Hora para recoger"}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {slots.map(h => <button key={h} onClick={() => setHora(h)} style={{ border: `1.5px solid ${h === hora ? accent : border}`, background: h === hora ? accent + "22" : card, borderRadius: 10, padding: "8px 14px", fontFamily: "system-ui,sans-serif", fontSize: 12, fontWeight: 600, color: h === hora ? accent : muted, cursor: "pointer" }}>{h}</button>)}
        </div>
      </div>

      <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
        <span style={s.label}>Tu pedido</span>
        {carrito.map(i => (
          <div key={carritoLineKey(i)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: pill, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <ItemMedia imagen={i.imagen} emoji={i.emoji} size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 14, fontWeight: 600, color: text }}>{i.nombre}</div>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 11, color: muted }}>{i.tamano}{i.extras ? ` · ${i.extras}` : ""}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => onQuitar(i)} style={{ background: pill, border: "none", borderRadius: 8, width: 26, height: 26, color: text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontFamily: "system-ui,sans-serif", fontSize: 14, fontWeight: 700, color: text, minWidth: 16, textAlign: "center" }}>{i.cantidad}</span>
              <button onClick={() => onAdd(i)} style={{ background: pill, border: "none", borderRadius: 8, width: 26, height: 26, color: text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
            <span style={{ fontFamily: "system-ui,sans-serif", fontSize: 14, fontWeight: 700, color: accent, minWidth: 52, textAlign: "right" }}>${(i.precio * i.cantidad).toFixed(0)}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 8, paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginBottom: 4 }}><span>Subtotal</span><span>${subtotal.toFixed(0)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginBottom: 4 }}><span>Envío</span><span>{tipo === "recoger" ? "—" : envio == null ? "…" : envioTxt(envio)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: 17, fontWeight: 800, color: text, marginTop: 8 }}><span>Total</span><span style={{ color: accent }}>${total.toFixed(0)}</span></div>
        </div>
      </div>

      <Btn onClick={() => onNext({ tipo, hora, subtotal, envio: envio ?? 0, total, direccion, referencias, zona })} variant="primary" disabled={!puedeContinuar}>
        {tipo === "domicilio" && !zona ? "Elige tu zona de entrega" : tipo === "domicilio" && !direccion.trim() ? "Completa tu dirección" : "Continuar →"}
      </Btn>
      <div style={{ textAlign: "center", marginTop: 10 }}><Btn onClick={onBack} variant="ghost">← Volver al menú</Btn></div>
    </div>
  );
}

function PasoDatos({ entrega, carrito, onBack, onConfirmar }) {
  const [nombre, setNombre]     = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail]       = useState("");
  const [pago, setPago]         = useState("efectivo");
  const [notas, setNotas]       = useState("");
  const [error, setError]       = useState(null);
  const [enviando, setEnviando] = useState(false);

  const direccion   = entrega.direccion || "";
  const referencias = entrega.referencias || "";
  const zona        = entrega.zona || "";

  const validar = () => {
    if (!nombre.trim() || !telefono.trim()) { setError("Falta tu nombre o teléfono."); return false; }
    setError(null);
    return true;
  };

  const enviarNotificacion = async ({ folio }) => {
    const resumen = buildResumen(carrito);
    const tipoLabel = entrega.tipo === "domicilio" ? "🛵 A domicilio" : "🏪 Recoger en tienda";
    const pagoLabel = pago === "efectivo" ? "💵 Efectivo" : "📲 Transferencia";
    const dirCompleta = entrega.tipo === "domicilio" ? `${direccion}, ${zona}${referencias ? ` — Ref: ${referencias}` : ""}` : "—";

    const tgMsg = [
      `🥪 <b>NUEVO PEDIDO — ${folio}</b>`, ``,
      `👤 <b>Cliente</b>`,
      `• Nombre: ${nombre}`, `• Tel: ${telefono}`, `• Email: ${email || "—"}`, `• Pago: ${pagoLabel}`, ``,
      `📦 <b>Entrega</b>`,
      `• Tipo: ${tipoLabel}`, `• Horario: ${entrega.hora}`,
      entrega.tipo === "domicilio" ? `• Dirección: ${dirCompleta}` : "", ``,
      `🛒 <b>Pedido</b>`, resumen, ``,
      `💰 Subtotal: $${entrega.subtotal.toFixed(0)}`,
      `🛵 Envío: ${entrega.envio === 0 ? "Gratis" : `$${entrega.envio.toFixed(0)}`}`,
      `✅ <b>TOTAL: $${entrega.total.toFixed(0)}</b>`,
      notas ? `\n📝 Notas: ${notas}` : "",
    ].filter(l => l !== "").join("\n");
    await sendTelegram(tgMsg);
  };

  const handleConfirmar = async () => {
    if (!validar()) return;
    setEnviando(true);
    const num = Math.floor(Math.random() * 9999) + 1;
    const folio = `#CT:${String(num).padStart(4, "0")}`;
    await enviarNotificacion({ folio });
    setEnviando(false);
    onConfirmar({ folio, nombre, telefono, email, direccion, zona, pago, notas });
  };

  return (
    <div>
      <h2 style={{ fontFamily: "system-ui,sans-serif", fontWeight: 700, fontSize: 22, color: text, margin: "0 0 24px", textAlign: "center" }}>Tus datos</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div><span style={s.label}>Nombre</span><input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="¿Cómo te llamas?" style={s.input} /></div>
        <div><span style={s.label}>Teléfono</span><input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="442 000 0000" type="tel" style={s.input} /></div>
        <div><span style={s.label}>Correo <span style={{ color: muted, textTransform: "none", fontSize: 10 }}>(opcional)</span></span><input value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@gmail.com" type="email" style={s.input} /></div>
        {entrega.tipo === "domicilio" && (
          <div style={{ background: cardHi, border: `1.5px solid ${border}`, borderRadius: 14, padding: "12px 16px" }}>
            <span style={s.label}>Entregar en</span>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: text }}>{direccion}, {zona}</div>
            {referencias && <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 12, color: muted, marginTop: 4 }}>Ref: {referencias}</div>}
          </div>
        )}
        <div>
          <span style={s.label}>Forma de pago</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["efectivo", "💵", "Efectivo"], ["transferencia", "📲", "Transferencia"]].map(([v, emoji, lbl]) => (
              <div key={v} onClick={() => { if (!enviando) setPago(v); }} style={{ background: pago === v ? accent + "22" : card, border: `1.5px solid ${pago === v ? accent : border}`, borderRadius: 14, padding: "14px 8px", textAlign: "center", cursor: enviando ? "default" : "pointer" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</div>
                <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 11, fontWeight: 600, color: pago === v ? accent : muted }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div><span style={s.label}>Notas (opcional)</span><textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Sin cebolla, extra salsa…" rows={2} style={{ ...s.input, resize: "vertical" }} /></div>
        <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginBottom: 4 }}><span>{entrega.tipo === "domicilio" ? "🛵 Entrega" : "🏪 Recoger"}</span><span>{entrega.hora}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: 16, fontWeight: 800, color: text }}><span>Total</span><span style={{ color: accent }}>${entrega.total.toFixed(0)}</span></div>
        </div>
        {error && <div style={{ background: accent + "18", border: `1px solid ${accent}55`, borderRadius: 12, padding: "12px 16px", fontFamily: "system-ui,sans-serif", fontSize: 13, color: accent }}>{error}</div>}
        <Btn onClick={handleConfirmar} variant="primary" disabled={enviando}>{enviando ? "Enviando pedido…" : "Confirmar pedido 🥪"}</Btn>
        <div style={{ textAlign: "center" }}><Btn onClick={onBack} variant="ghost" disabled={enviando}>← Volver</Btn></div>
      </div>
    </div>
  );
}

function Confirmacion({ folio, nombre, entrega, carrito, onNuevoPedido }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 90, height: 90, margin: "0 auto 16px", borderRadius: 20, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ItemMedia imagen={LOGO_URL} emoji="🥪" size={64} />
      </div>
      <h2 style={{ fontFamily: "system-ui,sans-serif", fontWeight: 800, fontSize: 24, color: text, margin: "0 0 8px" }}>¡Pedido recibido!</h2>
      <p style={{ fontFamily: "system-ui,sans-serif", fontSize: 15, color: muted, margin: "0 0 28px" }}>Ya preparamos tu pedido, {nombre.split(" ")[0]}.</p>
      <div style={{ background: card, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24, marginBottom: 24, textAlign: "left" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span style={{ fontFamily: "system-ui,sans-serif", fontSize: 12, color: muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Folio</span>
          <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 800, color: accent, marginTop: 4 }}>{folio}</div>
        </div>
        <div style={{ borderTop: `1px dashed ${border}`, paddingTop: 16 }}>
          {carrito.map(i => (
            <div key={carritoLineKey(i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontFamily: "system-ui,sans-serif" }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: pill, flexShrink: 0, marginRight: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <ItemMedia imagen={i.imagen} emoji={i.emoji} size={18} />
              </div>
              <span style={{ flex: 1, fontSize: 14, color: text }}>{i.cantidad}× {i.nombre} <span style={{ color: muted, fontSize: 12 }}>({i.tamano}{i.extras ? ` · ${i.extras}` : ""})</span></span>
              <span style={{ fontSize: 14, fontWeight: 700, color: accent }}>${(i.precio * i.cantidad).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px dashed ${border}`, paddingTop: 14, marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: 18, fontWeight: 800, color: text }}><span>Total</span><span style={{ color: accent }}>${entrega.total.toFixed(0)}</span></div>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, color: muted, marginTop: 10 }}>{entrega.tipo === "domicilio" ? `🛵 Entrega: ${entrega.hora}` : `🏪 Recoger: ${entrega.hora}`}</div>
        </div>
      </div>
      <Btn onClick={onNuevoPedido} variant="primary">Hacer otro pedido</Btn>
    </div>
  );
}

function HeaderCarrito({ carrito, abierto }) {
  const [abiertoCarro, setAbiertoCarro] = useState(true);
  const prevLen = useRef(0);
  useEffect(() => {
    if (carrito.length > 0 && prevLen.current === 0) setAbiertoCarro(true);
    prevLen.current = carrito.length;
  }, [carrito.length]);

  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const tieneItems = carrito.length > 0;

  return (
    <div style={{ borderBottom: `1px solid ${border}`, padding: "16px 20px 0", position: "sticky", top: 0, background: bg, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tieneItems ? 12 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <ItemMedia imagen={LOGO_URL} emoji="🥪" size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>Cayetana Tortas</div>
            <div style={{ fontSize: 12, color: muted }}>Entrega y recolección · Zakia · Zibatá · El Refugio</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {tieneItems && !abiertoCarro && (
            <button
              onClick={() => setAbiertoCarro(true)}
              style={{ background: pill, border: `1.5px solid ${border}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "system-ui,sans-serif", fontSize: 11, fontWeight: 700, color: accent }}
            >
              <span style={{ display: "inline-block", transform: "rotate(180deg)" }}>▲</span>
              <span>🛒 ${total.toFixed(0)}</span>
            </button>
          )}
          {abierto !== null && (
            <div style={{ background: abierto ? "#eaf5ee" : "#1c1f1c", border: `1.5px solid ${abierto ? accent : "#555"}`, borderRadius: 20, padding: "6px 14px", fontFamily: "system-ui,sans-serif", fontSize: 11, fontWeight: 700, color: abierto ? accent : "#fcfcfc", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, lineHeight: 1.2 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span>{abierto ? "⚡" : "🌙"}</span>{abierto ? "Abierto ahora" : "Cerrado"}</span>
              {!abierto && <span style={{ fontSize: 10, fontWeight: 500, color: "#bbb" }}>Volvemos a las 10:00</span>}
            </div>
          )}
        </div>
      </div>
      {tieneItems && abiertoCarro && (
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 10, paddingBottom: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {carrito.map(i => (
              <div key={carritoLineKey(i)} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "system-ui,sans-serif" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: pill, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <ItemMedia imagen={i.imagen} emoji={i.emoji} size={14} />
                </div>
                <span style={{ flex: 1, fontSize: 13, color: text, fontWeight: 500 }}>
                  {i.cantidad}× {i.nombre}
                  <span style={{ color: muted, fontWeight: 400 }}> ({i.tamano}{i.extras ? ` · ${i.extras}` : ""})</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>${(i.precio * i.cantidad).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${border}` }}>
            <button
              onClick={() => setAbiertoCarro(false)}
              style={{ background: pill, border: `1.5px solid ${border}`, borderRadius: 20, padding: "5px 11px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "system-ui,sans-serif", fontSize: 11, fontWeight: 700, color: accent }}
            >
              <span>▲</span>
              <span>Ocultar</span>
            </button>
            <span style={{ fontFamily: "system-ui,sans-serif", fontSize: 13, fontWeight: 800, color: text }}>
              Total: <span style={{ color: accent }}>${total.toFixed(0)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [paso, setPaso]                 = useState(1);
  const [carrito, setCarrito]           = useState([]);
  const [entrega, setEntrega]           = useState(null);
  const [abierto, setAbierto]           = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const horariosDia = getHorarios();

  useEffect(() => {
    fetch("https://timeapi.io/api/time/current/zone?timeZone=America%2FMexico_City")
      .then(r => r.json())
      .then(data => setAbierto(estaAbierto(data.hour, data.minute)))
      .catch(() => setAbierto(null));
  }, []);

  const agregar = ({ id, nombre, tamano, precio, emoji, extras }) => {
    setCarrito(prev => {
      const item = { id, nombre, tamano, precio, emoji, extras };
      if (extras) {
        return [...prev, { ...item, cantidad: 1, uid: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }];
      }
      const ex = prev.find(i => !i.uid && i.id === id && i.tamano === tamano);
      if (ex) return prev.map(i => i === ex ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...item, cantidad: 1 }];
    });
  };
  const quitar = (item) => {
    setCarrito(prev => {
      const ex = item.uid
        ? prev.find(i => i.uid === item.uid)
        : prev.find(i => !i.uid && i.id === item.id && i.tamano === item.tamano);
      if (!ex) return prev;
      if (ex.cantidad <= 1) return prev.filter(i => i !== ex);
      return prev.map(i => i === ex ? { ...i, cantidad: i.cantidad - 1 } : i);
    });
  };
  const handleConfirmar = ({ folio, ...datos }) => { setConfirmacion({ folio, datos }); setPaso(4); };
  const reset = () => { setCarrito([]); setEntrega(null); setConfirmacion(null); setPaso(1); };

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text, fontFamily: "system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing:border-box; }
        body { margin:0; }
        input,textarea,select { color-scheme:light; }
      `}</style>
      <HeaderCarrito carrito={carrito} abierto={abierto} />
      <div style={{ background: cardHi, borderBottom: `1px solid ${border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>🎉</span>
        <span style={{ fontFamily: "system-ui,sans-serif", fontSize: 12, color: muted }}>Envío <b style={{ color: accent }}>gratis</b> en <b style={{ color: text }}>Zakia · Zibatá · El Refugio</b></span>
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 40px" }}>
        {paso < 4 && <Pasos paso={paso} />}
        {paso === 1 && <PasoMenu carrito={carrito} onAdd={agregar} onNext={() => setPaso(2)} />}
        {paso === 2 && <PasoEntrega carrito={carrito} onQuitar={quitar} onAdd={agregar} horarios={horariosDia} onNext={e => { setEntrega(e); setPaso(3); }} onBack={() => setPaso(1)} />}
        {paso === 3 && <PasoDatos entrega={entrega} carrito={carrito} onBack={() => setPaso(2)} onConfirmar={handleConfirmar} />}
        {paso === 4 && confirmacion && <Confirmacion folio={confirmacion.folio} nombre={confirmacion.datos.nombre} entrega={entrega} carrito={carrito} onNuevoPedido={reset} />}
      </div>
    </div>
  );
}
