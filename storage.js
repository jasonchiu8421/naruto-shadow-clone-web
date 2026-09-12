// Local persistence helpers (per-browser / per-user isolation)
const SAMPLE_DB = "naruto-shadow-clone";
const SAMPLE_STORE = "kv";
const SAMPLES_KEY = "gesture-samples";
const MODEL_IDB_URL = "indexeddb://gesture-model";

function openSampleDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SAMPLE_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SAMPLE_STORE)) {
        db.createObjectStore(SAMPLE_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openSampleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAMPLE_STORE, "readonly");
    const req = tx.objectStore(SAMPLE_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openSampleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAMPLE_STORE, "readwrite");
    tx.objectStore(SAMPLE_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key) {
  const db = await openSampleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAMPLE_STORE, "readwrite");
    tx.objectStore(SAMPLE_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function saveSamples(samples) {
  await idbSet(SAMPLES_KEY, samples);
}

async function loadSamples() {
  const data = await idbGet(SAMPLES_KEY);
  if (!data) return { clone_sign: [], not_sign: [] };
  return {
    clone_sign: data.clone_sign || [],
    not_sign: data.not_sign || [],
  };
}

async function clearSamples() {
  await idbDelete(SAMPLES_KEY);
}

async function saveModelToIdb(model) {
  await model.save(MODEL_IDB_URL);
}

async function loadModelFromIdb() {
  return tf.loadLayersModel(MODEL_IDB_URL);
}

async function clearModelFromIdb() {
  const models = await tf.io.listModels();
  if (models[MODEL_IDB_URL]) {
    await tf.io.removeModel(MODEL_IDB_URL);
  }
}

async function hasSavedModel() {
  const models = await tf.io.listModels();
  return Boolean(models[MODEL_IDB_URL]);
}

async function modelArtifactsToSingleFile(model) {
  let combined = null;
  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      combined = {
        modelTopology: artifacts.modelTopology,
        weightSpecs: artifacts.weightSpecs,
        weightData: Array.from(new Uint8Array(artifacts.weightData)),
      };
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: "JSON",
        },
      };
    })
  );
  return combined;
}

async function loadModelFromSingleFileJson(modelData) {
  const weightData = new Uint8Array(modelData.weightData);
  const modelArtifacts = {
    modelTopology: modelData.modelTopology,
    weightSpecs: modelData.weightSpecs,
    weightData: weightData.buffer,
  };
  return tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
}
