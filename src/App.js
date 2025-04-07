import React, { useState } from "react";
import jsPDF from "jspdf";

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    lineHeight: 1.6,
    color: "#333",
  },
  section: {
    marginBottom: 30,
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#f9f9f9",
  },
  label: {
    fontWeight: "bold",
    display: "block",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    border: "1px solid #ccc",
    borderRadius: 5,
  },
  textarea: {
    width: "100%",
    padding: 10,
    minHeight: 80,
    border: "1px solid #ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    marginRight: 10,
    padding: "10px 20px",
    border: "none",
    borderRadius: 5,
    background: "#007bff",
    color: "white",
    cursor: "pointer",
  },
  addButton: {
    padding: "6px 12px",
    border: "1px solid #007bff",
    background: "white",
    color: "#007bff",
    borderRadius: 5,
    cursor: "pointer",
    marginBottom: 10,
  },
  h2: {
    marginBottom: 10,
    color: "#007bff",
  },
};

export default function App() {
  const removeParticipant = (index) => {
    const confirmDelete = window.confirm(
      "Deseja realmente remover este participante?"
    );
    if (confirmDelete) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const removeTheme = (index) => {
    const confirmDelete = window.confirm("Deseja realmente remover este tema?");
    if (confirmDelete) {
      setThemes(themes.filter((_, i) => i !== index));
    }
  };

  const [step, setStep] = useState(1);

  const [client, setClient] = useState("");
  const [address, setAddress] = useState("");
  const [participants, setParticipants] = useState([""]);

  const [themes, setThemes] = useState([
    { titulo: "", descricao: "", decisoes: "", fotos: [] },
  ]);

  const updateThemeField = (index, field, value) => {
    setThemes((prevThemes) => {
      const updated = [...prevThemes];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addParticipant = () => setParticipants([...participants, ""]);
  const updateParticipant = (value, index) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const addTheme = () =>
    setThemes([
      ...themes,
      { titulo: "", descricao: "", decisoes: "", fotos: [] },
    ]);

  const updateTheme = (index, field, value) => {
    const updated = [...themes];
    updated[index][field] = value;
    setThemes(updated);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    doc.setFontSize(16);
    doc.text("ATA DE REUNIÃO", 105, 20, null, null, "center");

    doc.setFontSize(10);
    doc.text(
      `Data: ${dateStr}    Hora: ${timeStr}`,
      105,
      27,
      null,
      null,
      "center"
    );

    let y = 35;
    doc.setFontSize(12);
    doc.text(`Cliente: ${client}`, 10, y);
    y += 10;
    doc.text(`Endereço da Obra: ${address}`, 10, y);
    y += 10;

    doc.text("Participantes:", 10, y);
    participants.forEach((p) => {
      y += 7;
      doc.text(` • ${p}`, 15, y);
    });

    y += 10;

    for (let i = 0; i < themes.length; i++) {
      const theme = themes[i];

      doc.setFont(undefined, "bold");
      doc.text(`Tema ${i + 1}: ${theme.titulo}`, 10, y);
      y += 8;
      doc.setFont(undefined, "normal");

      doc.text("Discussão:", 12, y);
      y += 6;
      const faladoLines = doc.splitTextToSize(theme.descricao, 180);
      doc.text(faladoLines, 15, y);
      y += faladoLines.length * 6;

      doc.text("Decisão:", 12, y);
      y += 6;
      const decisoesLines = doc.splitTextToSize(theme.decisoes, 180);
      doc.text(decisoesLines, 15, y);
      y += decisoesLines.length * 6;

      if (theme.fotos.length > 0) {
        doc.text("Fotos:", 12, y);
        y += 6;

        for (let j = 0; j < theme.fotos.length; j++) {
          const file = theme.fotos[j];
          const base64 = await toBase64(file);

          if (y > 270) {
            doc.addPage();
            y = 10;
          }

          doc.addImage(base64, "JPEG", 15, y, 60, 60); // redimensiona a imagem
          y += 65;
        }
      }

      y += 10;
    }

    doc.save(
      `ata_${dateStr.replace(/\//g, "-")}_${timeStr.replace(/:/g, "-")}.pdf`
    );
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleThemePhotos = (i, files) => {
    const newThemes = [...themes];
    const newPhotos = Array.from(files);
    newThemes[i].fotos = [...newThemes[i].fotos, ...newPhotos];
    setThemes(newThemes);
  };

  const removeThemePhoto = (themeIndex, photoIndex) => {
    const newThemes = [...themes];
    newThemes[themeIndex].fotos.splice(photoIndex, 1);
    setThemes(newThemes);
  };

  return (
    <div style={styles.container}>
      {step === 1 && (
        <div style={styles.section}>
          <h2 style={styles.h2}>Informações básicas</h2>

          <label style={styles.label}>Nome do cliente:</label>
          <input
            style={styles.input}
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />

          <label style={styles.label}>Endereço da obra:</label>
          <input
            style={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {participants.map((p, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <input
                placeholder={`Participante ${i + 1}`}
                style={{ ...styles.input, flex: 1 }}
                value={p}
                onChange={(e) => updateParticipant(e.target.value, i)}
              />
              <button
                style={styles.removeButton}
                onClick={() => removeParticipant(i)}
              >
                🗑️
              </button>
            </div>
          ))}
          <button style={styles.addButton} onClick={addParticipant}>
            + Adicionar participante
          </button>

          <br />
          <button style={styles.button} onClick={() => setStep(2)}>
            Avançar
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={styles.section}>
          <h2 style={styles.h2}>Temas da Reunião</h2>

          {themes.map((theme, i) => (
            <div
              key={i}
              style={{
                marginBottom: 20,
                borderBottom: "1px solid #ccc",
                paddingBottom: 10,
              }}
            >
              <label style={styles.label}>Tema {i + 1}:</label>
              <input
                style={styles.input}
                value={theme.titulo}
                onChange={(e) => updateThemeField(i, "titulo", e.target.value)}
              />

              <label style={styles.label}>Discussão</label>
              <textarea
                style={styles.textarea}
                value={theme.descricao}
                onChange={(e) =>
                  updateThemeField(i, "descricao", e.target.value)
                }
              />

              <label style={styles.label}>Decisão:</label>
              <textarea
                style={styles.textarea}
                value={theme.decisoes}
                onChange={(e) =>
                  updateThemeField(i, "decisoes", e.target.value)
                }
              />
              <label style={styles.label}>Fotos:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleThemePhotos(i, e.target.files)}
              />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: 10,
                }}
              >
                {theme.fotos.map((foto, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`foto-${index}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <button
                      onClick={() => removeThemePhoto(i, index)}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "red",
                        color: "white",
                        borderRadius: "50%",
                        border: "none",
                        width: 20,
                        height: 20,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                style={styles.removeButton}
                onClick={() => removeTheme(i)}
              >
                🗑️ Remover tema
              </button>
            </div>
          ))}

          <button style={styles.addButton} onClick={addTheme}>
            + Adicionar tema
          </button>

          <br />
          <button style={styles.button} onClick={() => setStep(1)}>
            Voltar
          </button>
          <button style={styles.button} onClick={() => setStep(3)}>
            Avançar
          </button>
        </div>
      )}

      {step === 3 && (
        <div style={styles.section}>
          <h2 style={styles.h2}>Resumo</h2>

          <p>
            <strong>Cliente:</strong> {client}
          </p>
          <p>
            <strong>Endereço:</strong> {address}
          </p>

          <p>
            <strong>Participantes:</strong>
          </p>
          <ul>
            {participants.map((p, i) => (
              <li key={i}>- {p}</li>
            ))}
          </ul>

          <h3 style={{ marginTop: 20 }}>Temas:</h3>
          {themes.map((t, i) => (
            <div key={i} style={{ marginBottom: 15 }}>
              <p>
                <strong>Tema {i + 1}:</strong> {t.titulo}
              </p>
              <p>
                <em>Discussão:</em> {t.descricao}
              </p>
              <p>
                <em>Decisão:</em> {t.decisao}
              </p>
            </div>
          ))}

          <button style={styles.button} onClick={() => setStep(2)}>
            Voltar
          </button>
          <button style={styles.button} onClick={generatePDF}>
            Gerar PDF
          </button>
        </div>
      )}
    </div>
  );
}
