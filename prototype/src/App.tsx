import { useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { dict, type Lang, type Dict } from "./i18n";
import { cities, shelters, intakes, findMatches, distanceKm, type Search, type Species, type Size, type Intake } from "./data";

type Screen = "home" | "pet" | "where" | "results" | "checkout" | "shelter" | "shelterPricing";
type Units = "mi" | "km";

const OWNER_PRICE = 9.99;
const SHELTER_PRICE = 19.99;
const KM_PER_MI = 1.609344;

const emptySearch: Search = {
  species: "dog", name: "", breed: "", color: "", size: "medium", markings: "",
  dateLost: "2026-10-25", lat: cities[0].lat, lng: cities[0].lng, radiusKm: 40,
};

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.setView([lat, lng], map.getZoom());
  return null;
}
function ClickPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [units, setUnits] = useState<Units>("mi");
  const [screen, setScreen] = useState<Screen>("home");
  const [s, setS] = useState<Search>(emptySearch);
  const [email, setEmail] = useState("");
  const [alertEmail, setAlertEmail] = useState(true);
  const [paid, setPaid] = useState(false);
  const [found, setFound] = useState(false);
  const [extra, setExtra] = useState<Intake[]>([]);
  const t = dict[lang];
  const set = <K extends keyof Search>(k: K, v: Search[K]) => setS((p) => ({ ...p, [k]: v }));
  const radiusDisplay = units === "mi" ? Math.round(s.radiusKm / KM_PER_MI) : Math.round(s.radiusKm);
  const fmtDist = (km: number) => `${Math.round(units === "mi" ? km / KM_PER_MI : km)} ${t[units]}`;
  const matches = findMatches(s, [...intakes, ...extra]);
  const inRange = shelters.filter((sh) => distanceKm(s.lat, s.lng, sh.lat, sh.lng) <= s.radiusKm);

  return (
    <>
      <div className="banner">{t.sampleBanner}</div>
      <div className="app">
        <div className="topbar">
          <h1>🐾 {t.appName}</h1>
          <div className="toggles">
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} aria-label="English">EN</button>
            <button className={lang === "es" ? "active" : ""} onClick={() => setLang("es")} aria-label="Español">ES</button>
            <button className={units === "mi" ? "active" : ""} onClick={() => setUnits("mi")}>mi</button>
            <button className={units === "km" ? "active" : ""} onClick={() => setUnits("km")}>km</button>
          </div>
        </div>

        {screen === "home" && (
          <>
            <h2 style={{ fontSize: 30, lineHeight: 1.2 }}>{t.tagline}</h2>
            <p className="sub">{t.taglineSub}</p>
            <button className="primary" style={{ marginTop: 0 }} onClick={() => setScreen("pet")}>🐕 {t.iLostPet}</button>
            <p className="muted" style={{ textAlign: "center" }}>{t.priceLine}</p>

            <h2 style={{ marginTop: 32 }}>{t.howTitle}</h2>
            {[[t.how1t, t.how1d], [t.how2t, t.how2d], [t.how3t, t.how3d]].map(([h, d], i) => (
              <div key={i} className="card step"><div className="num">{i + 1}</div><div><strong>{h}</strong><div className="muted">{d}</div></div></div>
            ))}

            <h2 style={{ marginTop: 32 }}>{t.whereTitle}</h2>
            <p className="sub">{t.whereSub}</p>
            <div className="card"><span className="tag live">{t.liveNow}</span><strong>{t.src1t}</strong><div className="muted">{t.src1d}</div></div>
            <div className="card"><span className="tag">{t.linksOnly}</span><strong>{t.src2t}</strong><div className="muted">{t.src2d}</div>
              <a className="ext" href="https://www.facebook.com/search/groups?q=lost%20pets" target="_blank" rel="noreferrer">facebook.com ↗</a></div>
            <div className="card"><span className="tag">{t.linksOnly}</span><strong>{t.src3t}</strong><div className="muted">{t.src3d}</div>
              <a className="ext" href="https://petcolove.org/lost/" target="_blank" rel="noreferrer">Petco Love Lost ↗</a>{" "}
              <a className="ext" href="https://www.pawboost.com" target="_blank" rel="noreferrer">PawBoost ↗</a></div>
            <div className="card"><span className="tag live">{t.liveNow}</span><strong>{t.src4t}</strong><div className="muted">{t.src4d}</div></div>

            <h2 style={{ marginTop: 32 }}>{t.forShelters}</h2>
            <div className="card"><div className="muted" style={{ marginBottom: 12 }}>{t.forSheltersBody}</div>
              <button onClick={() => setScreen("shelter")}>🏠 {t.shelterCta}</button></div>
          </>
        )}

        {screen === "pet" && (
          <>
            <p className="steps">{t.step} 1 {t.of} 2</p>
            <h2>{t.petDetails}</h2>
            <div className="card">
              <label>{t.species}</label>
              <div className="row">
                {(["dog", "cat", "other"] as Species[]).map((sp) => (
                  <button key={sp} className={s.species === sp ? "active" : ""} onClick={() => set("species", sp)}>{t[sp]}</button>
                ))}
              </div>
              <label>{t.name}</label><input value={s.name} onChange={(e) => set("name", e.target.value)} />
              <label>{t.breed}</label><input value={s.breed} onChange={(e) => set("breed", e.target.value)} />
              <label>{t.color}</label><input value={s.color} onChange={(e) => set("color", e.target.value)} />
              <label>{t.size}</label>
              <div className="row">
                {(["small", "medium", "large"] as Size[]).map((z) => (
                  <button key={z} className={s.size === z ? "active" : ""} onClick={() => set("size", z)}>{t[z]}</button>
                ))}
              </div>
              <label>{t.markings}</label>
              <textarea rows={2} placeholder={t.markingsHint} value={s.markings} onChange={(e) => set("markings", e.target.value)} />
              <label>{t.collar}</label><input />
              <label>{t.microchip}</label><input />
              <label>{t.photos}</label>
              <input type="file" accept="image/*" multiple />
              <div className="muted">{t.photosHint}</div>
            </div>
            <button className="primary" onClick={() => setScreen("where")}>{t.next}</button>
            <button className="link" onClick={() => setScreen("home")}>{t.back}</button>
          </>
        )}

        {screen === "where" && (
          <>
            <p className="steps">{t.step} 2 {t.of} 2</p>
            <h2>{t.whereWhen}</h2>
            <div className="card">
              <label>{t.dateLost}</label>
              <input type="date" value={s.dateLost} onChange={(e) => set("dateLost", e.target.value)} />
              <label>{t.address}</label>
              <select onChange={(e) => { const c = cities[+e.target.value]; setS((p) => ({ ...p, lat: c.lat, lng: c.lng })); }}>
                {cities.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
              </select>
              <div className="muted">{t.addressHint}</div>
              <div className="map">
                <MapContainer center={[s.lat, s.lng]} zoom={8} style={{ height: "100%" }}>
                  <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Recenter lat={s.lat} lng={s.lng} />
                  <ClickPick onPick={(lat, lng) => setS((p) => ({ ...p, lat, lng }))} />
                  <Circle center={[s.lat, s.lng]} radius={s.radiusKm * 1000} pathOptions={{ color: "#3f7d6b" }} />
                  <CircleMarker center={[s.lat, s.lng]} radius={7} pathOptions={{ color: "#c0392b" }} />
                  {shelters.map((sh) => (
                    <CircleMarker key={sh.id} center={[sh.lat, sh.lng]} radius={6} pathOptions={{ color: "#2c5aa0" }}>
                      <Tooltip>{sh.name}</Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
              <label>{t.radius}: {radiusDisplay} {t[units]}</label>
              <input type="range" min={5} max={160} value={s.radiusKm} onChange={(e) => set("radiusKm", +e.target.value)} />
              <label>{t.alerts}</label>
              <div className="row">
                <button className={alertEmail ? "active" : ""} onClick={() => setAlertEmail(!alertEmail)}>✉️ {t.email}</button>
                <button disabled style={{ opacity: 0.5 }}>💬 {t.text} {t.textSoon}</button>
              </div>
              {alertEmail && (<><label>{t.emailAddr}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></>)}
            </div>
            <button className="primary" onClick={() => setScreen("results")}>{t.seeResults}</button>
            <button className="link" onClick={() => setScreen("pet")}>{t.back}</button>
          </>
        )}

        {screen === "results" && (
          <>
            <h2>{t.resultsTitle}</h2>
            {found ? <div className="notice">{t.foundDone}</div> : (
              <>
                <p className="sub">{matches.length} {matches.length === 1 ? t.matchFound : t.matchesFound}</p>
                <div className="notice">{t.possibleOnly}</div>
                {!paid && matches.length > 0 && (
                  <div className="card">
                    <strong>{t.unlockTitle}</strong>
                    <p className="muted">{t.unlockBody}</p>
                    <button className="primary" onClick={() => setScreen("checkout")}>
                      {t.unlockBtn} ${OWNER_PRICE} ({t.oneTime})
                    </button>
                  </div>
                )}
                {matches.length === 0 && <div className="card">{t.noMatches}</div>}
                {matches.map((m) => (
                  <div key={m.intake.id} className={`card match ${paid ? "" : "locked"}`}>
                    <img src={m.intake.photo} alt="" />
                    <div>
                      <div className="score">{m.score}% {t.matchScore}</div>
                      <div>{m.intake.breed}, {m.intake.color}</div>
                      <div className="muted">{paid ? m.shelter.name : "••••••••••"} · {fmtDist(m.km)} {t.away}</div>
                      <div className="muted">{t.foundOn} {m.intake.foundDate}</div>
                      {paid && <button className="link" onClick={() => alert("Demo only")}>{t.viewListing}</button>}
                    </div>
                  </div>
                ))}
                <h2 style={{ fontSize: 18 }}>{t.sheltersInRange} ({inRange.length})</h2>
                <div className="card muted">{inRange.map((sh) => <div key={sh.id}>{sh.name} · {fmtDist(distanceKm(s.lat, s.lng, sh.lat, sh.lng))}</div>)}</div>
                <div className="notice">{t.facebookTip}</div>
                <button className="primary" onClick={() => setFound(true)}>{t.markFound}</button>
              </>
            )}
            <button className="link" onClick={() => setScreen("where")}>{t.back}</button>
          </>
        )}

        {screen === "checkout" && (
          <Checkout t={t} amount={`$${OWNER_PRICE}`} label={t.oneTime}
            onPay={() => { setPaid(true); setScreen("results"); }} onBack={() => setScreen("results")} />
        )}

        {screen === "shelter" && (
          <ShelterPost t={t} onPosted={(i) => setExtra((p) => [...p, i])}
            onPricing={() => setScreen("shelterPricing")} onBack={() => setScreen("home")} />
        )}

        {screen === "shelterPricing" && (
          <>
            <h2>{t.pricingTitle}</h2>
            <div className="card">
              <div className="notice">{t.launchOffer}</div>
              <div className="price"><span className="strike">${SHELTER_PRICE}</span>${(SHELTER_PRICE / 2).toFixed(2)} <span className="muted">{t.firstMonth}</span></div>
              <div className="muted">{t.then} ${SHELTER_PRICE} {t.perMonth}</div>
              <button className="primary" onClick={() => alert("Demo only")}>{t.subscribe}</button>
              <div className="muted" style={{ marginTop: 8 }}>{t.currencyNote}</div>
            </div>
            <button className="link" onClick={() => setScreen("shelter")}>{t.back}</button>
          </>
        )}
      </div>
    </>
  );
}

function Checkout({ t, amount, label, onPay, onBack }: { t: Dict; amount: string; label: string; onPay: () => void; onBack: () => void }) {
  return (
    <>
      <h2>{t.checkoutTitle}</h2>
      <div className="card">
        <div className="price">{amount} <span className="muted">{label}</span></div>
        <div className="notice">{t.checkoutNote}</div>
        <button className="primary" onClick={onPay}>{t.pay} {amount}</button>
      </div>
      <button className="link" onClick={onBack}>{t.back}</button>
    </>
  );
}

function ShelterPost({ t, onPosted, onPricing, onBack }: { t: Dict; onPosted: (i: Intake) => void; onPricing: () => void; onBack: () => void }) {
  const [f, setF] = useState({ shelterId: "s1", species: "dog" as Species, breed: "", color: "", size: "medium" as Size, markings: "", foundDate: "2026-11-02" });
  const [done, setDone] = useState(false);
  return (
    <>
      <h2>{t.shelterTitle}</h2>
      <button className="link" onClick={onPricing}>{t.pricingTitle} →</button>
      <div className="card">
        <strong>{t.shelterPostTitle}</strong>
        <label>{t.shelterName}</label>
        <select value={f.shelterId} onChange={(e) => setF({ ...f, shelterId: e.target.value })}>
          {shelters.map((sh) => <option key={sh.id} value={sh.id}>{sh.name}</option>)}
        </select>
        <label>{t.species}</label>
        <div className="row">
          {(["dog", "cat", "other"] as Species[]).map((sp) => (
            <button key={sp} className={f.species === sp ? "active" : ""} onClick={() => setF({ ...f, species: sp })}>{t[sp]}</button>
          ))}
        </div>
        <label>{t.breed}</label><input value={f.breed} onChange={(e) => setF({ ...f, breed: e.target.value })} />
        <label>{t.color}</label><input value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} />
        <label>{t.size}</label>
        <div className="row">
          {(["small", "medium", "large"] as Size[]).map((z) => (
            <button key={z} className={f.size === z ? "active" : ""} onClick={() => setF({ ...f, size: z })}>{t[z]}</button>
          ))}
        </div>
        <label>{t.markings}</label><input value={f.markings} onChange={(e) => setF({ ...f, markings: e.target.value })} />
        <label>{t.dateFound}</label><input type="date" value={f.foundDate} onChange={(e) => setF({ ...f, foundDate: e.target.value })} />
        <label>{t.photos}</label><input type="file" accept="image/*" />
        <button className="primary" onClick={() => {
          onPosted({ id: `x${Date.now()}`, ...f, photo: "" });
          setDone(true);
        }}>{t.postIt}</button>
        {done && <div className="notice">{t.posted}</div>}
      </div>
      <button className="link" onClick={onBack}>{t.back}</button>
    </>
  );
}
