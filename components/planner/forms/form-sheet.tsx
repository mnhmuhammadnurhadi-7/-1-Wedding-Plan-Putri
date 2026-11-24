"use client";

import { useEffect, useMemo, useState } from "react";
import { compressImage, uploadBlob } from "../data/api";
import type { FormField, FormSpec, FormValues } from "../data/types";
import { Icon } from "../ui/icon";
import { Sheet } from "../ui/sheet";

const displayValue = (field: FormField, value: string) => {
  if (field.type === "money" && value !== "") {
    const numeric = value.replace(/\D/g, "");
    return numeric ? Number(numeric).toLocaleString("id-ID") : "";
  }
  return value;
};

const formatValues = (spec: FormSpec) => {
  const result: FormValues = {};
  for (const field of spec.fields) {
    result[field.key] = displayValue(
      field,
      spec.values[field.key] == null ? "" : String(spec.values[field.key]),
    );
  }
  return result;
};

export function FormSheet({
  spec,
  onClose,
  toast,
  canWrite,
}: {
  spec: FormSpec;
  onClose: () => void;
  toast: (message: string) => void;
  canWrite: boolean;
}) {
  const initial = useMemo(() => formatValues(spec), [spec]);
  const [values, setValues] = useState<FormValues>(initial);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    spec.onOpen?.((key, value) => {
      setValues((previous) => ({
        ...previous,
        [key]: displayValue({ key, label: key, type: "money" }, value),
      }));
    });
  }, [spec]);

  const setValue = (key: string, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const save = () => {
    const output: FormValues = {};
    for (const field of spec.fields) {
      const raw = (values[field.key] || "").trim();
      if (field.type === "money") {
        output[field.key] = String(Number(raw.replace(/\D/g, "")) || 0);
      } else if (field.type === "num") {
        output[field.key] = String(Number(raw.replace(/[^\d-]/g, "")) || 0);
      } else {
        output[field.key] = raw;
      }
      if (
        field.required &&
        (output[field.key] === "" ||
          (field.type === "money" && Number(output[field.key]) === 0))
      ) {
        toast(`Lengkapi: ${field.label.toLowerCase()}`);
        document.getElementById(`f_${field.key}`)?.focus();
        return;
      }
    }
    if (spec.save(output) !== false) onClose();
  };

  const upload = async (field: FormField, file?: File) => {
    if (!file) return;
    setBusy(true);
    toast("Mengunggah...");
    try {
      const compressed = await compressImage(file);
      const result = await uploadBlob(compressed, file.name);
      setValue(field.key, result.url);
      toast("Berkas terunggah");
    } catch {
      toast("Gagal mengunggah. Coba tempel link.");
    } finally {
      setBusy(false);
    }
  };

  const renderField = (field: FormField) => {
    const id = `f_${field.key}`;
    const value = values[field.key] || "";
    const common = {
      id,
      name: field.key,
      value,
      autoComplete: "off",
    };
    let input: React.ReactNode;

    if (field.type === "select") {
      input = (
        <select
          id={id}
          name={field.key}
          value={value}
          onChange={(event) => setValue(field.key, event.target.value)}
        >
          {(field.options || []).map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </select>
      );
    } else if (field.type === "area") {
      input = (
        <textarea
          id={id}
          name={field.key}
          value={value}
          onChange={(event) => setValue(field.key, event.target.value)}
        />
      );
    } else if (field.type === "money") {
      input = (
        <input
          {...common}
          type="text"
          inputMode="numeric"
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            setValue(
              field.key,
              digits ? Number(digits).toLocaleString("id-ID") : "",
            );
          }}
        />
      );
    } else if (field.type === "num") {
      input = (
        <input
          {...common}
          type="text"
          inputMode="numeric"
          onChange={(event) => setValue(field.key, event.target.value)}
        />
      );
    } else if (field.type === "attach") {
      input = (
        <div className="attach">
          <input
            {...common}
            type="text"
            placeholder={`Tempel link${field.image ? " atau unggah gambar" : " atau unggah berkas"}`}
            onChange={(event) => setValue(field.key, event.target.value)}
          />
          <label className="btn sm">
            Unggah
            <input
              type="file"
              accept={field.image ? "image/*" : "image/*,application/pdf"}
              hidden
              disabled={busy || !canWrite}
              onChange={(event) => {
                void upload(field, event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      );
    } else {
      input = (
        <input
          {...common}
          type={field.type || "text"}
          inputMode={field.type === "tel" ? "tel" : undefined}
          list={field.list ? `dl_${field.key}` : undefined}
          onChange={(event) => setValue(field.key, event.target.value)}
        />
      );
    }

    return (
      <div className="fld" key={field.key}>
        <label htmlFor={id}>{field.label}</label>
        {input}
        {field.list?.length ? (
          <datalist id={`dl_${field.key}`}>
            {field.list.map((entry) => (
              <option key={entry} value={entry} />
            ))}
          </datalist>
        ) : null}
        {field.hint ? (
          <span
            className="note"
            dangerouslySetInnerHTML={{ __html: field.hint }}
          />
        ) : null}
        {field.type === "attach" && value && field.image ? (
          <img className="thumb" src={value} alt="" />
        ) : null}
      </div>
    );
  };

  const body: React.ReactNode[] = [];
  for (let index = 0; index < spec.fields.length; index += 1) {
    const field = spec.fields[index];
    const next = spec.fields[index + 1];
    if (field.half && next?.half) {
      body.push(
        <div className="frow" key={`${field.key}-${next.key}`}>
          {renderField(field)}
          {renderField(next)}
        </div>,
      );
      index += 1;
    } else {
      body.push(renderField(field));
    }
  }

  return (
    <Sheet form label={spec.title} onClose={onClose} onSubmit={save}>
      <h2>{spec.title}</h2>
      {body}
      {confirming ? (
        <div className="confirm">
          <p>Hapus data ini? Tindakan ini tidak bisa dibatalkan.</p>
          <div className="acts" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn"
              onClick={() => setConfirming(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                spec.onDelete?.();
                onClose();
              }}
            >
              Ya, hapus
            </button>
          </div>
        </div>
      ) : (
        <div className="acts">
          {spec.onDelete && canWrite ? (
            <button
              type="button"
              className="btn bad sp"
              onClick={() => setConfirming(true)}
            >
              Hapus
            </button>
          ) : null}
          <button type="button" className="btn" onClick={onClose}>
            Batal
          </button>
          {canWrite ? (
            <button type="button" className="btn pri" onClick={save}>
              <Icon name="tick" />
              Simpan
            </button>
          ) : null}
        </div>
      )}
    </Sheet>
  );
}
