import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, placeholder }) => {
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-upload-container" style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Fotografía
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button 
          type="button"
          onClick={() => setMode('url')}
          className={`btn-toggle ${mode === 'url' ? 'active' : ''}`}
        >
          <LinkIcon size={14} /> URL
        </button>
        <button 
          type="button"
          onClick={() => setMode('file')}
          className={`btn-toggle ${mode === 'file' ? 'active' : ''}`}
        >
          <Upload size={14} /> Archivo Local
        </button>
      </div>

      {mode === 'url' ? (
        <input 
          type="url" 
          value={value.startsWith('data:image') ? '' : value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder || "https://ejemplo.com/foto.jpg"}
          className="form-input"
          style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white' }}
        />
      ) : (
        <div 
          className="file-drop-area"
          onClick={() => fileInputRef.current?.click()}
        >
          {value.startsWith('data:image') ? (
            <img src={value} alt="Preview" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              <Upload size={24} style={{ margin: '0 auto 8px' }} />
              <span style={{ fontSize: '0.85rem' }}>Click para seleccionar imagen</span>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      <style>{`
        .btn-toggle {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .btn-toggle.active {
          background: var(--primary-glow);
          color: var(--primary);
          border-color: var(--primary);
        }
        .file-drop-area {
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          min-height: 100px;
          background: rgba(0,0,0,0.2);
          transition: var(--transition);
        }
        .file-drop-area:hover {
          border-color: var(--primary);
          background: rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;