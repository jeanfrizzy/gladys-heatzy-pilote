import {
  GladysIntegration,
  DEVICE_FEATURE_CATEGORIES,
  DEVICE_FEATURE_TYPES,
  logger,
} from "@gladysassistant/integration-sdk";

const API = "https://euapi.gizwits.com/app";
// Application ID public de Heatzy (collection Postman officielle)
const APP_ID = "c70a66ff039d41b4a220e198b0fcc8b3";
const POLL_MS = 60_000;

// Clé produit -> génération (source : "Heatzy Pilote - Guide des générations")
const GENERATIONS = {
  "9420ae048da545c88fc6274d204dd25f": 1, // Pilote
  "51d16c22a5f74280bc3cfe9ebcdc6402": 2, // Pilote2
  "4fc968a21e7243b390e9ede6f1c6465d": 2, // Elec'Pro
  b9a67b6ce24b437d9794103fd317e627: 3, // Pilote_Soc
  b8c6657b66c34148b4dee64d615cefc7: 3, // Elec_Pro_Soc
  "46409c7f29d4411c85a3a46e5ee3703e": 4, // Pilote_Soc_C3
  "9dacde7ef459421eaf8dc4bea9385634": 4, // Elec_Pro_Ble
};

// ---------- Modes de chauffe ----------
const label = (fr, en) => ({ fr, en });
const MODES_BASE = [
  { value: "cft", label: label("Confort", "Comfort"), sort_order: 1 },
  { value: "eco", label: label("Éco", "Eco"), sort_order: 2 },
  { value: "fro", label: label("Hors-gel", "Frost protection"), sort_order: 3 },
  { value: "stop", label: label("Arrêt", "Off"), sort_order: 4 },
];
const MODES_GEN4 = [
  ...MODES_BASE,
  { value: "cft1", label: label("Confort -1", "Comfort -1"), sort_order: 5 },
  { value: "cft2", label: label("Confort -2", "Comfort -2"), sort_order: 6 },
];
const MODE_TO_API = { cft: 0, eco: 1, fro: 2, stop: 3, cft1: 4, cft2: 5 };
// Lecture : l'API peut renvoyer des lettres ou des chiffres
const MODE_FROM_API = {
  cft: "cft", eco: "eco", fro: "fro", stop: "stop", cft1: "cft1", cft2: "cft2",
  0: "cft", 1: "eco", 2: "fro", 3: "stop", 4: "cft1", 5: "cft2",
};

// ---------- Dérogations (Pilote 2/3/4) ----------
const DEROG = [
  { value: "none", label: label("Aucune", "None"), sort_order: 1 },
  { value: "vacation", label: label("Vacances", "Holiday"), sort_order: 2 },
  { value: "boost", label: label("Boost", "Boost"), sort_order: 3 },
];
const DEROG_TO_API = { none: 0, vacation: 1, boost: 2 };
const DEROG_FROM_API = { 0: "none", 1: "vacation", 2: "boost" };

// Interrupteurs (Pilote 2/3/4). Attention : l'attribut s'écrit bien "lock_switch"
const SWITCHES = {
  lock: { attr: "lock_switch", name: "Verrouillage" },
  timer: { attr: "timer_switch", name: "Programmation" },
};

const gladys = new GladysIntegration();

// ---------- Session Heatzy / Gizwits ----------
let session = null; // { token, expireAt }

async function login() {
  const { username, password } = gladys.config;
  if (!username || !password) throw new Error("Identifiants Heatzy non configurés");
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Gizwits-Application-Id": APP_ID },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Login Heatzy refusé (${res.status})`);
  const data = await res.json();
  session = { token: data.token, expireAt: data.expire_at }; // secondes
  await gladys.setConnectionStatus(true);
}

async function heatzy(path, options = {}, retry = true) {
  const soon = Math.floor(Date.now() / 1000) + 3600;
  if (!session || (session.expireAt && session.expireAt < soon)) await login();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Gizwits-Application-Id": APP_ID,
      "X-Gizwits-User-token": session.token,
    },
  });
  if ((res.status === 400 || res.status === 401) && retry) {
    session = null; // token invalide : une seule reconnexion
    return heatzy(path, options, false);
  }
  if (!res.ok) throw new Error(`Heatzy ${options.method || "GET"} ${path} : ${res.status}`);
  return res.json();
}

// ---------- Helpers appareils ----------
const param = (device, name) => device.params?.find((p) => p.name === name)?.value;
const generation = (device) => GENERATIONS[param(device, "PRODUCT_KEY")];

function featureKey(device, feature) {
  const ids = gladys.externalIds("heatzy", param(device, "DID"));
  return ["mode", "derog", ...Object.keys(SWITCHES)].find((k) => ids.feature(k) === feature.external_id);
}

const selectFeature = (name, external_id, options) => ({
  name,
  external_id,
  category: DEVICE_FEATURE_CATEGORIES.TEXT,
  type: DEVICE_FEATURE_TYPES.TEXT.SELECT,
  min: 0,
  max: 0,
  read_only: false,
  has_feedback: true,
  keep_history: false,
  supported_options: options,
});

const switchFeature = (name, external_id) => ({
  name,
  external_id,
  category: DEVICE_FEATURE_CATEGORIES.SWITCH,
  type: DEVICE_FEATURE_TYPES.SWITCH.BINARY,
  min: 0,
  max: 1,
  read_only: false,
  has_feedback: true,
  keep_history: false,
});

// ---------- Découverte ----------
gladys.onScanRequest(async () => {
  const { devices = [] } = await heatzy("/bindings?limit=50&skip=0");
  const pilotes = [];
  for (const d of devices) {
    const gen = GENERATIONS[d.product_key];
    logger.info(`Heatzy : ${d.dev_alias} product_name=${d.product_name} product_key=${d.product_key} génération=${gen ?? "non gérée"}`);
    if (gen) pilotes.push(d);
  }

  await gladys.publishDiscoveredDevices(
    pilotes.map((d) => {
      const gen = GENERATIONS[d.product_key];
      const ids = gladys.externalIds("heatzy", d.did);
      const features = [selectFeature("Mode", ids.feature("mode"), gen === 4 ? MODES_GEN4 : MODES_BASE)];
      if (gen >= 2) {
        features.push(selectFeature("Dérogation", ids.feature("derog"), DEROG));
        for (const [k, { name }] of Object.entries(SWITCHES)) features.push(switchFeature(name, ids.feature(k)));
      }
      return {
        name: d.dev_alias || "Heatzy Pilote",
        external_id: ids.device,
        params: [
          { name: "DID", value: d.did },
          { name: "PRODUCT_KEY", value: d.product_key },
        ],
        features,
      };
    }),
  );
});

// ---------- Commandes ----------
gladys.onSetValue(async (device, feature, value) => {
  const did = param(device, "DID");
  const gen = generation(device);
  const key = featureKey(device, feature);
  const post = (body) => heatzy(`/control/${did}`, { method: "POST", body: JSON.stringify(body) });

  if (key === "mode") {
    const mode = String(value);
    if (!(mode in MODE_TO_API)) throw new Error(`Mode inconnu : ${mode}`);
    if (gen === 1) {
      if (MODE_TO_API[mode] > 3) throw new Error("Mode non supporté par le Pilote 1re génération");
      await post({ raw: [1, 1, MODE_TO_API[mode]] });
    } else {
      await post({ attrs: { mode: MODE_TO_API[mode] } });
    }
    await gladys.publishState(feature.external_id, { text: mode });
  } else if (key === "derog") {
    const derog = String(value);
    if (!(derog in DEROG_TO_API)) throw new Error(`Dérogation inconnue : ${derog}`);
    // derog_time : jours pour "vacances", minutes pour "boost" (0 à 255)
    const days = Number(gladys.config.vacation_days) || 7;
    const minutes = Number(gladys.config.boost_minutes) || 60;
    const time = derog === "vacation" ? days : derog === "boost" ? minutes : 0;
    await post({ attrs: { derog_mode: DEROG_TO_API[derog], derog_time: Math.min(255, time) } });
    await gladys.publishState(feature.external_id, { text: derog });
  } else if (key && SWITCHES[key]) {
    const v = Number(value) ? 1 : 0;
    await post({ attrs: { [SWITCHES[key].attr]: v } });
    await gladys.publishState(feature.external_id, v);
  }
});

// ---------- Polling (on ne publie que les changements) ----------
const last = new Map();
const changed = (id, v) => {
  if (last.get(id) === v) return false;
  last.set(id, v);
  return true;
};

async function pollDevice(device) {
  const did = param(device, "DID");
  const gen = generation(device);
  const ids = gladys.externalIds("heatzy", did);
  const { attr } = await heatzy(`/devdata/${did}/latest`);
  if (!attr) return;

  const updates = [];
  const mode = MODE_FROM_API[attr.mode];
  if (mode && changed(ids.feature("mode"), mode)) updates.push([ids.feature("mode"), { text: mode }]);

  if (gen >= 2) {
    const derog = DEROG_FROM_API[Number(attr.derog_mode)];
    if (derog && changed(ids.feature("derog"), derog)) updates.push([ids.feature("derog"), { text: derog }]);
    for (const [k, { attr: a }] of Object.entries(SWITCHES)) {
      if (attr[a] === undefined) continue;
      const v = Number(attr[a]) ? 1 : 0;
      if (changed(ids.feature(k), v)) updates.push([ids.feature(k), v]);
    }
  }
  for (const [id, state] of updates) await gladys.publishState(id, state);
}

async function pollAll() {
  for (const device of Object.values(gladys.devices)) {
    try {
      await pollDevice(device);
    } catch (e) {
      logger.warn(`Poll Heatzy : ${e.message}`);
    }
  }
}

gladys.onPoll(async (device) => pollDevice(device));
gladys.onConfigUpdated(async () => {
  session = null; // nouveaux identifiants : reconnexion au prochain appel
});

setInterval(pollAll, POLL_MS);
gladys.handleShutdown();
await gladys.connect();
pollAll();
