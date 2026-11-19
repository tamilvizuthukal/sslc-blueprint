import { Discourse, SubjectType } from '../types';

const normalizeSubject = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase().replace(/[^a-z]/g, '');

/** Return unique discourses for one blueprint subject and exact mark value. */
export const getDiscoursesForBlueprintItem = (
  discourses: Discourse[],
  subject: SubjectType,
  marks: number,
): Discourse[] => {
  const targetSubject = normalizeSubject(subject);
  const unique = new Map<string, Discourse>();
  for (const discourse of discourses) {
    if (normalizeSubject(discourse.subject) !== targetSubject || Number(discourse.marks) !== Number(marks)) continue;
    unique.set(discourse.id, discourse);
  }
  return [...unique.values()];
};

export const getDiscoursesForSubject = (discourses: Discourse[], subject: SubjectType): Discourse[] => {
  const targetSubject = normalizeSubject(subject);
  const unique = new Map<string, Discourse>();
  for (const discourse of discourses) {
    if (normalizeSubject(discourse.subject) === targetSubject) unique.set(discourse.id, discourse);
  }
  return [...unique.values()];
};
