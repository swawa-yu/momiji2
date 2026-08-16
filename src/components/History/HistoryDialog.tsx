import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  subjectHistory,
  type SubjectHistoryChange,
} from '../../subject/activeSubjectHistory';

type Props = {
  open: boolean;
  onClose: () => void;
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year}年${month}月${day}日`;
};

const changeLabel = (change: SubjectHistoryChange) => {
  if (change.type === 'added') return '追加';
  if (change.type === 'removed') return '削除';
  return '変更';
};

const changeColor = (change: SubjectHistoryChange) => {
  if (change.type === 'added') return 'success' as const;
  if (change.type === 'removed') return 'error' as const;
  return 'warning' as const;
};

const displayValue = (value: string) => (value === '' ? '（空）' : value);

export default function HistoryDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>同一年度内のシラバス更新履歴</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          取得時点の間で変化したrawデータを表示します。表記ゆれ等を抑制した差分ではありません。
        </Typography>

        {subjectHistory.length === 0 ? (
          <Typography>同一年度内の更新履歴はまだありません。</Typography>
        ) : (
          <Stack spacing={2}>
            {subjectHistory.map((entry) => (
              <Box
                component="details"
                key={`${entry.academicYear}-${entry.targetRetrievedAt}`}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Typography component="summary" sx={{ cursor: 'pointer' }}>
                  <strong>{entry.academicYear}</strong>：
                  {formatDate(entry.baseRetrievedAt)} →{' '}
                  {formatDate(entry.targetRetrievedAt)}
                  （追加 {entry.addedCount}・削除 {entry.removedCount}・変更{' '}
                  {entry.changedCount}）
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {entry.changes.map((change) => (
                    <Box
                      component="details"
                      key={`${entry.targetRetrievedAt}-${change.lectureCode}`}
                      sx={{ pl: 1 }}
                    >
                      <Box
                        component="summary"
                        sx={{ cursor: 'pointer', listStylePosition: 'inside' }}
                      >
                        <Chip
                          label={changeLabel(change)}
                          color={changeColor(change)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography component="span" variant="body2">
                          {change.lectureCode}：
                          {change.titleAfter ??
                            change.titleBefore ??
                            '科目名なし'}
                        </Typography>
                      </Box>

                      {change.type === 'changed' && (
                        <Stack spacing={1.5} sx={{ mt: 1.5, ml: 2 }}>
                          {change.fields.map((field) => (
                            <Box key={field.field}>
                              <Typography variant="subtitle2">
                                {field.field}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                変更前
                              </Typography>
                              <Typography
                                component="pre"
                                variant="body2"
                                sx={{
                                  whiteSpace: 'pre-wrap',
                                  overflowWrap: 'anywhere',
                                  m: 0,
                                }}
                              >
                                {displayValue(field.before)}
                              </Typography>
                              <Divider sx={{ my: 0.75 }} />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                変更後
                              </Typography>
                              <Typography
                                component="pre"
                                variant="body2"
                                sx={{
                                  whiteSpace: 'pre-wrap',
                                  overflowWrap: 'anywhere',
                                  m: 0,
                                }}
                              >
                                {displayValue(field.after)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
