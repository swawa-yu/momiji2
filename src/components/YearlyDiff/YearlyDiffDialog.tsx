import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { yearlyDiffSummary } from '../../subject/yearlyDiffSummary';

type Props = { open: boolean; onClose: () => void };

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year}年${month}月${day}日`;
};

const countItems = (counts: Record<string, number>) =>
  Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([, left], [, right]) => right - left);

export default function YearlyDiffDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>年度間のシラバス変更概要</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            年度間の同じ講義コードは比較候補であり、同一授業とは断定しません。講義コードや年度などの値はNFKC等の正規化をしていません。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            この概要には変更前後のraw値や講義一覧は含まれないため、個別の講義diffは表示できません。最新情報はMyもみじで確認してください。
          </Typography>
          {yearlyDiffSummary.pairs.map((pair) => (
            <Box
              key={`${pair.baseline.retrievedAt}-${pair.incoming.retrievedAt}`}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                {pair.baseline.academicYear} → {pair.incoming.academicYear}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                取得日：{formatDate(pair.baseline.retrievedAt)} →{' '}
                {formatDate(pair.incoming.retrievedAt)}
              </Typography>
              {pair.warnings.length > 0 && (
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {pair.warnings.map((item) => (
                    <Alert severity="warning" key={item.code}>
                      {item.message}（観測値：
                      {item.observed === null
                        ? '算出不能（共通科目なし）'
                        : item.observed.toFixed(3)}
                      、閾値：{item.threshold.toFixed(2)}）
                    </Alert>
                  ))}
                </Stack>
              )}
              <Grid container spacing={1} sx={{ mb: 1.5 }}>
                <Grid item xs={12} sm={4}>
                  <Chip
                    label={`追加 ${pair.display.counts.added}`}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip
                    label={`削除 ${pair.display.counts.removed}`}
                    color="error"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip
                    label={`内容変更 ${pair.display.counts.changed}`}
                    color="warning"
                  />
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ mb: 1 }}>
                年度・URLのみの変更：{pair.display.metadataOnlyChanged}件
              </Typography>
              <Typography variant="subtitle2">内容変更の項目別件数</Typography>
              <Stack
                component="ul"
                spacing={0.25}
                sx={{ pl: 2, mt: 0.5, mb: 0 }}
              >
                {countItems(pair.display.fieldChangeCounts).map(
                  ([field, count]) => (
                    <Typography component="li" variant="body2" key={field}>
                      {field}：{count}件
                    </Typography>
                  )
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
