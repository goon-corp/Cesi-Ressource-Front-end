import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, X, Search, PlusCircle, Image as ImageIcon, Trash2, Plus, AlertCircle, Tag } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppAlert } from '@/components/ui/AppAlert';
import { toast } from '@/components/ui/Toast';
import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { resourceService } from '@/services/resource.service';
import { tagService } from '@/services/tag.service';
import { eventService, type CreateEventPayload } from '@/services/event.service';
import { articleService, type CreateArticlePayload } from '@/services/article.service';
import { quizService, type CreateQuizPayload } from '@/services/quiz.service';
import { pollService, type CreatePollPayload } from '@/services/poll.service';
import type { TagDto } from '@/types/resource.types';

// ─── Quiz builder types ───────────────────────────────────────────────────────

interface QuizAnswer { id: string; text: string; }
interface QuizQuestion { id: string; question: string; answers: QuizAnswer[]; correctAnswerId: string; }
interface PollOption { id: string; text: string; }

function generateId(): string { return Math.random().toString(36).slice(2, 9); }

function makeDefaultQuestion(): QuizQuestion {
  const a1 = { id: generateId(), text: '' };
  const a2 = { id: generateId(), text: '' };
  return { id: generateId(), question: '', answers: [a1, a2], correctAnswerId: a1.id };
}

function makeDefaultOptions(): PollOption[] {
  return [{ id: generateId(), text: '' }, { id: generateId(), text: '' }];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeLabel(label: string): string {
  return label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function isEventLabel(label: string): boolean {
  const n = normalizeLabel(label);
  return n.includes('event') || n.includes('venement');
}
function isArticleLabel(label: string): boolean { return normalizeLabel(label).includes('article'); }
function isQuizLabel(label: string): boolean { return normalizeLabel(label).includes('quiz'); }
function isPollLabel(label: string): boolean {
  const n = normalizeLabel(label);
  return n.includes('poll') || n.includes('sondage');
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

const STEPS = ['Infos', 'Catégories', 'Détails'];

function Stepper({ current }: { current: number }) {
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px 16px' }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              border: `2px solid ${i <= current ? colors.primary : colors.border}`,
              backgroundColor: i <= current ? colors.primary : colors.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i < current
                ? <Check size={14} color={colors.textOnPrimary} />
                : <span style={{ color: i === current ? colors.textOnPrimary : colors.textMuted, fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
              }
            </div>
            <AppText variant="caption" muted style={{ marginTop: 4, textAlign: 'center' }}>{label}</AppText>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, marginTop: 13, backgroundColor: i < current ? colors.primary : colors.border }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── AppSelect ────────────────────────────────────────────────────────────────

interface SelectOption { id: string; label: string; }

function AppSelect({ label, placeholder, options, value, onChange, required, error }: {
  label: string; placeholder: string; options: SelectOption[];
  value: string | null; onChange: (id: string) => void; required?: boolean; error?: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <div style={{ marginBottom: 16, position: 'relative' }}>
      <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>
        {label}{required && <span style={{ color: colors.error }}> *</span>}
      </AppText>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          border: `2px solid ${error ? colors.error : colors.inputBorder}`,
          borderRadius: 4, padding: '10px 12px', minHeight: 44,
          backgroundColor: colors.inputBackground, cursor: 'pointer',
          fontFamily: 'inherit', gap: 8,
        }}
      >
        <AppText variant="body" style={{ flex: 1, textAlign: 'left', color: selected ? colors.text : colors.placeholder }}>
          {selected ? selected.label : placeholder}
        </AppText>
        <ChevronDown size={18} color={colors.textMuted} />
      </button>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <AlertCircle size={14} color={colors.error} />
          <AppText variant="caption" style={{ color: colors.error }}>{error}</AppText>
        </div>
      )}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: 4,
            backgroundColor: colors.surface, borderRadius: 4, border: `1px solid ${colors.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto',
          }}>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => { onChange(option.id); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: option.id === value ? colors.primaryLight : 'none',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <AppText variant="body" style={{ color: option.id === value ? colors.primary : colors.text }}>
                  {option.label}
                </AppText>
                {option.id === value && <Check size={18} color={colors.primary} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TagSelector ──────────────────────────────────────────────────────────────

function TagSelector({ allTags, isLoadingTags, selectedIds, onChange, onTagCreated }: {
  allTags: TagDto[]; isLoadingTags: boolean;
  selectedIds: string[]; onChange: (ids: string[]) => void;
  onTagCreated: (tag: TagDto) => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filtered = useMemo(
    () => allTags.filter((t) => t.label.toLowerCase().includes(search.toLowerCase())),
    [allTags, search],
  );

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]);
  };

  const handleCreate = async () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    setIsCreating(true);
    try {
      const newTag = await tagService.createTag(trimmed);
      onTagCreated(newTag);
      onChange([...selectedIds, newTag.id]);
      setSearch('');
    } catch {
      // ignore
    } finally {
      setIsCreating(false);
    }
  };

  const exactMatch = allTags.some((t) => t.label.toLowerCase() === search.trim().toLowerCase());
  const showCreate = search.trim().length > 0 && !exactMatch;
  const selectedTags = selectedIds.map((id) => allTags.find((t) => t.id === id)).filter(Boolean) as TagDto[];

  return (
    <div style={{ marginBottom: 16 }}>
      <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>Tags</AppText>

      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          border: `2px solid ${colors.inputBorder}`, borderRadius: 4, padding: '10px 12px', minHeight: 44,
          backgroundColor: colors.inputBackground, cursor: 'pointer', fontFamily: 'inherit', gap: 8,
        }}
      >
        <Tag size={16} color={colors.textMuted} />
        <AppText variant="body" style={{ flex: 1, textAlign: 'left', color: selectedIds.length ? colors.text : colors.placeholder }}>
          {selectedIds.length > 0
            ? `${selectedIds.length} tag${selectedIds.length > 1 ? 's' : ''} sélectionné${selectedIds.length > 1 ? 's' : ''}`
            : 'Sélectionner des tags…'}
        </AppText>
        <ChevronDown size={16} color={colors.textMuted} />
      </button>

      {selectedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {selectedTags.map((tag) => (
            <button
              key={tag.id} type="button"
              onClick={() => toggle(tag.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 9999,
                backgroundColor: colors.primaryLight, border: `1px solid ${colors.primary}`, cursor: 'pointer',
              }}
            >
              <AppText variant="caption" style={{ color: colors.primary }}>{tag.label}</AppText>
              <X size={11} color={colors.primary} />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'relative', backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: `1px solid ${colors.borderLight}` }}>
              <AppText variant="h3">Tags</AppText>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={24} color={colors.textMuted} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `2px solid ${colors.inputBorder}`, borderRadius: 4, padding: '6px 10px', backgroundColor: colors.inputBackground, margin: 16 }}>
              <Search size={16} color={colors.placeholder} />
              <input
                type="text"
                placeholder="Rechercher ou créer un tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: colors.text, fontSize: 14, fontFamily: 'inherit' }}
              />
              {search.length > 0 && (
                <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={16} color={colors.textMuted} />
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {showCreate && (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${colors.borderLight}`, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {isCreating
                    ? <span style={{ width: 20, height: 20, border: `2px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
                    : <PlusCircle size={20} color={colors.primary} />
                  }
                  <AppText variant="body" style={{ color: colors.primary, flex: 1, textAlign: 'left' }}>Créer « {search.trim()} »</AppText>
                </button>
              )}
              {isLoadingTags
                ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><span style={{ width: 24, height: 24, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /></div>
                : filtered.length === 0 && !showCreate
                  ? <div style={{ padding: 24, textAlign: 'center' }}><AppText variant="body" muted>Aucun tag trouvé</AppText></div>
                  : filtered.map((tag) => {
                    const isSelected = selectedIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id} type="button"
                        onClick={() => toggle(tag.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', background: isSelected ? colors.primaryLight : 'none',
                          border: 'none', borderBottom: `1px solid ${colors.borderLight}`, cursor: 'pointer', fontFamily: 'inherit',
                          minHeight: 52,
                        }}
                      >
                        <AppText variant="body" style={{ flex: 1, textAlign: 'left', color: isSelected ? colors.primary : colors.text }}>
                          {tag.label}
                        </AppText>
                        {isSelected && <Check size={20} color={colors.primary} />}
                      </button>
                    );
                  })
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QuizQuestionCard ─────────────────────────────────────────────────────────

function QuizQuestionCard({ question, index, hasError, onUpdate, onDelete }: {
  question: QuizQuestion; index: number; hasError: boolean;
  onUpdate: (q: QuizQuestion) => void; onDelete: () => void;
}) {
  const { colors } = useTheme();

  const addAnswer = () => {
    if (question.answers.length >= 6) return;
    onUpdate({ ...question, answers: [...question.answers, { id: generateId(), text: '' }] });
  };

  const updateAnswer = (id: string, text: string) =>
    onUpdate({ ...question, answers: question.answers.map((a) => (a.id === id ? { ...a, text } : a)) });

  const deleteAnswer = (id: string) => {
    const next = question.answers.filter((a) => a.id !== id);
    onUpdate({ ...question, answers: next, correctAnswerId: question.correctAnswerId === id ? (next[0]?.id ?? '') : question.correctAnswerId });
  };

  return (
    <div style={{ borderRadius: 8, border: `1.5px solid ${hasError ? colors.error : colors.border}`, backgroundColor: colors.surface, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${colors.borderLight}` }}>
        <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AppText style={{ color: colors.primary, fontSize: 11, fontWeight: 700 }}>{index + 1}</AppText>
        </div>
        <AppText variant="label" style={{ flex: 1, marginLeft: 8 }}>Question {index + 1}</AppText>
        <button type="button" onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Trash2 size={17} color={colors.error} />
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <AppTextInput
          label="Énoncé"
          placeholder="Ex : Quelle est la capitale de la France ?"
          value={question.question}
          onChange={(e) => onUpdate({ ...question, question: e.target.value })}
          multiline
        />
        <AppText variant="label" style={{ display: 'block', marginBottom: 8 }}>
          Réponses <AppText variant="caption" muted>— cliquez pour marquer la bonne réponse</AppText>
        </AppText>
        {question.answers.map((answer, i) => {
          const isCorrect = answer.id === question.correctAnswerId;
          return (
            <div
              key={answer.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1.5px solid ${isCorrect ? colors.primary : colors.border}`, borderRadius: 4, padding: '6px 10px', marginBottom: 6, backgroundColor: isCorrect ? colors.primaryLight : colors.inputBackground, cursor: 'pointer' }}
              onClick={() => onUpdate({ ...question, correctAnswerId: answer.id })}
            >
              <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${isCorrect ? colors.primary : colors.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isCorrect && <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />}
              </div>
              <input
                type="text"
                placeholder={`Réponse ${i + 1}…`}
                value={answer.text}
                onChange={(e) => { e.stopPropagation(); updateAnswer(answer.id, e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: colors.text, fontSize: 14, fontFamily: 'inherit' }}
              />
              {question.answers.length > 2 && (
                <button type="button" onClick={(e) => { e.stopPropagation(); deleteAnswer(answer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                  <X size={18} color={isCorrect ? colors.primary : colors.textMuted} />
                </button>
              )}
            </div>
          );
        })}
        {question.answers.length < 6 && (
          <button type="button" onClick={addAnswer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', border: `1px dashed ${colors.primary}`, borderRadius: 4, padding: 8, background: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
            <Plus size={16} color={colors.primary} />
            <AppText variant="caption" style={{ color: colors.primary }}>Ajouter une réponse</AppText>
          </button>
        )}
      </div>
    </div>
  );
}

function QuizQuestionsBuilder({ questions, onChange, error }: { questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void; error?: string; }) {
  const { colors } = useTheme();

  const firstErrorIndex = error
    ? questions.findIndex((q) => !q.question.trim() || q.answers.filter((a) => a.text.trim()).length < 2 || !q.answers.find((a) => a.id === q.correctAnswerId && a.text.trim()))
    : -1;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <AppText variant="h3">Questions du quiz</AppText>
        <div style={{ minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
          <AppText style={{ color: colors.textOnPrimary, fontSize: 11, fontWeight: 700 }}>{questions.length}</AppText>
        </div>
      </div>
      <AppText variant="caption" muted style={{ display: 'block', marginBottom: 16 }}>Ajoutez au moins 1 question avec 2 réponses possibles.</AppText>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${colors.error}`, borderRadius: 4, padding: 8, marginBottom: 12, backgroundColor: colors.errorLight ?? '#FFF0F0' }}>
          <AlertCircle size={16} color={colors.error} />
          <AppText variant="caption" style={{ color: colors.error, flex: 1 }}>{error}</AppText>
        </div>
      )}
      {questions.map((q, i) => (
        <QuizQuestionCard
          key={q.id} question={q} index={i}
          hasError={!!error && i === firstErrorIndex}
          onUpdate={(updated) => { const next = [...questions]; next[i] = updated; onChange(next); }}
          onDelete={() => { if (questions.length <= 1) return; onChange(questions.filter((_, j) => j !== i)); }}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...questions, makeDefaultQuestion()])}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: `1.5px dashed ${colors.primary}`, borderRadius: 8, padding: 12, backgroundColor: colors.primaryLight, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <PlusCircle size={20} color={colors.primary} />
        <AppText variant="body" style={{ color: colors.primary, fontWeight: '600' }}>Ajouter une question</AppText>
      </button>
    </div>
  );
}

// ─── PollOptionsBuilder ───────────────────────────────────────────────────────

function PollOptionsBuilder({ options, onChange, error }: { options: PollOption[]; onChange: (opts: PollOption[]) => void; error?: string; }) {
  const { colors } = useTheme();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <AppText variant="h3">Options du sondage</AppText>
        <div style={{ minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
          <AppText style={{ color: colors.textOnPrimary, fontSize: 11, fontWeight: 700 }}>{options.length}</AppText>
        </div>
      </div>
      <AppText variant="caption" muted style={{ display: 'block', marginBottom: 16 }}>Proposez entre 2 et 10 choix aux participants.</AppText>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${colors.error}`, borderRadius: 4, padding: 8, marginBottom: 12, backgroundColor: colors.errorLight ?? '#FFF0F0' }}>
          <AlertCircle size={16} color={colors.error} />
          <AppText variant="caption" style={{ color: colors.error, flex: 1 }}>{error}</AppText>
        </div>
      )}
      <div style={{ border: `1.5px solid ${error ? colors.error : colors.border}`, borderRadius: 8, backgroundColor: colors.surface, overflow: 'hidden', marginBottom: 8 }}>
        {options.map((option, i) => (
          <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: i < options.length - 1 ? `1px solid ${colors.borderLight}` : 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AppText style={{ color: colors.primary, fontSize: 11, fontWeight: 700 }}>{i + 1}</AppText>
            </div>
            <input
              type="text"
              placeholder={`Option ${i + 1}…`}
              value={option.text}
              onChange={(e) => onChange(options.map((o) => (o.id === option.id ? { ...o, text: e.target.value } : o)))}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: colors.text, fontSize: 14, fontFamily: 'inherit', padding: '4px 0' }}
            />
            {options.length > 2 && (
              <button type="button" onClick={() => onChange(options.filter((o) => o.id !== option.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                <X size={18} color={colors.textMuted} />
              </button>
            )}
          </div>
        ))}
      </div>
      {options.length < 10 && (
        <button
          type="button"
          onClick={() => onChange([...options, { id: generateId(), text: '' }])}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: `1.5px dashed ${colors.primary}`, borderRadius: 8, padding: 12, backgroundColor: colors.primaryLight, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <PlusCircle size={20} color={colors.primary} />
          <AppText variant="body" style={{ color: colors.primary, fontWeight: '600' }}>Ajouter une option</AppText>
        </button>
      )}
    </div>
  );
}

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  title: string; description: string; typeId: string; confidentialityTypeId: string;
  tags: string[]; isVirtual: boolean; dateStart: string; dateEnd: string;
  location: string; eventLink: string; content: string;
  thumbnail: File | null; quizQuestions: QuizQuestion[]; pollOptions: PollOption[];
}

interface FormErrors {
  title?: string; description?: string; typeId?: string; confidentialityTypeId?: string;
  dateStart?: string; dateEnd?: string; location?: string; content?: string;
  quizQuestions?: string; pollOptions?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateResourcePage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => ({
    title: '', description: '', typeId: '', confidentialityTypeId: '',
    tags: [], isVirtual: false, dateStart: '', dateEnd: '',
    location: '', eventLink: '', content: '',
    thumbnail: null, quizQuestions: [makeDefaultQuestion()], pollOptions: makeDefaultOptions(),
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [localTags, setLocalTags] = useState<TagDto[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const { data: resourceTypes, isLoading: loadingTypes } = useQuery(['resource-types'], () => resourceService.getResourceTypes());
  const { data: confidentialityTypes, isLoading: loadingConfTypes } = useQuery(['confidentiality-types'], () => resourceService.getConfidentialityTypes());
  const { data: statuses, isLoading: isLoadingStatuses, refetch: refetchStatuses } = useQuery(['resource-statuses'], () => resourceService.getStatuses());
  const { data: tagsData, isLoading: loadingTags } = useQuery(['tags-list'], () => tagService.getTags({ size: 50 }));

  const allTags: TagDto[] = useMemo(() => {
    const base = Array.isArray(tagsData) ? tagsData : [];
    const localIds = new Set(localTags.map((t) => t.id));
    return [...base.filter((t) => !localIds.has(t.id)), ...localTags];
  }, [tagsData, localTags]);

  const selectedType = resourceTypes?.find((t) => t.id === form.typeId);
  const typeLabel = selectedType?.label ?? '';
  const isEventType = isEventLabel(typeLabel);
  const isArticleType = isArticleLabel(typeLabel);
  const isQuizType = isQuizLabel(typeLabel);
  const isPollType = isPollLabel(typeLabel);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setField('thumbnail', file);
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const validateStep = (): boolean => {
    const next: FormErrors = {};
    if (step === 0) {
      if (!form.title.trim()) next.title = 'Le titre est requis.';
      if (!form.description.trim()) next.description = 'La description est requise.';
    } else if (step === 1) {
      if (!form.typeId) next.typeId = 'Le type de ressource est requis.';
      if (!form.confidentialityTypeId) next.confidentialityTypeId = 'La confidentialité est requise.';
    } else if (step === 2 && isEventType) {
      if (!form.dateStart) next.dateStart = 'La date de début est requise.';
      if (!form.dateEnd) next.dateEnd = 'La date de fin est requise.';
      if (!form.isVirtual && !form.location.trim()) next.location = 'Le lieu est requis.';
    } else if (step === 2 && isArticleType) {
      if (!form.content.trim()) next.content = 'Le contenu est requis.';
    } else if (step === 2 && isQuizType) {
      if (form.quizQuestions.length === 0) {
        next.quizQuestions = 'Ajoutez au moins une question.';
      } else {
        for (const q of form.quizQuestions) {
          if (!q.question.trim()) { next.quizQuestions = 'Chaque question doit avoir un énoncé.'; break; }
          if (q.answers.filter((a) => a.text.trim()).length < 2) { next.quizQuestions = 'Chaque question doit avoir au moins 2 réponses remplies.'; break; }
          if (!q.answers.find((a) => a.id === q.correctAnswerId && a.text.trim())) { next.quizQuestions = 'Sélectionnez la bonne réponse pour chaque question.'; break; }
        }
      }
    } else if (step === 2 && isPollType) {
      if (form.pollOptions.filter((o) => o.text.trim()).length < 2) next.pollOptions = 'Renseignez au moins 2 options.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const { mutate: createEvent, isLoading: isSubmittingEvent } = useMutation((payload: CreateEventPayload) => eventService.createEvent(payload));
  const { mutate: createArticle, isLoading: isSubmittingArticle } = useMutation((payload: CreateArticlePayload) => articleService.createArticle(payload));
  const { mutate: createQuiz, isLoading: isSubmittingQuiz } = useMutation((payload: CreateQuizPayload) => quizService.createQuiz(payload));
  const { mutate: createPoll, isLoading: isSubmittingPoll } = useMutation((payload: CreatePollPayload) => pollService.createPoll(payload));

  const isSubmitting = isSubmittingEvent || isSubmittingArticle || isSubmittingQuiz || isSubmittingPoll;
  const isLastStep = step === STEPS.length - 1;

  const handleSubmit = async () => {
    if (isSubmitting || !validateStep()) return;
    const statusId = statuses?.[0]?.id ?? '';
    if (!statusId) {
      await refetchStatuses();
      setSubmitError('Impossible de récupérer le statut de publication. Réessayez dans un instant.');
      return;
    }

    setSubmitError('');
    const base = {
      title: form.title.trim(), description: form.description.trim(),
      statusId, confidentialityTypeId: form.confidentialityTypeId,
      typeId: form.typeId, tags: form.tags,
      thumbnail: form.thumbnail ?? undefined,
    };

    try {
      if (isEventType) {
        await createEvent({
          ...base, isVirtual: form.isVirtual,
          dateStart: form.dateStart, dateEnd: form.dateEnd,
          location: form.isVirtual ? (form.location.trim() || 'En ligne') : form.location.trim(),
          eventLink: form.eventLink.trim() || undefined,
        });
      } else if (isArticleType) {
        await createArticle({ ...base, content: form.content.trim() });
      } else if (isQuizType) {
        const quizResult = await createQuiz(base);
        if (quizResult) {
          for (const q of form.quizQuestions) {
            await quizService.createQuizQuestion({
              question: q.question.trim(),
              possibleAnswers: q.answers.map((a) => a.text.trim()),
              correctAnswer: q.answers.find((a) => a.id === q.correctAnswerId)?.text.trim() ?? '',
              quizzId: quizResult.id,
            });
          }
        }
      } else if (isPollType) {
        const pollResult = await createPoll(base);
        if (pollResult) {
          for (const o of form.pollOptions.filter((o) => o.text.trim())) {
            await pollService.createPollOption({ option: o.text.trim(), pollId: pollResult.id });
          }
        }
      }
      toast.success('Ressource créée avec succès !');
      navigate(-1);
    } catch {
      toast.error('Une erreur est survenue lors de la création.');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>

      <AppHeader
        title="Créer une ressource"
        showBack
        onMenuPress={() => { if (!isSubmitting) { step === 0 ? navigate(-1) : goBack(); } }}
      />

      <Stepper current={step} />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 0 }}>
        {step === 0 && (
          <div>
            <AppText variant="h3" style={{ display: 'block', marginBottom: 16 }}>Informations de base</AppText>

            <AppText variant="label" style={{ display: 'block', marginBottom: 6 }}>Image de couverture</AppText>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', height: 160, borderRadius: 4, border: `2px dashed ${colors.border}`,
                backgroundColor: colors.surface, cursor: 'pointer', marginBottom: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative', padding: 0,
              }}
            >
              {thumbnailPreview
                ? <>
                  <img src={thumbnailPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={22} color="#fff" />
                    <AppText style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Modifier</AppText>
                  </div>
                </>
                : <>
                  <ImageIcon size={32} color={colors.textLight} />
                  <AppText variant="caption" muted style={{ marginTop: 6 }}>Sélectionner une image</AppText>
                </>
              }
            </button>

            <AppTextInput label="Titre" required placeholder="Donnez un titre à votre ressource" value={form.title} onChange={(e) => setField('title', e.target.value)} error={errors.title} />
            <AppTextInput label="Description" required placeholder="Décrivez votre ressource..." value={form.description} onChange={(e) => setField('description', e.target.value)} error={errors.description} multiline />
          </div>
        )}

        {step === 1 && (
          <div>
            <AppText variant="h3" style={{ display: 'block', marginBottom: 16 }}>Catégorisation</AppText>
            {loadingTypes
              ? <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><span style={{ display: 'inline-block', width: 24, height: 24, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /></div>
              : <AppSelect label="Type de ressource" placeholder="Sélectionner un type" required options={resourceTypes ?? []} value={form.typeId || null} onChange={(id) => setField('typeId', id)} error={errors.typeId} />
            }
            {loadingConfTypes
              ? <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><span style={{ display: 'inline-block', width: 24, height: 24, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /></div>
              : <AppSelect label="Confidentialité" placeholder="Sélectionner la confidentialité" required options={confidentialityTypes ?? []} value={form.confidentialityTypeId || null} onChange={(id) => setField('confidentialityTypeId', id)} error={errors.confidentialityTypeId} />
            }
            <TagSelector allTags={allTags} isLoadingTags={loadingTags} selectedIds={form.tags} onChange={(ids) => setField('tags', ids)} onTagCreated={(tag) => setLocalTags((prev) => [...prev, tag])} />
          </div>
        )}

        {step === 2 && (
          <div>
            {!isQuizType && !isPollType && (
              <AppText variant="h3" style={{ display: 'block', marginBottom: 4 }}>
                {isEventType ? "Détails de l'événement" : isArticleType ? "Contenu de l'article" : 'Détails spécifiques'}
              </AppText>
            )}
            {!isEventType && !isArticleType && !isQuizType && !isPollType && (
              <AppText variant="body" muted style={{ display: 'block', marginTop: 8 }}>Aucun champ supplémentaire requis pour ce type de ressource.</AppText>
            )}
            {isArticleType && (
              <AppTextInput label="Contenu" required placeholder="Rédigez le contenu de votre article..." value={form.content} onChange={(e) => setField('content', e.target.value)} error={errors.content} multiline />
            )}
            {isQuizType && (
              <QuizQuestionsBuilder questions={form.quizQuestions} onChange={(qs) => setField('quizQuestions', qs)} error={errors.quizQuestions} />
            )}
            {isPollType && (
              <PollOptionsBuilder options={form.pollOptions} onChange={(opts) => setField('pollOptions', opts)} error={errors.pollOptions} />
            )}
            {isEventType && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${colors.border}`, borderRadius: 4, padding: 16, backgroundColor: colors.surface, marginBottom: 16, marginTop: 16 }}>
                  <div>
                    <AppText variant="label" style={{ display: 'block' }}>Événement en ligne</AppText>
                    <AppText variant="caption" muted>L'événement se déroule à distance</AppText>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <div
                      onClick={() => setField('isVirtual', !form.isVirtual)}
                      style={{
                        width: 44, height: 24, borderRadius: 12,
                        backgroundColor: form.isVirtual ? colors.primary : colors.border,
                        position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 2, left: form.isVirtual ? 22 : 2, width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', transition: 'left 0.2s' }} />
                    </div>
                  </label>
                </div>

                {!form.isVirtual && (
                  <AppTextInput label="Lieu" required placeholder="Ex: Salle A, 12 rue de la Paix, Paris" value={form.location} onChange={(e) => setField('location', e.target.value)} error={errors.location} />
                )}
                {form.isVirtual && (
                  <AppTextInput label="Lien de l'événement" placeholder="https://meet.example.com/..." value={form.eventLink} onChange={(e) => setField('eventLink', e.target.value)} type="url" />
                )}

                <div style={{ marginBottom: 16 }}>
                  <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>Date de début <span style={{ color: colors.error }}>*</span></AppText>
                  <input
                    type="datetime-local"
                    value={form.dateStart}
                    onChange={(e) => { setField('dateStart', e.target.value); setErrors((p) => ({ ...p, dateStart: undefined })); }}
                    style={{ width: '100%', border: `2px solid ${errors.dateStart ? colors.error : colors.inputBorder}`, borderRadius: 4, padding: '10px 12px', backgroundColor: colors.inputBackground, color: colors.text, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  {errors.dateStart && <AppText variant="caption" style={{ color: colors.error, display: 'block', marginTop: 4 }}>{errors.dateStart}</AppText>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>Date de fin <span style={{ color: colors.error }}>*</span></AppText>
                  <input
                    type="datetime-local"
                    value={form.dateEnd}
                    onChange={(e) => { setField('dateEnd', e.target.value); setErrors((p) => ({ ...p, dateEnd: undefined })); }}
                    style={{ width: '100%', border: `2px solid ${errors.dateEnd ? colors.error : colors.inputBorder}`, borderRadius: 4, padding: '10px 12px', backgroundColor: colors.inputBackground, color: colors.text, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  {errors.dateEnd && <AppText variant="caption" style={{ color: colors.error, display: 'block', marginTop: 4 }}>{errors.dateEnd}</AppText>}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.borderLight}`, backgroundColor: colors.background }}>
        <AppAlert type="error" message={submitError} visible={!!submitError} />
        {step === 0
          ? <AppButton label="Suivant" onClick={goNext} />
          : (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><AppButton label="Précédent" onClick={goBack} variant="secondary" disabled={isSubmitting} /></div>
              <div style={{ flex: 1 }}><AppButton label={isLastStep ? 'Créer' : 'Suivant'} onClick={isLastStep ? handleSubmit : goNext} loading={isLastStep && (isSubmitting || isLoadingStatuses)} disabled={isSubmitting || (isLastStep && isLoadingStatuses)} /></div>
            </div>
          )
        }
      </div>
    </div>
  );
}
