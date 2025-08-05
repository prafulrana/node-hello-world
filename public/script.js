const cameraMode = document.getElementById('cameraMode');
const uploadMode = document.getElementById('uploadMode');
const cameraSection = document.getElementById('cameraSection');
const uploadSection = document.getElementById('uploadSection');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const preview = document.getElementById('preview');
const fileInput = document.getElementById('fileInput');
const uploadFileBtn = document.getElementById('uploadFileBtn');

let stream;
let recorder;
let chunks = [];

function setMode(mode) {
  if (mode === 'camera') {
    cameraSection.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    cameraMode.classList.add('active');
    uploadMode.classList.remove('active');
  } else {
    uploadSection.classList.remove('hidden');
    cameraSection.classList.add('hidden');
    uploadMode.classList.add('active');
    cameraMode.classList.remove('active');
  }
}

cameraMode.addEventListener('click', () => setMode('camera'));
uploadMode.addEventListener('click', () => setMode('upload'));

async function initCamera() {
  if (!stream) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      preview.srcObject = stream;
    } catch (err) {
      console.error('camera init failed', err);
      return false;
    }
  }
  return true;
}

startBtn.addEventListener('click', async () => {
  const ok = await initCamera();
  if (!ok) return;
  chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => {
    // some browsers fire an empty Blob event at start; guard against it
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    preview.srcObject = stream;
  }
}

startBtn.addEventListener('click', async () => {
  await initCamera();
  chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = uploadRecording;
  recorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
  recorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

async function uploadRecording() {
  if (!chunks.length) return;


  const blob = new Blob(chunks, { type: 'video/webm' });
  const file = new File([blob], 'recording.webm', { type: 'video/webm' });
  const fd = new FormData();
  fd.append('video', file);
  await fetch('/upload', { method: 'POST', body: fd });
  window.location.href = '/videos';
}

uploadFileBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('video', file);
  await fetch('/upload', { method: 'POST', body: fd });
  window.location.href = '/videos';
});
