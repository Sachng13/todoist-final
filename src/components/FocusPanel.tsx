import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store";

export default function FocusPanel() {
  const { tasks, updateTask } = useStore();

  const focusOptions = [
    { label: "1 min", value: 1 * 60 },
    { label: "5 min", value: 5 * 60 },
    { label: "25 min", value: 25 * 60 },
    { label: "45 min", value: 45 * 60 },
    { label: "60 min", value: 60 * 60 },
  ];

  const BREAK_TIME = 5 * 60;

  const [active, setActive] = useState<string | undefined>();
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  const [focusTime, setFocusTime] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);

  const [zenMode, setZenMode] = useState(false);

  // ----------------------------------------------
  // Timer Tick
  // ----------------------------------------------
  useEffect(() => {
    let t: any;
    if (running)
      t = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);

    return () => clearInterval(t);
  }, [running]);

  // ----------------------------------------------
  // Timer Finished
  // ----------------------------------------------
  useEffect(() => {
    if (seconds > 0) return;

    setRunning(false);

    if (mode === "focus" && active) {
      updateTask(active, {
        completed: true,
        completedAt: Date.now(),
      });

      playSound();
      alert("Focus session completed!");

      setMode("break");
      setSeconds(BREAK_TIME);
    } else if (mode === "break") {
      playSound();
      alert("Break finished! Ready to start another focus session.");

      setMode("focus");
      setSeconds(focusTime);
    }
  }, [seconds]);

  // ----------------------------------------------
  // Sound
  // ----------------------------------------------
  function playSound() {
    const audio = new Audio("/ding.mp3");
    audio.play().catch(() => {});
  }

  // ----------------------------------------------
  // Reset
  // ----------------------------------------------
  function resetTimer() {
    setRunning(false);
    setMode("focus");
    setSeconds(focusTime);
  }

  // ----------------------------------------------
  // Start new session after selecting custom length
  // ----------------------------------------------
  function selectFocusDuration(sec: number) {
    if (running) return; // prevent changes mid-run
    setFocusTime(sec);
    setSeconds(sec);
  }

  // ----------------------------------------------
  // Zen Mode Exit (ESC)
  // ----------------------------------------------
  useEffect(() => {
    function listener(e: KeyboardEvent) {
      if (e.key === "Escape") setZenMode(false);
    }
    if (zenMode) document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [zenMode]);

  const activeTask = tasks.find((t) => t.id === active);

  const percentage =
    mode === "focus" ? 1 - seconds / focusTime : 1 - seconds / BREAK_TIME;

  return (
    <>
      {/* MAIN UI */}
      {!zenMode && (
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-3">Focus / Pomodoro</h3>

          {/* Task Selection */}
          <select
            className="border p-2 w-full mb-3"
            value={active || ""}
            disabled={running}
            onChange={(e) => setActive(e.target.value)}
          >
            <option value="">Select a task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          {/* Choose Focus Time */}
          <div className="mb-3 text-sm">
            <div className="font-medium mb-1">Focus Duration</div>
            <div className="flex gap-2 flex-wrap">
              {focusOptions.map((opt) => (
                <button
                  key={opt.value}
                  disabled={running}
                  onClick={() => selectFocusDuration(opt.value)}
                  className={`px-3 py-1 rounded border ${
                    focusTime === opt.value
                      ? "bg-[#ef5350] text-white border-[#ef5350]"
                      : "bg-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Circle */}
          <TimerCircle percentage={percentage} mode={mode} seconds={seconds} />

          {/* Controls */}
          <div className="flex gap-2 justify-center mt-3">
            {!running && (
              <button
                className="px-4 py-1 bg-[#ef5350] text-white rounded"
                disabled={!active}
                onClick={() => active && setRunning(true)}
              >
                Start
              </button>
            )}

            {running && (
              <button
                className="px-4 py-1 bg-gray-200 rounded"
                onClick={() => setRunning(false)}
              >
                Pause
              </button>
            )}

            <button
              className="px-4 py-1 bg-gray-200 rounded"
              onClick={resetTimer}
            >
              Reset
            </button>

            <button
              className="px-4 py-1 bg-black text-white rounded"
              disabled={!active}
              onClick={() => setZenMode(true)}
            >
              Zen Mode
            </button>
          </div>
        </div>
      )}

      {/* ZEN MODE OVERLAY */}
      {zenMode && (
        <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50">
          <TimerCircle
            percentage={percentage}
            mode={mode}
            seconds={seconds}
            size={260}
          />

          <div className="text-gray-300 mt-4">
            Press <span className="text-white font-semibold">ESC</span> to exit
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------- */
/* Timer Circle Component                                   */
/* -------------------------------------------------------- */

function TimerCircle({
  percentage,
  seconds,
  mode,
  size = 160,
}: {
  percentage: number;
  seconds: number;
  mode: string;
  size?: number;
}) {
  const radius = size / 2 - 10;
  const circumference = radius * 2 * Math.PI;

  return (
    <div className="flex justify-center my-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#333"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ef5350"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - circumference * percentage}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-lg font-semibold capitalize">{mode}</div>
          <div className="text-2xl font-mono">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
