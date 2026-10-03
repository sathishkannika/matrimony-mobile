import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import {
  acceptInterest,
  cancelInterest,
  rejectInterest,
  sendInterest,
} from '../api/interests';
import { getProfileRelationsBatch } from '../api/profiles';
import { addShortlist, removeShortlist } from '../api/shortlists';
import { ApiError } from '../api/client';
import { useToast } from '../../components/ui/toast';
import type { InterestStatus } from '../../types/api';

export type InterestLockStatus = Extract<InterestStatus, 'PENDING' | 'ACCEPTED'> | 'RECEIVED';

export function useOptimisticActions(onSuccess?: () => void) {
  const { toast } = useToast();
  const [pendingInterest, setPendingInterest] = useState<Set<number>>(new Set());
  const [sentInterest, setSentInterest] = useState<Set<number>>(new Set());
  const [receivedInterest, setReceivedInterest] = useState<Set<number>>(new Set());
  const [acceptedInterest, setAcceptedInterest] = useState<Set<number>>(new Set());
  const [pendingShortlist, setPendingShortlist] = useState<Set<number>>(new Set());
  const [shortlisted, setShortlisted] = useState<Set<number>>(new Set());

  const mark = (setter: Dispatch<SetStateAction<Set<number>>>, id: number, on: boolean) => {
    setter((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const hydrateLocksForProfiles = useCallback(async (profileIds: number[]) => {
    const unique = [...new Set(profileIds.filter((id) => Number.isFinite(id) && id > 0))];
    if (unique.length === 0) return;
    try {
      const { relations } = await getProfileRelationsBatch(unique);
      setSentInterest((prev) => {
        const next = new Set(prev);
        for (const [id, rel] of Object.entries(relations)) {
          const pid = Number(id);
          if (rel.interestStatus === 'PENDING') next.add(pid);
          else next.delete(pid);
        }
        return next;
      });
      setReceivedInterest((prev) => {
        const next = new Set(prev);
        for (const [id, rel] of Object.entries(relations)) {
          const pid = Number(id);
          if (rel.interestStatus === 'RECEIVED') next.add(pid);
          else next.delete(pid);
        }
        return next;
      });
      setAcceptedInterest((prev) => {
        const next = new Set(prev);
        for (const [id, rel] of Object.entries(relations)) {
          const pid = Number(id);
          if (rel.interestStatus === 'ACCEPTED') next.add(pid);
          else next.delete(pid);
        }
        return next;
      });
      setShortlisted((prev) => {
        const next = new Set(prev);
        for (const [id, rel] of Object.entries(relations)) {
          const pid = Number(id);
          if (rel.shortlisted) next.add(pid);
          else next.delete(pid);
        }
        return next;
      });
    } catch {
      /* API still enforces locks on send */
    }
  }, []);

  const isInterestLocked = useCallback(
    (profileId: number) =>
      pendingInterest.has(profileId) ||
      sentInterest.has(profileId) ||
      receivedInterest.has(profileId) ||
      acceptedInterest.has(profileId),
    [pendingInterest, sentInterest, receivedInterest, acceptedInterest],
  );

  const getInterestLockStatus = useCallback(
    (profileId: number): InterestLockStatus | null => {
      if (acceptedInterest.has(profileId)) return 'ACCEPTED';
      if (receivedInterest.has(profileId)) return 'RECEIVED';
      if (sentInterest.has(profileId) || pendingInterest.has(profileId)) return 'PENDING';
      return null;
    },
    [acceptedInterest, receivedInterest, sentInterest, pendingInterest],
  );

  const handleSendInterest = useCallback(
    async (profileId: number) => {
      if (isInterestLocked(profileId)) {
        toast(
          acceptedInterest.has(profileId)
            ? 'Interest already accepted with this profile'
            : receivedInterest.has(profileId)
              ? 'This profile already sent you an interest — respond from the Interests page'
              : 'Interest request already pending',
          'info',
        );
        return;
      }
      mark(setPendingInterest, profileId, true);
      mark(setSentInterest, profileId, true);
      try {
        await sendInterest(profileId);
        toast('Interest sent', 'success');
        onSuccess?.();
      } catch (err) {
        mark(setSentInterest, profileId, false);
        const message = err instanceof ApiError ? err.message : 'Could not send interest';
        if (/accepted/i.test(message)) {
          mark(setAcceptedInterest, profileId, true);
        }
        toast(message, 'error');
      } finally {
        mark(setPendingInterest, profileId, false);
      }
    },
    [isInterestLocked, acceptedInterest, receivedInterest, onSuccess, toast],
  );

  const handleShortlist = useCallback(
    async (profileId: number) => {
      if (pendingShortlist.has(profileId)) return;
      const already = shortlisted.has(profileId);
      mark(setPendingShortlist, profileId, true);
      mark(setShortlisted, profileId, !already);
      try {
        if (already) {
          await removeShortlist(profileId);
          toast('Removed from shortlist', 'info');
        } else {
          await addShortlist(profileId);
          toast('Added to shortlist', 'success');
        }
        onSuccess?.();
      } catch (err) {
        mark(setShortlisted, profileId, already);
        toast(err instanceof ApiError ? err.message : 'Shortlist update failed', 'error');
      } finally {
        mark(setPendingShortlist, profileId, false);
      }
    },
    [pendingShortlist, shortlisted, onSuccess, toast],
  );

  const handleAcceptInterest = useCallback(
    async (interestId: number, rollback: () => void, otherProfileId?: number) => {
      try {
        await acceptInterest(interestId);
        if (otherProfileId != null) {
          mark(setAcceptedInterest, otherProfileId, true);
          mark(setSentInterest, otherProfileId, false);
          mark(setReceivedInterest, otherProfileId, false);
        }
        toast('Interest accepted', 'success');
        onSuccess?.();
      } catch (err) {
        rollback();
        toast(err instanceof ApiError ? err.message : 'Accept failed', 'error');
      }
    },
    [onSuccess, toast],
  );

  const handleRejectInterest = useCallback(
    async (interestId: number, rollback: () => void) => {
      try {
        await rejectInterest(interestId);
        toast('Interest declined', 'info');
        onSuccess?.();
      } catch (err) {
        rollback();
        toast(err instanceof ApiError ? err.message : 'Reject failed', 'error');
      }
    },
    [onSuccess, toast],
  );

  const handleCancelInterest = useCallback(
    async (interestId: number, rollback: () => void, otherProfileId?: number) => {
      try {
        await cancelInterest(interestId);
        if (otherProfileId != null) {
          mark(setSentInterest, otherProfileId, false);
        }
        toast('Interest cancelled', 'info');
        onSuccess?.();
      } catch (err) {
        rollback();
        toast(err instanceof ApiError ? err.message : 'Cancel failed', 'error');
      }
    },
    [onSuccess, toast],
  );

  return {
    pendingInterest,
    sentInterest,
    receivedInterest,
    acceptedInterest,
    pendingShortlist,
    shortlisted,
    hydrateLocksForProfiles,
    isInterestLocked,
    getInterestLockStatus,
    handleSendInterest,
    handleShortlist,
    handleAcceptInterest,
    handleRejectInterest,
    handleCancelInterest,
  };
}
