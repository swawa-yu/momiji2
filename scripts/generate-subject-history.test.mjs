import assert from 'node:assert/strict';
import test from 'node:test';

import { renderSubjectHistory } from './generate-subject-history.mjs';

test('renders a typed empty state deterministically', () => {
  const rendered = renderSubjectHistory([]);
  assert.match(
    rendered,
    /export const subjectHistory: readonly SubjectHistoryEntry\[\] = \[\]/
  );
  assert.match(rendered, /SubjectHistoryEntry/);
  assert.equal(rendered, renderSubjectHistory([]));
});

test('preserves raw before and after values in display data', () => {
  const entry = {
    academicYear: '2026年度',
    baseRetrievedAt: '2026-04-01',
    targetRetrievedAt: '2026-04-02',
    baseSubjectCount: 1,
    targetSubjectCount: 1,
    addedCount: 0,
    removedCount: 0,
    changedCount: 1,
    changes: [
      {
        type: 'changed',
        lectureCode: '10000100',
        titleBefore: '講義',
        titleAfter: '講義',
        fields: [{ field: 'メッセージ', before: '前\nの値', after: '後 の値' }],
      },
    ],
  };
  const rendered = renderSubjectHistory([entry]);
  assert.match(rendered, /前\\nの値/);
  assert.match(rendered, /後 の値/);
  assert.match(rendered, /"type": "changed"/);
});
