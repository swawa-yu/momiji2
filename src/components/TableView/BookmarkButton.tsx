import { useContext } from 'react';
import { BookmarkContext, BookmarkContextType } from '../../contexts/BookmarkContext.tsx';
import IconButton from '@mui/material/IconButton'; // ★ IconButton をインポート
import StarIcon from '@mui/icons-material/Star';       // ★ 塗りつぶし星アイコン
import StarBorderIcon from '@mui/icons-material/StarBorder'; // ★ 枠線星アイコン

const BookmarkButton = ({ lectureCode }: { lectureCode: string }) => {
    const { bookmarkedSubjects, handleBookmarkToggle } = useContext<BookmarkContextType>(BookmarkContext);
    const isBookmarked = bookmarkedSubjects.has(lectureCode);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // IconButton がテーブルの行クリックイベントなどを誘発しないように念のため止める
        event.stopPropagation();
        handleBookmarkToggle(lectureCode);
    };

    return (
        // ★ div の代わりに IconButton を使用
        <IconButton
            aria-label={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"} // スクリーンリーダー用ラベル
            onClick={handleClick}
            size="small" // ボタンサイズ (small, medium, large)
            sx={{ padding: '0px' }} // 必要に応じてパディング調整
        >
            {/* ★ isBookmarked の状態に応じて表示するアイコンを切り替え */}
            {isBookmarked
                ? <StarIcon sx={{ color: 'gold' }} /> // ブックマーク済み: 塗りつぶし星 (色指定)
                : <StarBorderIcon sx={{ color: 'action.active' }} /> // 未ブックマーク: 枠線星 (テーマの色を使う例)
            }
        </IconButton>
    );
};

export default BookmarkButton;