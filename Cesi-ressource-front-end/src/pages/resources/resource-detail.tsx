import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Globe, MapPin, Link2, Calendar, Bookmark, BookmarkCheck, Eye, AlertCircle, FileText, Check, X, Trophy, BarChart2, Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { AppText } from '@/components/ui/AppText';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/layout/AppHeader';
import { useQuery } from '@/hooks/useQuery';
import { eventService } from '@/services/event.service';
import { articleService } from '@/services/article.service';
import { quizService } from '@/services/quiz.service';
import { pollService } from '@/services/poll.service';
import { progressionService } from '@/services/progression.service';
import type { ApiEvent, ApiArticle, ApiResource, ApiPoll, ApiPollOption, ApiQuizzQuestion } from '@/types/resource.types';

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
  return n.includes('sondage') || n.includes('poll');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── EventDetail ──────────────────────────────────────────────────────────────

function EventDetail({ event }: { event: ApiEvent }) {
  const { colors } = useTheme();
  const rows = [
    { icon: event.is_virtual ? <Globe size={18} color={colors.primary} /> : <MapPin size={18} color={colors.primary} />, text: event.is_virtual ? 'Événement en ligne' : event.location },
    ...(event.is_virtual && event.event_link ? [{ icon: <Link2 size={18} color={colors.primary} />, text: event.event_link }] : []),
    { icon: <Calendar size={18} color={colors.primary} />, label: 'Début', text: formatDate(event.date_start) },
    { icon: <Calendar size={18} color={colors.info} />, label: 'Fin', text: formatDate(event.date_end) },
  ];
  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>{row.icon}</div>
          <div>
            {'label' in row && <AppText variant="caption" muted style={{ display: 'block' }}>{row.label}</AppText>}
            <AppText variant="body">{row.text}</AppText>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ArticleDetail ────────────────────────────────────────────────────────────

function ArticleDetail({ article }: { article: ApiArticle }) {
  const { colors } = useTheme();
  return (
    <div style={{ padding: 16, borderRadius: 4, border: `1px solid ${colors.borderLight}`, backgroundColor: colors.surface }}>
      <AppText variant="body" style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{article.content}</AppText>
    </div>
  );
}

// ─── QuizDetail ───────────────────────────────────────────────────────────────

function QuizDetail({ questions, userId }: { questions: ApiQuizzQuestion[]; userId: string }) {
  const { colors } = useTheme();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const parsed = useMemo(() =>
    questions.map((q) => ({
      ...q,
      parsedAnswers: (() => { try { return JSON.parse(q.possible_answers) as string[]; } catch { return [] as string[]; } })(),
    })),
  [questions]);

  const allAnswered = parsed.length > 0 && parsed.every((q) => answers[q.id] !== undefined);
  const score = submitted ? parsed.filter((q) => answers[q.id] === q.correct_answer).length : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await Promise.all(questions.map((q) => quizService.participateInQuestion(q.id, userId)));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (parsed.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, border: `1px solid ${colors.borderLight}`, borderRadius: 8, backgroundColor: colors.surface }}>
        <FileText size={32} color={colors.textLight} />
        <AppText variant="body" muted center style={{ marginTop: 8 }}>Aucune question disponible.</AppText>
      </div>
    );
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {parsed.map((q, i) => (
        <div key={q.id} style={{ borderRadius: 8, border: `1px solid ${colors.border}`, backgroundColor: colors.surface, padding: 16, marginBottom: 12 }}>
          <AppText variant="label" style={{ display: 'block', marginBottom: 12 }}>{i + 1}. {q.question}</AppText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.parsedAnswers.map((answer) => {
              const isSelected = answers[q.id] === answer;
              const isCorrect = submitted && answer === q.correct_answer;
              const isWrong = submitted && isSelected && answer !== q.correct_answer;
              return (
                <button
                  key={answer}
                  type="button"
                  disabled={submitted}
                  onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [q.id]: answer }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    border: `1.5px solid ${isCorrect ? colors.success : isWrong ? colors.error : isSelected ? colors.primary : colors.border}`,
                    borderRadius: 4, padding: '8px 12px',
                    backgroundColor: isCorrect ? colors.successLight : isWrong ? '#FFF0F0' : isSelected ? colors.primaryLight : colors.inputBackground,
                    cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${isCorrect ? colors.success : isWrong ? colors.error : isSelected ? colors.primary : colors.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isCorrect ? colors.success : isWrong ? colors.error : colors.primary }} />}
                  </div>
                  <AppText variant="body" style={{ flex: 1 }}>{answer}</AppText>
                  {submitted && isCorrect && <Check size={18} color={colors.success} />}
                  {submitted && isWrong && <X size={18} color={colors.error} />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: `1px solid ${colors.primary}`, borderRadius: 8, padding: 16, backgroundColor: colors.primaryLight }}>
          <Trophy size={28} color={colors.primary} />
          <AppText variant="h3" style={{ color: colors.primary }}>{score} / {parsed.length}</AppText>
          <AppText variant="caption" muted>bonnes réponses</AppText>
        </div>
      ) : (
        <AppButton label="Soumettre mes réponses" onClick={handleSubmit} loading={submitting} disabled={!allAnswered || submitting} />
      )}
    </div>
  );
}

// ─── PollDetail ───────────────────────────────────────────────────────────────

function PollDetail({ options, poll }: { options: ApiPollOption[]; poll: ApiPoll }) {
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  const handleVote = async () => {
    if (!selectedId) return;
    setVoting(true);
    try {
      await pollService.voteForOption(selectedId);
      setVoted(true);
    } finally {
      setVoting(false);
    }
  };

  if (options.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, border: `1px solid ${colors.borderLight}`, borderRadius: 8, backgroundColor: colors.surface }}>
        <BarChart2 size={32} color={colors.textLight} />
        <AppText variant="body" muted center style={{ marginTop: 8 }}>Aucune option disponible.</AppText>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={voted}
              onClick={() => !voted && setSelectedId(option.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                border: `1.5px solid ${isSelected ? colors.primary : colors.border}`,
                borderRadius: 4, padding: '10px 12px',
                backgroundColor: isSelected ? colors.primaryLight : colors.inputBackground,
                cursor: voted ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${isSelected ? colors.primary : colors.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSelected && <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />}
              </div>
              <AppText variant="body" style={{ flex: 1 }}>{option.option}</AppText>
            </button>
          );
        })}
      </div>
      {voted ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${colors.success}`, borderRadius: 8, padding: 12, backgroundColor: colors.successLight }}>
          <Check size={22} color={colors.success} />
          <AppText variant="body" style={{ color: colors.success }}>Vote enregistré — {poll.vote_count + 1} vote(s) au total</AppText>
        </div>
      ) : (
        <AppButton label="Voter" onClick={handleVote} loading={voting} disabled={!selectedId || voting} />
      )}
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

function ConfirmModal({ visible, title, message, confirmLabel = 'Confirmer', onConfirm, onCancel, loading }: {
  visible: boolean; title: string; message: string; confirmLabel?: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 24, width: '100%', maxWidth: 400 }}>
        <AppText variant="h3" style={{ display: 'block', marginBottom: 8 }}>{title}</AppText>
        <AppText variant="body" muted style={{ display: 'block', marginBottom: 24 }}>{message}</AppText>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AppButton label={confirmLabel} onClick={onConfirm} loading={loading} variant="danger" />
          <AppButton label="Annuler" onClick={onCancel} disabled={loading} variant="secondary" />
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }} onClick={onCancel} />
    </div>
  );
}

// ─── WatchlistSection ─────────────────────────────────────────────────────────

function ToggleRow({ iconInactive, iconActive, label, sublabel, active, activeColor, pending, onPress }: {
  iconInactive: React.ReactNode; iconActive: React.ReactNode;
  label: string; sublabel: string; active: boolean; activeColor: string; pending: boolean; onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onPress}
      disabled={pending}
      style={{ display: 'flex', alignItems: 'center', padding: 16, background: 'none', border: 'none', cursor: pending ? 'not-allowed' : 'pointer', width: '100%', fontFamily: 'inherit', textAlign: 'left', opacity: pending ? 0.7 : 1 }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, backgroundColor: active ? activeColor + '22' : colors.backgroundAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {pending
          ? <span style={{ display: 'inline-block', width: 20, height: 20, border: `2px solid ${active ? activeColor : colors.textMuted}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          : (active ? iconActive : iconInactive)
        }
      </div>
      <div style={{ flex: 1, marginLeft: 16 }}>
        <AppText variant="label" style={{ color: active ? activeColor : colors.text, display: 'block' }}>{label}</AppText>
        <AppText variant="caption" muted>{sublabel}</AppText>
      </div>
      <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${active ? activeColor : colors.border}`, backgroundColor: active ? activeColor : 'transparent', flexShrink: 0 }} />
    </button>
  );
}

function WatchlistSection({ ressourceId, userId }: { ressourceId: string; userId: string }) {
  const { colors } = useTheme();
  const [localState, setLocalState] = useState<{ isAside: boolean; isExploited: boolean; exists: boolean } | null>(null);
  const [asidePending, setAsidePending] = useState(false);
  const [exploitedPending, setExploitedPending] = useState(false);

  const { data: progression, error: progressionError, isLoading } = useQuery(
    ['progression', ressourceId, userId],
    () => progressionService.getProgression(ressourceId, userId),
  );

  useEffect(() => {
    if (progression) {
      setLocalState({ isAside: progression.is_aside, isExploited: progression.is_exploited, exists: true });
    } else if (progressionError) {
      setLocalState({ isAside: false, isExploited: false, exists: false });
    }
  }, [progression, progressionError]);

  const toggle = async (field: 'isAside' | 'isExploited', setPending: (v: boolean) => void) => {
    if (!localState) return;
    const next = !localState[field];
    const optimistic = { ...localState, [field]: next };
    setLocalState(optimistic);
    setPending(true);
    try {
      if (!localState.exists) {
        await progressionService.createProgression(ressourceId, userId, optimistic.isAside, optimistic.isExploited);
        setLocalState((s) => s ? { ...s, exists: true } : s);
      } else {
        await progressionService.updateProgression(ressourceId, userId, optimistic.isAside, optimistic.isExploited);
      }
    } catch {
      setLocalState((s) => s ? { ...s, [field]: !next } : s);
    } finally {
      setPending(false);
    }
  };

  if (isLoading || localState === null) {
    return (
      <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
        <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>Ma progression</AppText>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <span style={{ display: 'inline-block', width: 24, height: 24, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
      <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>Ma progression</AppText>
      <div style={{ borderRadius: 8, border: `1px solid ${colors.border}`, backgroundColor: colors.surface, overflow: 'hidden' }}>
        <ToggleRow
          iconInactive={<Bookmark size={22} color={colors.textMuted} />}
          iconActive={<BookmarkCheck size={22} color={colors.primary} />}
          label="Mettre de côté" sublabel="Ajouter à ma liste de lecture"
          active={localState.isAside} activeColor={colors.primary}
          pending={asidePending} onPress={() => toggle('isAside', setAsidePending)}
        />
        <div style={{ height: 1, backgroundColor: colors.borderLight, margin: '0 16px' }} />
        <ToggleRow
          iconInactive={<Eye size={22} color={colors.textMuted} />}
          iconActive={<Eye size={22} color={colors.success} />}
          label="Marquer comme consulté" sublabel="J'ai lu / regardé cette ressource"
          active={localState.isExploited} activeColor={colors.success}
          pending={exploitedPending} onPress={() => toggle('isExploited', setExploitedPending)}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { isAuthenticated, userId } = useAuth();

  const state = location.state as { resource?: ApiResource; isOwner?: boolean } | null;
  const passedResource = state?.resource ?? null;
  const isOwner = state?.isOwner === true;
  const resourceType = passedResource?.type?.label ?? '';

  const isEvent = isEventLabel(resourceType);
  const isArticle = isArticleLabel(resourceType);
  const isQuiz = isQuizLabel(resourceType);
  const isPoll = isPollLabel(resourceType);

  const { data: eventData, isLoading: loadingEvent, error: errorEvent, refetch: refetchEvent } = useQuery(
    ['resource-detail-event', id],
    () => eventService.getEventByResourceId(id!),
    { enabled: !!id && isEvent },
  );
  const { data: articleData, isLoading: loadingArticle, error: errorArticle, refetch: refetchArticle } = useQuery(
    ['resource-detail-article', id],
    () => articleService.getArticleByResourceId(id!),
    { enabled: !!id && isArticle },
  );
  const { data: quizData, isLoading: loadingQuiz, error: errorQuiz } = useQuery(
    ['resource-detail-quiz', id],
    () => quizService.getQuizByResourceId(id!),
    { enabled: !!id && isQuiz },
  );
  const { data: pollData, isLoading: loadingPoll, error: errorPoll } = useQuery(
    ['resource-detail-poll', id],
    () => pollService.getPollByResourceId(id!),
    { enabled: !!id && isPoll },
  );

  // ─── Edit state ──────────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsVirtual, setEditIsVirtual] = useState(false);
  const [editDateStart, setEditDateStart] = useState('');
  const [editDateEnd, setEditDateEnd] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editEventLink, setEditEventLink] = useState('');

  // ─── Delete state ─────────────────────────────────────────────────────────────
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isLoading = loadingEvent || loadingArticle || loadingQuiz || loadingPoll;
  const hasError = (isEvent && errorEvent) || (isArticle && errorArticle) || (isQuiz && errorQuiz) || (isPoll && errorPoll);
  const hasFetcher = isEvent || isArticle || isQuiz || isPoll;

  const resource: ApiResource | null = eventData?.ressource ?? articleData?.ressource ?? quizData?.ressource ?? pollData?.ressource ?? passedResource ?? null;

  const enterEditMode = () => {
    if (!resource) return;
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    if (isArticle && articleData) setEditContent(articleData.content);
    if (isEvent && eventData) {
      setEditIsVirtual(eventData.is_virtual);
      setEditDateStart(eventData.date_start);
      setEditDateEnd(eventData.date_end);
      setEditLocation(eventData.location);
      setEditEventLink(eventData.event_link ?? '');
    }
    setEditMode(true);
  };

  const handleEditSubmit = async () => {
    if (!resource) return;
    setEditLoading(true);
    try {
      const ressourceBase = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        tags: resource.tags.map((t) => t.id),
        statusId: resource.status?.id ?? '',
        confidentialityTypeId: resource.confidentiality_type?.id ?? '',
        typeId: resource.type?.id ?? '',
      };
      if (isEvent && eventData) {
        await eventService.updateEvent(eventData.id, {
          id: eventData.id, isVirtual: editIsVirtual, dateStart: editDateStart, dateEnd: editDateEnd,
          eventLink: editEventLink, location: editLocation, ressourceId: resource.id, ressource: ressourceBase,
        });
        await refetchEvent();
      } else if (isArticle && articleData) {
        await articleService.updateArticle(articleData.id, { content: editContent.trim(), ressource: ressourceBase });
        await refetchArticle();
      }
      setEditMode(false);
    } catch {
      // error silently ignored — could add AppAlert here
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      if (isEvent && eventData) await eventService.deleteEvent(eventData.id);
      else if (isArticle && articleData) await articleService.deleteArticle(articleData.id);
      else if (isQuiz && quizData) await quizService.deleteQuiz(quizData.id);
      else if (isPoll && pollData) await pollService.deletePoll(pollData.id);
      navigate(-1);
    } catch {
      setConfirmDeleteVisible(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Edit mode view ───────────────────────────────────────────────────────────

  if (editMode) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: colors.surface, borderBottom: `1px solid ${colors.borderLight}` }}>
          <button onClick={() => setEditMode(false)} disabled={editLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}>
            <AppText variant="body" style={{ color: colors.textMuted }}>Annuler</AppText>
          </button>
          <AppText variant="h3" style={{ flex: 1, textAlign: 'center' }}>Modifier</AppText>
          <button onClick={handleEditSubmit} disabled={editLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontFamily: 'inherit' }}>
            {editLoading
              ? <span style={{ display: 'inline-block', width: 18, height: 18, border: `2px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              : <AppText variant="body" style={{ color: colors.primary, fontWeight: '700' }}>Sauvegarder</AppText>
            }
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: 16, paddingBottom: 32, maxWidth: 720, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <AppTextInput label="Titre" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          <AppTextInput label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} multiline required />

          {isArticle && (
            <AppTextInput label="Contenu" value={editContent} onChange={(e) => setEditContent(e.target.value)} multiline required />
          )}

          {isEvent && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${colors.border}`, borderRadius: 4, padding: 16, backgroundColor: colors.surface, marginBottom: 16 }}>
                <div>
                  <AppText variant="label" style={{ display: 'block' }}>Événement en ligne</AppText>
                </div>
                <div
                  onClick={() => setEditIsVirtual((v) => !v)}
                  style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: editIsVirtual ? colors.primary : colors.border, position: 'relative', cursor: 'pointer' }}
                >
                  <div style={{ position: 'absolute', top: 2, left: editIsVirtual ? 22 : 2, width: 20, height: 20, borderRadius: 10, backgroundColor: 'white', transition: 'left 0.2s' }} />
                </div>
              </div>
              {editIsVirtual
                ? <AppTextInput label="Lien de l'événement" value={editEventLink} onChange={(e) => setEditEventLink(e.target.value)} type="url" />
                : <AppTextInput label="Lieu" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
              }
              <div style={{ marginBottom: 16 }}>
                <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>Date de début <span style={{ color: colors.error }}>*</span></AppText>
                <input type="datetime-local" value={editDateStart} onChange={(e) => setEditDateStart(e.target.value)}
                  style={{ width: '100%', border: `2px solid ${colors.inputBorder}`, borderRadius: 4, padding: '10px 12px', backgroundColor: colors.inputBackground, color: colors.text, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>Date de fin <span style={{ color: colors.error }}>*</span></AppText>
                <input type="datetime-local" value={editDateEnd} onChange={(e) => setEditDateEnd(e.target.value)}
                  style={{ width: '100%', border: `2px solid ${colors.inputBorder}`, borderRadius: 4, padding: '10px 12px', backgroundColor: colors.inputBackground, color: colors.text, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Main view ────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (hasFetcher && isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: 48 }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: `3px solid ${colors.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        </div>
      );
    }
    if (hasFetcher && hasError && !resource) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48 }}>
          <AlertCircle size={48} color={colors.error} />
          <AppText variant="body" muted center style={{ marginTop: 16 }}>Impossible de charger la ressource.</AppText>
        </div>
      );
    }
    if (!resource) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48 }}>
          <FileText size={48} color={colors.textLight} />
          <AppText variant="body" muted center style={{ marginTop: 16 }}>Ressource introuvable.</AppText>
        </div>
      );
    }

    const specificContent = (() => {
      if (isEvent && eventData) return <EventDetail event={eventData} />;
      if (isArticle && articleData) return <ArticleDetail article={articleData} />;
      if (isQuiz && quizData) {
        if (isAuthenticated && userId) return <QuizDetail questions={quizData.questions ?? []} userId={userId} />;
        return <AppText variant="body" muted center>Connectez-vous pour participer au quiz.</AppText>;
      }
      if (isPoll && pollData) return <PollDetail options={pollData.options ?? []} poll={pollData} />;
      return null;
    })();

    return (
      <div style={{ padding: 16, paddingBottom: 32 }}>
        {resourceType && (
          <span style={{ display: 'inline-block', backgroundColor: colors.primaryLight, color: colors.primary, fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 9999, marginBottom: 12 }}>
            {resourceType}
          </span>
        )}
        <AppText variant="h2" style={{ display: 'block', marginBottom: 8 }}>{resource.title}</AppText>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {resource.confidentiality_type && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 9999, border: `1px solid ${colors.border}`, backgroundColor: colors.backgroundAlt }}>
              <AppText variant="caption" muted>{resource.confidentiality_type.label}</AppText>
            </span>
          )}
          {resource.status && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 9999, border: `1px solid ${colors.success}`, backgroundColor: colors.successLight }}>
              <AppText variant="caption" style={{ color: colors.success }}>{resource.status.label}</AppText>
            </span>
          )}
        </div>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
          <AppText variant="label" style={{ display: 'block', marginBottom: 4 }}>Description</AppText>
          <AppText variant="body" style={{ lineHeight: '1.6' }}>{resource.description}</AppText>
        </div>

        {(isEvent || isArticle || isQuiz || isPoll) && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
            <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>
              {isArticle ? 'Contenu' : isQuiz ? 'Questions' : isPoll ? 'Options' : 'Informations spécifiques'}
            </AppText>
            {specificContent}
          </div>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
            <AppText variant="label" style={{ display: 'block', marginBottom: 8 }}>Tags</AppText>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {resource.tags.map((tag) => (
                <span key={tag.id} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, border: `1px solid ${colors.primary}`, backgroundColor: colors.primaryLight }}>
                  <AppText variant="caption" style={{ color: colors.primary }}>{tag.label}</AppText>
                </span>
              ))}
            </div>
          </div>
        )}

        {isAuthenticated && userId && id && (
          <WatchlistSection ressourceId={id} userId={userId} />
        )}

        {isOwner && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${colors.borderLight}` }}>
            <AppText variant="label" style={{ display: 'block', marginBottom: 16 }}>Gérer ma ressource</AppText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(isEvent || isArticle) && (
                <button
                  onClick={enterEditMode}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 16px', border: `1px solid ${colors.primary}`, borderRadius: 4, backgroundColor: colors.primaryLight, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Pencil size={18} color={colors.primary} />
                  <AppText variant="label" style={{ color: colors.primary }}>Modifier</AppText>
                </button>
              )}
              <button
                onClick={() => setConfirmDeleteVisible(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', borderRadius: 4, backgroundColor: colors.error, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <Trash2 size={18} color="#fff" />
                <AppText variant="label" style={{ color: '#fff' }}>Supprimer</AppText>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.background, overflow: 'hidden' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <AppHeader title={resource?.title ?? 'Détails'} onMenuPress={() => navigate(-1)} showBack />
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {renderContent()}
        </div>
      </div>
      <ConfirmModal
        visible={confirmDeleteVisible}
        title="Supprimer la ressource"
        message="Cette action est irréversible. La ressource sera définitivement supprimée."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
        loading={deleteLoading}
      />
    </div>
  );
}
