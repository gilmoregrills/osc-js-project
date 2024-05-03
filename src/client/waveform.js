import { Master, Waveform, Transport } from "tone";

const canvasWidth = 512;

const makeCanvas = () => {
  const div = document.getElementById("waveform");
  const canvas = document.createElement("canvas");
  div.appendChild(canvas);
  canvas.id = "waveform-canvas";
  canvas.width = div.offsetWidth;
  canvas.height = div.offsetHeight;
  return canvas;
};

const nearestPowerOf2 = (n) => {
  return 1 << (31 - Math.clz32(n));
};

export const startWaveformLoop = () => {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d");
  const midpt = canvas.height / 2;
  const waveform = new Waveform(nearestPowerOf2(canvas.width));
  Master.connect(waveform);

  const repeat = (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waveData = waveform.getValue();
    console.log(waveData);
    ctx.beginPath();
    waveData.forEach((val, index) => {
      ctx.rect(index, midpt + val * midpt, 1, 1);
    });
    ctx.stroke();
  };

  Transport.scheduleRepeat(repeat, "0.1");
};
