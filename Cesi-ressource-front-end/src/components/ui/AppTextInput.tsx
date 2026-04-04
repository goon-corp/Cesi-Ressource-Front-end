import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export interface AppTextInputProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  isPassword?: boolean;
  multiline?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  autoComplete?: string;
  readOnly?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export function AppTextInput({
  label,
  error,
  hint,
  required = false,
  isPassword = false,
  multiline = false,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  type,
  autoComplete,
  readOnly = false,
  disabled = false,
  style,
  id,
}: AppTextInputProps) {
  const { colors } = useTheme();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.inputBorderFocus
      : colors.inputBorder;

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: readOnly ? colors.textMuted : colors.text,
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: multiline ? 96 : 44,
    ...style,
  };

  const resolvedType = isPassword ? (isPasswordVisible ? 'text' : 'password') : (type ?? 'text');

  return (
    <div style={{ marginBottom: 16 }}>
      <AppText variant="label" style={{ color: colors.text, display: 'block', marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: colors.error }}> *</span>}
      </AppText>

      <div
        style={{
          display: 'flex',
          alignItems: multiline ? 'flex-start' : 'center',
          border: `2px solid ${borderColor}`,
          borderRadius: 4,
          backgroundColor: readOnly ? colors.backgroundAlt : colors.inputBackground,
          paddingLeft: 8,
          paddingRight: 8,
          transition: 'border-color 0.15s',
        }}
      >
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            autoComplete={autoComplete}
            style={inputStyle}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          />
        ) : (
          <input
            id={id}
            type={resolvedType}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            autoComplete={autoComplete}
            style={inputStyle}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((v) => !v)}
            aria-label={isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            {isPasswordVisible
              ? <EyeOff size={20} color={colors.textMuted} />
              : <Eye size={20} color={colors.textMuted} />
            }
          </button>
        )}
      </div>

      {error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <AlertCircle size={14} color={colors.error} />
          <AppText variant="caption" style={{ color: colors.error }}>{error}</AppText>
        </div>
      ) : hint ? (
        <AppText variant="caption" muted style={{ marginTop: 4, display: 'block' }}>{hint}</AppText>
      ) : null}
    </div>
  );
}
