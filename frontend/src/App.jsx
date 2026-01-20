import React, { useState } from "react";
import { runAgent } from "./Agent";

export default function App() {
  const [fileInfo, setFileInfo] = useState(null);
  const [callId, setCallId] = useState(null);
  const [stage, setStage] = useState("idle");
  const [backendResult, setBackendResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setStage("requesting");
    setFileInfo(null);
    setCallId(null);
    setBackendResult(null);
    setLogs([]);

    const onEvent = (type, payload) => {
      const timestamp = new Date().toLocaleTimeString("ru-RU");
      const entry = { type, payload, timestamp };
      setLogs((prev) => [...prev, entry]);

      if (type === "request_sent") setStage("waiting_user");
      if (type === "picker_opened") setStage("waiting_user");
      if (type === "result_sent") setStage("result_sent");
      if (type === "picker_error") setStage("error");
      if (type === "agent_poll_done") setStage("done");
    };

    const { callId: newCallId, result, backendResult: backend } =
      await runAgent({ onEvent });
    setCallId(newCallId);
    setFileInfo(result);
    setBackendResult(backend);
    setStage(result && result.error ? "error" : "done");
    setLoading(false);
  };

  const getStageLabel = () => {
    if (loading && stage === "requesting") {
      return "Запрос инструмента и ожидание выбора файла...";
    }
    if (loading) {
      return "Ожидаем действие пользователя...";
    }
    if (stage === "result_sent") {
      return "Результат отправлен на бэкенд";
    }
    if (stage === "error") {
      return "Выбор файла отменен или не удался";
    }
    if (stage === "done") {
      return "Результат получен";
    }
    return "Ожидание запуска";
  };

  const getStepStatus = (step) => {
    if (stage === "idle") return step === "start" ? "active" : "pending";
    if (stage === "requesting") {
      return step === "request" ? "active" : "pending";
    }
    if (stage === "waiting_user") {
      return step === "picker" ? "active" : step === "request" ? "done" : "pending";
    }
    if (stage === "error") {
      if (step === "request") return "done";
      if (step === "picker") return "error";
      if (step === "send") return "done";
      return "pending";
    }
    if (stage === "result_sent") {
      if (step === "request" || step === "picker" || step === "send") return "done";
      return "active";
    }
    if (stage === "done") return "done";
    return "pending";
  };

  const stepColors = {
    done: "#16a34a",
    active: "#2563eb",
    pending: "#cbd5f5",
    error: "#dc2626",
  };

  const renderStep = (id, title, description) => {
    const status = getStepStatus(id);
    return (
      <div
        key={id}
        style={{
          display: "flex",
          gap: "0.8rem",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: stepColors[status],
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {status === "done"
            ? "✓"
            : status === "error"
            ? "!"
            : id === "start"
            ? "0"
            : id === "request"
            ? "1"
            : id === "picker"
            ? "2"
            : id === "send"
            ? "3"
            : "4"}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
          <p style={{ margin: "0.2rem 0 0", color: "#475569" }}>
            {description}
          </p>
        </div>
      </div>
    );
  };

  const getStatusTone = () => {
    if (loading) return "#2563eb";
    if (stage === "error") return "#dc2626";
    if (stage === "done") return "#16a34a";
    if (stage === "result_sent") return "#0ea5e9";
    return "#64748b";
  };

  const formatBytes = (value) => {
    if (!Number.isFinite(value)) return value;
    if (value < 1024) return `${value} B`;
    const kb = value / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
      padding: "2rem",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#0f172a",
    },
    card: {
      margin: "0 auto",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "1.5rem",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    },
    header: {
      marginBottom: "1rem",
    },
    subtitle: {
      margin: "0.25rem 0 1rem",
      color: "#475569",
    },
    button: {
      background: loading ? "#94a3b8" : "#0f172a",
      color: "#ffffff",
      border: "none",
      borderRadius: 10,
      padding: "0.7rem 1.2rem",
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: 600,
    },
    grid: {
      display: "grid",
      gap: "1rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      marginTop: "1rem",
    },
    panel: {
      padding: "1rem",
      borderRadius: 10,
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
    },
    statusPanel: {
      padding: "1rem",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      background: "#ffffff",
    },
    chatPanel: {
      padding: "1rem",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      background: "#ffffff",
      display: "grid",
      gap: "0.8rem",
    },
    chatHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    chatBody: {
      display: "grid",
      gap: "0.8rem",
    },
    chatBubble: {
      padding: "0.8rem",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
    },
    chatUser: {
      background: "#f1f5f9",
      justifySelf: "start",
    },
    chatAgent: {
      background: "#ecfeff",
      justifySelf: "end",
    },
    chatFooter: {
      display: "flex",
      gap: "0.5rem",
    },
    chatInput: {
      width: "100%",
      borderRadius: 10,
      border: "1px solid #e2e8f0",
      padding: "0.6rem 0.8rem",
      fontFamily: "inherit",
    },
    chatButton: {
      marginTop: "0.6rem",
      color: "#ffffff",
      border: "none",
      borderRadius: 10,
      padding: "0.5rem 0.9rem",
      fontWeight: 600,
    },
    chatButtonSecondary: {
      marginTop: "0.6rem",
      background: "#0f172a",
      color: "#ffffff",
      border: "none",
      borderRadius: 10,
      padding: "0.5rem 0.9rem",
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: 600,
    },
    flowPanel: {
      padding: "1rem",
      borderRadius: 10,
      border: "1px solid #e2e8f0",
      background: "#ffffff",
    },
    badge: {
      display: "inline-block",
      padding: "0.2rem 0.6rem",
      borderRadius: 999,
      background: getStatusTone(),
      color: "#ffffff",
      fontSize: "0.8rem",
      fontWeight: 600,
    },
    logList: {
      paddingLeft: "1.2rem",
      color: "#334155",
    },
    code: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: "0.85rem",
      color: "#0f172a",
    },
  };

  const combinedLogs = [...logs];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1>Мини-демо ExternalToolset</h1>
          <p style={styles.subtitle}>
            Агент просит инструмент, фронтенд выполняет действие, бэкенд получает
            результат.
          </p>
        </div>

        <div style={styles.grid}>
          <div style={styles.chatPanel}>
            <div style={styles.chatHeader}>
              <strong>Чат (User ↔ Agent)</strong>
              <span style={styles.badge}>{loading ? "работает" : "готов"}</span>
            </div>
            <div style={styles.chatBody}>
              <div style={{ ...styles.chatBubble, ...styles.chatUser }}>
                <p style={{ margin: 0, fontWeight: 600 }}>User</p>
                <p style={{ margin: "0.2rem 0 0" }}>
                  Сравни счет-фактуру с договором и найди расхождения.
                </p>
              </div>
              <div style={{ ...styles.chatBubble, ...styles.chatAgent }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Agent</p>
                <p style={{ margin: "0.2rem 0 0" }}>
                  Нужен локальный документ. Запрашиваю инструмент
                  <span style={{ ...styles.code, marginLeft: 4 }}>pickFile</span>.
                </p>
                <button
                  onClick={handleClick}
                  disabled={loading || (fileInfo && fileInfo.error)}
                  style={{
                    ...styles.chatButton,
                    background:
                      loading || (fileInfo && fileInfo.error)
                        ? "#94a3b8"
                        : "#0f172a",
                    cursor:
                      loading || (fileInfo && fileInfo.error)
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {loading ? "Ожидаем файл..." : "Запустить инструмент"}
                </button>
              </div>
              {fileInfo && fileInfo.error && (
                <div style={{ ...styles.chatBubble, ...styles.chatAgent }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>Agent</p>
                  <p style={{ margin: "0.2rem 0 0" }}>
                    Похоже, файл решил остаться инкогнито. Нажмёшь ещё раз?
                  </p>
                  <button
                    onClick={handleClick}
                    disabled={loading}
                    style={styles.chatButtonSecondary}
                  >
                    {loading ? "Ожидаем файл..." : "Попробовать снова"}
                  </button>
                </div>
              )}
              {fileInfo && !fileInfo.error && (
                <div style={{ ...styles.chatBubble, ...styles.chatAgent }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>Agent</p>
                  <p style={{ margin: "0.2rem 0 0" }}>
                    Файл получен! Обещаю обращаться бережно и без кофе рядом.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={styles.flowPanel}>
            <p style={{ marginTop: 0 }}>
              <strong>Сценарий (живой поток)</strong>
            </p>
            <div style={{ display: "grid", gap: "0.9rem" }}>
              {renderStep(
                "start",
                "Инициация",
                "Пользователь запускает сценарий во фронтенде."
              )}
              {renderStep(
                "request",
                "Agent → Backend",
                "Deferred call отправлен через /request_tool/."
              )}
              {renderStep(
                "picker",
                "Frontend → UI",
                "Открывается системный диалог выбора файла."
              )}
              {renderStep(
                "send",
                "Frontend → Backend",
                "Результат отправлен через /tool_result/."
              )}
              {renderStep(
                "poll",
                "Agent → Backend",
                "Агент опрашивает /tool_result/{call_id}."
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <h3>Лог шагов</h3>
          <div style={{ margin: "0.8rem 0" }}>
            <div style={styles.statusPanel}>
              <div
                style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}
              >
                <strong>Статус</strong>
                <span style={styles.badge}>stage: {stage}</span>
              </div>
              <p style={{ margin: "0.6rem 0 0" }}>{getStageLabel()}</p>
              {callId && (
                <p style={{ margin: "0.6rem 0 0" }}>
                  <span style={{ color: "#475569" }}>Call ID:</span>{" "}
                  <span style={styles.code}>{callId}</span>
                </p>
              )}
              {fileInfo && fileInfo.error && (
                <p style={{ margin: "0.6rem 0 0", color: "#dc2626" }}>
                  Результат: ошибка ({fileInfo.error})
                </p>
              )}
              {fileInfo && !fileInfo.error && (
                <p style={{ margin: "0.6rem 0 0", color: "#16a34a" }}>
                  Результат: {fileInfo.name} ({formatBytes(fileInfo.size)})
                </p>
              )}
              {!fileInfo && (
                <p style={{ margin: "0.6rem 0 0", color: "#94a3b8" }}>
                  Результат: нет
                </p>
              )}
            </div>
          </div>
          {combinedLogs.length === 0 && <p>Пока нет событий</p>}
          {combinedLogs.length > 0 && (
            <ul style={styles.logList}>
              {combinedLogs.map((entry, index) => (
                <li key={`${entry.type}-${index}`}>
                  [{entry.timestamp}] {formatEvent(entry)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function formatEvent(entry) {
  switch (entry.type) {
    case "request_sending":
      return "Фронтенд отправляет deferred call на бэкенд";
    case "request_sent":
      return "Бэкенд принял deferred call";
    case "picker_opened":
      return "Открыт системный диалог выбора файла";
    case "picker_result":
      return "Файл выбран пользователем";
    case "picker_error":
      return "Выбор файла отменен или не удался";
    case "result_sending":
      return "Фронтенд отправляет ToolResult на бэкенд";
    case "result_sent":
      return "Бэкенд принял ToolResult";
    case "agent_poll_start":
      return "Агент опрашивает бэкенд на наличие результата";
    case "agent_poll_done":
      return "Агент получил результат от бэкенда";
    case "agent_poll_timeout":
      return "Агент не дождался результата";
    default:
      return entry.type;
  }
}